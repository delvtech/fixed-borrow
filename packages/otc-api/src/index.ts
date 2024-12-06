import { ListObjectsV2Command, PutObjectCommand } from "@aws-sdk/client-s3"
import { createOrderKey, getOrder } from "./lib/orders.js"
import { s3 } from "./lib/s3.js"
import {
	DeleteRequestSchema,
	type GetRequest,
	GetRequestSchema,
	type Order,
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
  body: JSON.stringify(body),
})

const errorResponse = (message: string, statusCode = 400) => ({
  statusCode,
  body: JSON.stringify({ error: message }),
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
        let req: GetRequest
        try {
          req = GetRequestSchema.parse(event.queryStringParameters || {})
        } catch (error: any) {
          return errorResponse(error, 400)
        }

        // If a key is provided, get the specific order
        if (req.key) {
          const order = await getOrder(req.key, bucketName)
          return order
            ? successResponse({ key: req.key, order })
            : errorResponse("Order not found", 404)
        }

        // Otherwise, list objects
        let prefix: string | undefined
        if (req.trader) {
          prefix += `${req.trader}:`
          if (req.hyperdrive) {
            prefix += `${req.hyperdrive}:`
          }
        }
        const list = await s3.send(
          new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            ContinuationToken: req.continuationToken,
          })
        )

        // Apply hyperdrive filter if no trader available for the prefix
        if (!req.trader && req.hyperdrive) {
          list.Contents?.filter((obj) => {
            const [, hyperdrive] = obj.Key?.split(":") || []
            return hyperdrive === req.hyperdrive
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
          return errorResponse("Missing request body", 400)
        }

        let key: string
        let order: Order
        try {
          const req = PostRequestSchema.parse(JSON.parse(event.body))
          order = req.order
          key = createOrderKey(order.trader, order.hyperdrive, order.salt)

          // Check if order exists
          const existingOrder = await getOrder(key, bucketName)
          if (existingOrder) {
            return errorResponse("Order already exists", 409)
          }

          await verifyOrder(order)
        } catch (error: any) {
          return errorResponse(error, 400)
        }

        // Save order
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: JSON.stringify(order),
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
          return errorResponse("Missing request body", 400)
        }

        let updatedKey: string
        let order: Order
        try {
          const req = PutRequestSchema.parse(JSON.parse(event.body))
          order = req.order
          updatedKey = createOrderKey(
            order.trader,
            order.hyperdrive,
            order.salt
          )

          // Check if order exists
          const existingOrder = await getOrder(updatedKey, bucketName)
          if (!existingOrder) {
            return errorResponse("Order not found", 404)
          }

          await verifyOrder(order)
        } catch (error: any) {
          return errorResponse(error, 401)
        }

        // Update order
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: updatedKey,
            Body: JSON.stringify(order),
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
          return errorResponse("Missing request body", 400)
        }

        let key: string
        let order: Order | null
        try {
          const req = DeleteRequestSchema.parse(JSON.parse(event.body))
          key = req.key

          // Get existing order
          order = await getOrder(key, bucketName)
          if (!order) {
            return errorResponse("Order not found", 404)
          }

          await verifyOrder(order)
        } catch (error: any) {
          return errorResponse(error, 401)
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
            Key: key,
            Body: JSON.stringify(updatedOrder),
          })
        )

        return successResponse({
          message: "Order cancelled",
          key,
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
