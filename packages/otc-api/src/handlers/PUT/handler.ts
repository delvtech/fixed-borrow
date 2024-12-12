import { PutObjectCommand } from "@aws-sdk/client-s3"
import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda"
import { s3 } from "../../lib/s3.js"
import { bigintReplacer } from "../../lib/utils/bigIntReplacer.js"
import { createOrderKey, getOrder } from "../../lib/utils/orders.js"
import { errorResponse, successResponse } from "../../lib/utils/response.js"
import type { HandlerParams } from "../types.js"
import { PutRequestSchema, type PutResponse } from "./schema.js"

export async function PUT({
  event,
  responseHeaders,
  bucketName,
}: HandlerParams): Promise<APIGatewayProxyStructuredResultV2> {
  const { data, error, success } = PutRequestSchema.safeParse(
    JSON.parse(event.body || "")
  )

  if (!success) {
    return errorResponse({
      headers: responseHeaders,
      message: `Invalid request: ${error.format()}`,
    })
  }

  const { key, ...order } = data
  const existingOrder = await getOrder(key, bucketName)

  if (!existingOrder) {
    return errorResponse({
      headers: responseHeaders,
      status: 404,
      message: "Order not found",
    })
  }

  // Verify order
  // try {
  //   await verifyOrder(order)
  // } catch (error: any) {
  //   return errorResponse(error)
  // }

  const updatedKey = createOrderKey({
    order,
    status: order.signature ? "pending" : "awaiting_signature",
  })

  // Safe updated order
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: updatedKey,
      Body: JSON.stringify(order, bigintReplacer),
    })
  )

  return successResponse<PutResponse>({
    headers: responseHeaders,
    body: {
      message: "Order updated",
      key: updatedKey,
      order,
    },
  })
}
