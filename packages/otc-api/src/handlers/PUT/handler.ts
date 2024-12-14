import { DeleteObjectCommand } from "@aws-sdk/client-s3"
import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda"
import { s3 } from "../../lib/s3.js"
import { getOrder } from "../../lib/utils/orders.js"
import { errorResponse, successResponse } from "../../lib/utils/response.js"
import { POST } from "../POST/handler.js"
import type { HandlerParams } from "../types.js"
import { PutRequestSchema, type PutResponse } from "./schema.js"

export async function PUT({
  event,
  responseHeaders,
  bucketName,
}: HandlerParams): Promise<APIGatewayProxyStructuredResultV2> {
  // Parse and validate request
  const { success, error, data } = PutRequestSchema.safeParse(
    typeof event.body === "string" ? JSON.parse(event.body) : event.body
  )

  if (!success) {
    return errorResponse({
      headers: responseHeaders,
      message: `Invalid request: ${error.format()}`,
    })
  }

  const { key, ...updates } = data

  // Ensure order exists
  const existingOrder = await getOrder(key, bucketName)

  if (!existingOrder) {
    return errorResponse({
      headers: responseHeaders,
      status: 404,
      message: "Order not found",
    })
  }

  // Save updated order
  const postResponse = await POST({
    event: {
      ...event,
      body: {
        ...existingOrder,
        ...updates,
      },
    },
    responseHeaders,
    bucketName,
  })

  if (postResponse.statusCode !== 201) {
    return postResponse
  }

  // Delete existing order
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  )

  return successResponse<PutResponse>({
    headers: responseHeaders,
    body: {
      ...JSON.parse(postResponse.body || ""),
      message: "Order updated",
    },
  })
}
