import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3"
import { createOrderKey, getOrder } from "./lib/orders.js"
import { s3 } from "./lib/s3.js"
import {
	DeleteRequestSchema,
	GetRequestSchema,
	type OrderQueryResponse,
	PostRequestSchema,
	PutRequestSchema,
} from "./lib/schemas.js"
import { verifyOrder } from "./lib/verify.js"

// List of allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(/,\s*/) || []
const bucketName = process.env.BUCKET_NAME

if (!bucketName) {
  throw new Error("BUCKET_NAME environment variable is required")
}

// Helper functions for responses
const successResponse = (body: Record<string, any>, statusCode = 200) => ({
  statusCode,
  body: JSON.stringify(body, bigintReplacer),
})

const errorResponse = (message: string, statusCode = 400) => ({
  statusCode,
  body: JSON.stringify({ error: message }, bigintReplacer),
})

export const handler = async (event: any) => {
  try {
    switch (event.httpMethod) {
      // Handle CORS preflight //

      case "OPTIONS": {
        const origin = event.headers.origin || event.headers.Origin
        const allowOrigin =
          origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] // fallback to first allowed origin

        return {
          statusCode: 200,
          headers: {
            "Access-Control-Allow-Origin": allowOrigin,
            "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type,Authorization",
          },
          body: "",
        }
      }

      // Query orders //

      case "GET": {
        const { data, error, success } = GetRequestSchema.safeParse(
          event.queryStringParameters || {}
        )

        if (!success) {
          return errorResponse(`Invalid request: ${error.format()}`)
        }

        // If a key is provided, get the specific order
        if (data.key) {
          const order = await getOrder(data.key, bucketName)
          return order
            ? successResponse({ key: data.key, order })
            : errorResponse("Order not found", 404)
        }

        // Otherwise, list objects
        let prefix: string | undefined
        if (data.trader) {
          prefix += `${data.trader}:`
          if (data.hyperdrive) {
            prefix += `${data.hyperdrive}:`
          }
        }
        const list = await s3.send(
          new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            ContinuationToken: data.continuationToken,
          })
        )

        // Apply hyperdrive filter if no trader available for the prefix
        if (!data.trader && data.hyperdrive) {
          list.Contents?.filter((obj) => {
            const [, hyperdrive] = obj.Key?.split(":") || []
            return hyperdrive === data.hyperdrive
          })
        }

        // Fetch full orders
        const orders: OrderQueryResponse["orders"] = []
        await Promise.all(
          list.Contents?.map(async ({ Key }) => {
            if (!Key) return
            const order = await getOrder(Key, bucketName)
            if (order) {
              orders.push({
                key: Key,
                order,
              })
            }
          }) || []
        )

        const response = {
          orders,
          hasMore: !!list.IsTruncated,
          nextContinuationToken: list.NextContinuationToken,
        } as OrderQueryResponse

        return successResponse(response)
      }

      // Create order //

      case "POST": {
        if (!event.body) {
          return errorResponse("Missing request body")
        }

        const { data, error, success } = PostRequestSchema.safeParse(
          JSON.parse(event.body)
        )

        if (!success) {
          return errorResponse(`Invalid request: ${error.format()}`)
        }

        const order = data.order
        const key = createOrderKey(order.trader, order.hyperdrive, order.salt)
        const existingOrder = await getOrder(key, bucketName)

        if (existingOrder) {
          return errorResponse("Order already exists", 409)
        }

        try {
          await verifyOrder(order)
        } catch (error: any) {
          return errorResponse(error)
        }

        // Save order
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: JSON.stringify(order, bigintReplacer),
          })
        )

        return successResponse(
          {
            message: "Order created",
            key,
            order,
          },
          201
        )
      }

      // Update order //

      case "PUT": {
        if (!event.body) {
          return errorResponse("Missing request body")
        }

        const { data, error, success } = PutRequestSchema.safeParse(
          JSON.parse(event.body)
        )

        if (!success) {
          return errorResponse(`Invalid request: ${error.format()}`)
        }

        const order = data.order
        const updatedKey = createOrderKey(
          order.trader,
          order.hyperdrive,
          order.salt
        )
        const existingOrder = await getOrder(updatedKey, bucketName)

        if (!existingOrder) {
          return errorResponse("Order not found", 404)
        }

        try {
          await verifyOrder(order)
        } catch (error: any) {
          return errorResponse(error)
        }

        // Update order
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: updatedKey,
            Body: JSON.stringify(order, bigintReplacer),
          })
        )

        return successResponse({
          message: "Order updated",
          key: updatedKey,
          order,
        })
      }

      // Cancel order //

      case "DELETE": {
        if (!event.body) {
          return errorResponse("Missing request body")
        }

        const { data, error, success } = DeleteRequestSchema.safeParse(
          JSON.parse(event.body)
        )

        if (!success) {
          return errorResponse(`Invalid request: ${error.format()}`)
        }

        const order = await getOrder(data.key, bucketName)

        if (!order) {
          return errorResponse("Order not found", 404)
        }

        try {
          await verifyOrder(order)
        } catch (error: any) {
          return errorResponse(error)
        }

        // Mark order as cancelled
        const updatedOrder = {
          ...order,
          cancelled: true,
          cancelledAt: Date.now(),
        }

        // Update order
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: data.key,
            Body: JSON.stringify(updatedOrder, bigintReplacer),
          })
        )

        return successResponse({
          message: "Order cancelled",
          key: data.key,
        })
      }

      default:
        return errorResponse("Method not allowed", 405)
    }
  } catch (error) {
    console.error("Error:", error)
    return errorResponse("Internal server error", 500)
  }
}

function bigintReplacer(key: string, value: any) {
  if (typeof value === "bigint") {
    return value.toString()
  }
  return value
}
