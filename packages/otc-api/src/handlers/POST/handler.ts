import { PutObjectCommand } from "@aws-sdk/client-s3"
import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda"
import { s3 } from "../../lib/s3.js"
import { bigintReplacer } from "../../lib/utils/bigIntReplacer.js"
import { createOrderKey, getOrder } from "../../lib/utils/orders.js"
import { errorResponse, successResponse } from "../../lib/utils/response.js"
import type { HandlerParams } from "../types.js"
import { PostRequestSchema, type PostResponse } from "./schema.js"

export async function POST({
  event,
  responseHeaders,
  bucketName,
}: HandlerParams): Promise<APIGatewayProxyStructuredResultV2> {
  const { data, error, success } = PostRequestSchema.safeParse(
    JSON.parse(event.body || "")
  )

  if (!success) {
    return errorResponse({
      headers: responseHeaders,
      message: `Invalid request: ${error.format()}`,
    })
  }

  const order = data.order
  const key = createOrderKey({
    order,
    status: order.signature ? "pending" : "awaiting_signature",
  })
  const existingOrder = await getOrder(key, bucketName)

  if (existingOrder) {
    return errorResponse({
      headers: responseHeaders,
      status: 409,
      message: `Order already exists with key: ${key}`,
    })
  }

  // Verify order
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

  return successResponse<PostResponse>({
    headers: responseHeaders,
    status: 201,
    body: {
      message: "Order created",
      key,
      order,
    },
  })
}
