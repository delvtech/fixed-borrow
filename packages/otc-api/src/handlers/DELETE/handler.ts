import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda"
import { s3 } from "../../lib/s3.js"
import type { OrderObject } from "../../lib/schema.js"
import { bigintReplacer } from "../../lib/utils/bigIntReplacer.js"
import { createOrderKey } from "../../lib/utils/orderKey.js"
import { getOrder } from "../../lib/utils/orders.js"
import { errorResponse, successResponse } from "../../lib/utils/response.js"
import type { HandlerParams } from "../types.js"
import { DeleteRequest, type DeleteResponse } from "./schema.js"

export async function DELETE({
  event,
  responseHeaders,
  bucketName,
}: HandlerParams<DeleteRequest>): Promise<APIGatewayProxyStructuredResultV2> {
  // Parse and validate request
  const { success, error, data } = DeleteRequest.safeParse(
    typeof event.body === "string" ? JSON.parse(event.body) : event.body
  )

  if (!success) {
    return errorResponse({
      headers: responseHeaders,
      message: `Invalid request: ${error.format()}`,
    })
  }

  const key = data.key

  // Ensure order exists
  const existingOrder = await getOrder(key, bucketName)

  if (!existingOrder) {
    return errorResponse({
      headers: responseHeaders,
      status: 404,
      message: "Order not found",
    })
  }

  // Create order object
  let newObject: OrderObject<"canceled"> = {
    status: "canceled",
    key: createOrderKey("canceled", existingOrder),
    data: {
      ...existingOrder,
      canceledAt: Date.now(),
    },
  }

  // Save cancelled order if not previously canceled
  const existingCanceledOrder = await getOrder(newObject.key, bucketName)

  if (!existingCanceledOrder) {
    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: newObject.key,
        Body: JSON.stringify(newObject.data, bigintReplacer),
      })
    )
  }

  // Delete existing order
  await s3.send(
    new DeleteObjectCommand({
      Bucket: bucketName,
      Key: key,
    })
  )

  return successResponse<DeleteResponse>({
    headers: responseHeaders,
    body: {
      ...newObject,
      message: "Order cancelled",
    },
  })
}
