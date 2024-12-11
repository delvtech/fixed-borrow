import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda"
import { s3 } from "../../lib/s3.js"
import type { CanceledOrder, OrderIntent } from "../../lib/schema.js"
import { bigintReplacer } from "../../lib/utils/bigIntReplacer.js"
import { createOrderKey, getOrder } from "../../lib/utils/orders.js"
import { errorResponse, successResponse } from "../../lib/utils/response.js"
import type { HandlerParams } from "../types.js"
import { DeleteRequestSchema, type DeleteResponse } from "./schema.js"

export async function DELETE({
  event,
  responseHeaders,
  bucketName,
}: HandlerParams): Promise<APIGatewayProxyStructuredResultV2> {
  const { data, error, success } = DeleteRequestSchema.safeParse(
    JSON.parse(event.body || "")
  )

  if (!success) {
    return errorResponse({
      headers: responseHeaders,
      message: `Invalid request: ${error.format()}`,
    })
  }

  const order = await getOrder(data.key, bucketName)

  if (!order) {
    return errorResponse({
      headers: responseHeaders,
      status: 404,
      message: "Order not found",
    })
  }

  // try {
  //   await verifyOrder(order)
  // } catch (error: any) {
  //   return errorResponse(error)
  // }

  // Delete original order
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: data.key,
    })
  )

  // Mark order as cancelled
  const updatedOrder: CanceledOrder = {
    ...(order as OrderIntent),
    cancelled: true,
    cancelledAt: Date.now(),
  }
  const updatedKey = createOrderKey({
    order: updatedOrder,
    status: "cancelled",
  })

  // Save cancelled order
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: updatedKey,
      Body: JSON.stringify(updatedOrder, bigintReplacer),
    })
  )

  return successResponse<DeleteResponse>({
    headers: responseHeaders,
    body: {
      message: "Order cancelled",
      deleted: {
        key: data.key,
        order,
      },
      updated: {
        key: updatedKey,
        order: updatedOrder,
      },
    },
  })
}
