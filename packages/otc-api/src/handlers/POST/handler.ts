import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda"
import { s3 } from "../../lib/s3.js"
import type { OrderData, OrderObject } from "../../lib/schema.js"
import { bigintReplacer } from "../../lib/utils/bigIntReplacer.js"
import { createOrderKey, updateOrderKey } from "../../lib/utils/orderKey.js"
import { getOrder } from "../../lib/utils/orders.js"
import { errorResponse, successResponse } from "../../lib/utils/response.js"
import type { HandlerParams } from "../types.js"
import { PostRequestSchema, type PostResponse } from "./schema.js"

export async function POST({
  event,
  responseHeaders,
  bucketName,
}: HandlerParams): Promise<APIGatewayProxyStructuredResultV2> {
  // Parse and validate request
  const { success, error, data } = PostRequestSchema.safeParse(
    typeof event.body === "string" ? JSON.parse(event.body) : event.body
  )

  if (!success) {
    return errorResponse({
      headers: responseHeaders,
      message: `Invalid request: ${error.format()}`,
    })
  }

  const { matchKey, signature, ...baseOrderData } = data
  const now = Date.now()

  // Reject match keys for unsigned orders
  if (matchKey && !signature) {
    return errorResponse({
      headers: responseHeaders,
      message:
        "Match key provided for unsigned order. Only signed orders can be matched.",
    })
  }

  // Create order object
  let newObject: OrderObject

  if (matchKey) {
    newObject = {
      status: "matched",
      key: createOrderKey("matched", baseOrderData),
      data: {
        ...baseOrderData,
        signature,
        matchKey: updateOrderKey(matchKey, { status: "matched" }),
        matchedAt: now,
      },
    }
  } else if (signature) {
    newObject = {
      status: "pending",
      key: createOrderKey("pending", baseOrderData),
      data: {
        ...baseOrderData,
        signature,
      },
    }
  } else {
    newObject = {
      status: "awaiting_signature",
      key: createOrderKey("awaiting_signature", baseOrderData),
      data: baseOrderData,
    }
  }

  // Ensure order doesn't already exist
  const existingOrder = await getOrder(newObject.key, bucketName)

  if (existingOrder) {
    return errorResponse({
      headers: responseHeaders,
      status: 409,
      message: `Order already exists with key: ${newObject.key}`,
    })
  }

  // Ensure match order exists
  const matchOrder = matchKey && (await getOrder(matchKey, bucketName))

  if (matchKey && !matchOrder) {
    return errorResponse({
      headers: responseHeaders,
      status: 404,
      message: `Match order not found with key: ${matchKey}`,
    })
  }

  // Save new order
  await s3.send(
    new PutObjectCommand({
      Bucket: bucketName,
      Key: newObject.key,
      Body: JSON.stringify(newObject.data, bigintReplacer),
    })
  )

  // Update match order if provided
  if (matchOrder) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: matchKey,
      })
    )

    const updatedMatchOrder: OrderData<"matched"> = {
      ...matchOrder,
      matchKey: createOrderKey("matched", matchOrder),
      matchedAt: now,
    }

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: data.matchKey,
        Body: JSON.stringify(updatedMatchOrder, bigintReplacer),
      })
    )
  }

  return successResponse<PostResponse>({
    headers: responseHeaders,
    status: 201,
    body: {
      ...newObject,
      message: "Order created",
    },
  })
}
