import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import type { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda"
import { s3Client } from "./lib/s3-client.js"
import {
  DeleteSchema,
  GetSchema,
  PostSchema,
  PutSchema,
  type Order,
} from "./lib/schemas.js"

const bucketName = process.env.BUCKET_NAME

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  if (!bucketName) {
    return errorResponse(500, "BUCKET_NAME environment variable is not set")
  }

  // Handle CORS preflight requests
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type,Authorization",
      },
      body: "",
    }
  }

  try {
    switch (event.httpMethod) {
      // Create order
      case "POST": {
        if (!event.body) {
          return errorResponse(400, "Missing request body")
        }

        const body = JSON.parse(event.body)
        const { order } = PostSchema.parse(body)
        const key = `${order.trader}:${order.hyperdrive}:${order.salt}.json`

        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: JSON.stringify(order),
            ContentType: "application/json",
          })
        )

        return successResponse({ message: "Order created", key })
      }

      // Query orders
      case "GET": {
        const params = GetSchema.parse(event.queryStringParameters || {})

        // If key is provided, get specific order
        if (params.key) {
          const response = await s3Client.send(
            new GetObjectCommand({
              Bucket: bucketName,
              Key: params.key,
            })
          )

          const bodyContents = await response.Body?.transformToString()
          return successResponse(bodyContents)
        }

        // Otherwise, list objects

        let prefix: string | undefined
        if (params.trader) {
          prefix += `${params.trader}:`
          if (params.hyperdrive) {
            prefix += `${params.hyperdrive}:`
          }
        }

        const list = await s3Client.send(
          new ListObjectsV2Command({
            Bucket: bucketName,
            Prefix: prefix,
            ContinuationToken: params.continuationToken,
          })
        )

        if (!params.trader && params.hyperdrive) {
          list.Contents?.filter((obj) => {
            const [, hyperdrive] = obj.Key?.split(":") || []
            return hyperdrive === params.hyperdrive
          })
        }

        const orders = await Promise.all(
          list.Contents?.map(async ({ Key }) => {
            const response = await s3Client.send(
              new GetObjectCommand({
                Bucket: bucketName,
                Key,
              })
            )

            if (!response.Body) {
              return null
            }

            const bodyContents = await response.Body?.transformToString()
            return JSON.parse(bodyContents)
          }) || []
        )

        return successResponse(
          list.Contents?.map((obj, i) => ({
            key: obj.Key,
            lastModified: obj.LastModified,
            size: obj.Size,
            order: orders[i],
            hasMore: list.IsTruncated,
            nextContinuationToken: list.NextContinuationToken,
          }))
        )
      }

      // Update order
      case "PUT": {
        if (!event.body) {
          return errorResponse(400, "Missing request body")
        }

        const body = JSON.parse(event.body)
        const { key, order } = PutSchema.parse(body)

        // Check if order exists
        let existingOrder: Order | undefined
        try {
          const response = await s3Client.send(
            new GetObjectCommand({
              Bucket: bucketName,
              Key: key,
            })
          )

          const bodyContents = await response.Body?.transformToString()
          if (bodyContents) {
            existingOrder = JSON.parse(bodyContents)
          }
        } catch (error: any) {
          if (error.name === "NoSuchKey") {
            return errorResponse(404, "Order not found")
          }
          throw error
        }

        // Update order
        await s3Client.send(
          new PutObjectCommand({
            Bucket: bucketName,
            Key: key,
            Body: JSON.stringify({
              ...existingOrder,
              ...order,
            }),
            ContentType: "application/json",
          })
        )

        return successResponse({ message: "Order updated", key })
      }

      // Delete order
      case "DELETE": {
        if (!event.body) {
          return errorResponse(400, "Missing request body")
        }

        const body = JSON.parse(event.body)
        const { key } = DeleteSchema.parse(body)

        // Check if order exists
        try {
          await s3Client.send(
            new GetObjectCommand({
              Bucket: bucketName,
              Key: key,
            })
          )
        } catch (error: any) {
          if (error.name === "NoSuchKey") {
            return errorResponse(404, "Order not found")
          }
          throw error
        }

        // Delete order
        await s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
          })
        )

        return successResponse({ message: "Order deleted", key })
      }

      default:
        return errorResponse(405, "Method not allowed")
    }
  } catch (error: any) {
    console.error("Error processing request:", error)
    return errorResponse(
      error.name === "ZodError" ? 400 : 500,
      error.name === "ZodError" ? error.errors : "Internal server error"
    )
  }
}

// Helper for consistent error responses
function errorResponse(statusCode: number, error: any) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: JSON.stringify({ error }),
  }
}

// Helper for successful responses
function successResponse(data: any) {
  return {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
    },
    body: typeof data === "string" ? data : JSON.stringify(data),
  }
}
