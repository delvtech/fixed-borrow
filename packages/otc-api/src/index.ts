import {
  DeleteObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import {
  LambdaFunctionURLEvent,
  LambdaFunctionURLResult,
  type APIGatewayProxyStructuredResultV2,
} from "aws-lambda"
import { createOrderKey, getOrder } from "./lib/orders.js"
import { s3 } from "./lib/s3.js"
import {
  DeleteRequestSchema,
  GetRequestSchema,
  PostRequestSchema,
  PutRequestSchema,
  type CanceledOrder,
  type OrderQueryResponse,
} from "./lib/schemas.js"
// import { verifyOrder } from "./lib/verify.js"

// List of allowed origins
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(/,\s*/) || []
const bucketName = process.env.BUCKET_NAME

if (!bucketName) {
  throw new Error("BUCKET_NAME environment variable is required")
}

// Helper functions for responses
const successResponse = ({
  status = 200,
  headers,
  body = {},
}: {
  headers: APIGatewayProxyStructuredResultV2["headers"]
  body?: Record<string, any>
  status?: number
}): LambdaFunctionURLResult => ({
  statusCode: status,
  headers,
  body: JSON.stringify(body, bigintReplacer),
})

const errorResponse = ({
  status = 400,
  headers,
  message,
}: {
  headers: APIGatewayProxyStructuredResultV2["headers"]
  message: string
  status?: number
}): LambdaFunctionURLResult => ({
  statusCode: status,
  headers,
  body: JSON.stringify({ error: message }, bigintReplacer),
})

export const handler = async (event: LambdaFunctionURLEvent) => {
  const origin = event.headers.origin || event.headers.Origin
  const allowOrigin =
    origin && allowedOrigins.includes(origin) ? origin : allowedOrigins[0] // fallback to first allowed origin
  const headers = {
    "Access-Control-Allow-Origin": allowOrigin,
    "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type,Authorization",
  }

  try {
    switch (event.requestContext.http.method) {
      // CORS preflight //
      case "OPTIONS": {
        return successResponse({ headers })
      }

      // Query orders //

      case "GET": {
        const { data, error, success } = GetRequestSchema.safeParse(
          event.queryStringParameters || {}
        )

        if (!success) {
          return errorResponse({
            message: `Invalid request: ${error.format()}`,
            headers,
          })
        }

        // If a key is provided, get the specific order
        if ("key" in data) {
          const order = await getOrder(data.key, bucketName)
          return order
            ? successResponse({ headers, body: { key: data.key, order } })
            : errorResponse({
                status: 404,
                headers,
                message: "Order not found",
              })
        }

        // Otherwise, list objects

        // Orders are stored in subfolders named after their status
        let prefix = data.status

        if (data.trader) {
          prefix += `${data.trader}:`
          if (data.hyperdrive) {
            prefix += `${data.hyperdrive}:`
          }
        }

        const list = await s3.send(
          new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix || undefined,
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

        return successResponse({ headers, body: response })
      }

      // Create order //

      case "POST": {
        if (!event.body) {
          return errorResponse({ headers, message: "Missing request body" })
        }

        const { data, error, success } = PostRequestSchema.safeParse(
          JSON.parse(event.body)
        )

        if (!success) {
          return errorResponse({
            headers,
            message: `Invalid request: ${error.format()}`,
          })
        }

        const order = data.order
        let key = createOrderKey({
          status: order.signature ? "pending" : "awaiting_signature",
          trader: order.trader,
          hyperdrive: order.hyperdrive,
          orderType: order.orderType,
          salt: order.salt,
        })
        const existingOrder = await getOrder(key, bucketName)

        if (existingOrder) {
          return errorResponse({
            headers,
            message: "Order already exists",
            status: 409,
          })
        }

        let status = "pending"
        if (!order.signature) {
          status = "awaiting_signature"
          key = `${key}`
        }

        // try {
        //   await verifyOrder(order)
        // } catch (error: any) {
        //   return errorResponse(error)
        // }

        // Save order
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: JSON.stringify(order, bigintReplacer),
          })
        )

        return successResponse({
          headers,
          body: {
            message: "Order created",
            key,
            order,
          },
          status: 201,
        })
      }

      // Update order //

      case "PUT": {
        if (!event.body) {
          return errorResponse({ headers, message: "Missing request body" })
        }

        const { data, error, success } = PutRequestSchema.safeParse(
          JSON.parse(event.body)
        )

        if (!success) {
          return errorResponse({
            headers,
            message: `Invalid request: ${error.format()}`,
          })
        }

        const order = data.order
        const updatedKey = createOrderKey({
          status: order.signature ? "pending" : "awaiting_signature",
          trader: order.trader,
          hyperdrive: order.hyperdrive,
          orderType: order.orderType,
          salt: order.salt,
        })
        const existingOrder = await getOrder(updatedKey, bucketName)

        if (!existingOrder) {
          return errorResponse({
            headers,
            message: "Order not found",
            status: 404,
          })
        }

        // try {
        //   await verifyOrder(order)
        // } catch (error: any) {
        //   return errorResponse(error)
        // }

        // Update order
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: updatedKey,
            Body: JSON.stringify(order, bigintReplacer),
          })
        )

        return successResponse({
          headers,
          body: {
            message: "Order updated",
            key: updatedKey,
            order,
          },
        })
      }

      // Cancel order //

      case "DELETE": {
        if (!event.body) {
          return errorResponse({ headers, message: "Missing request body" })
        }

        const { data, error, success } = DeleteRequestSchema.safeParse(
          JSON.parse(event.body)
        )

        if (!success) {
          return errorResponse({
            headers,
            message: `Invalid request: ${error.format()}`,
          })
        }

        const order = await getOrder(data.key, bucketName)

        if (!order) {
          return errorResponse({
            headers,
            message: "Order not found",
            status: 404,
          })
        }

        // try {
        //   await verifyOrder(order)
        // } catch (error: any) {
        //   return errorResponse(error)
        // }

        // Mark order as cancelled
        const updatedOrder: CanceledOrder = {
          ...order,
          cancelled: true,
          cancelledAt: Date.now(),
        }

        // Delete order
        await s3.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: data.key,
          })
        )

        // Update order
        await s3.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: createOrderKey({
              status: "cancelled",
              trader: order.trader,
              hyperdrive: order.hyperdrive,
              orderType: order.orderType,
              salt: order.salt,
            }),
            Body: JSON.stringify(updatedOrder, bigintReplacer),
          })
        )

        return successResponse({
          headers,
          body: {
            message: "Order cancelled",
            key: data.key,
          },
        })
      }

      default:
        return errorResponse({
          headers,
          message: "Method not allowed",
          status: 405,
        })
    }
  } catch (error) {
    console.error("Error:", error)
    return errorResponse({
      headers,
      message: "Internal server error",
      status: 500,
    })
  }
}

function bigintReplacer(_: string, value: any) {
  if (typeof value === "bigint") {
    return value.toString()
  }
  return value
}
