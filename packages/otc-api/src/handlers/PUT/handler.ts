import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3"
import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda"
import { s3 } from "../../lib/s3.js"
import type { OrderData, OrderObject } from "../../lib/schema.js"
import { bigintReplacer } from "../../lib/utils/bigIntReplacer.js"
import { createOrderKey, updateOrderKey } from "../../lib/utils/orderKey.js"
import { getOrder } from "../../lib/utils/orders.js"
import { errorResponse, successResponse } from "../../lib/utils/response.js"
import type { HandlerParams } from "../types.js"
import { PutRequest, type NewOrder, type PutResponse } from "./schema.js"
import { isMatchedOrder, isOrderIntent } from "./utils.js"

export async function PUT({
  event,
  responseHeaders,
  bucketName,
}: HandlerParams<PutRequest>): Promise<APIGatewayProxyStructuredResultV2> {
  // Parse and validate request
  const { success, error, data } = PutRequest.safeParse(
    typeof event.body === "string" ? JSON.parse(event.body) : event.body
  )

  if (!success) {
    return errorResponse({
      headers: responseHeaders,
      message: `Invalid request: ${JSON.stringify(error.format())}`,
    })
  }

  // Ensure order exists if not an upsert request
  let existingOrder: OrderData | undefined

  if (!data.upsert) {
    existingOrder = await getOrder(data.key, bucketName)
    if (!existingOrder) {
      return errorResponse({
        headers: responseHeaders,
        status: 404,
        message: "Order not found",
      })
    }
  }

  const { key, upsert, ...upsertOrder } = data
  const newOrder = {
    ...existingOrder,
    ...upsertOrder,
  } as NewOrder
  const { matchKey, signature, ...baseOrderData } = newOrder
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

  if (isMatchedOrder(newOrder)) {
    newObject = {
      status: "matched",
      key: createOrderKey("matched", baseOrderData),
      data: {
        ...newOrder,
        matchKey: updateOrderKey(newOrder.matchKey, { status: "matched" }),
        matchedAt: now,
      },
    }
  } else if (isOrderIntent(newOrder)) {
    newObject = {
      status: "pending",
      key: createOrderKey("pending", baseOrderData),
      data: newOrder,
    }
  } else {
    newObject = {
      status: "awaiting_signature",
      key: createOrderKey("awaiting_signature", baseOrderData),
      data: baseOrderData,
    }
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
    const _newObject = newObject as OrderObject<"matched">
    const updatedMatchOrder: OrderData<"matched"> = {
      ...matchOrder,
      matchKey: _newObject.key,
      matchedAt: now,
    }

    await s3.send(
      new PutObjectCommand({
        Bucket: bucketName,
        Key: _newObject.data.matchKey,
        Body: JSON.stringify(updatedMatchOrder, bigintReplacer),
      })
    )

    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: matchKey,
      })
    )
  }

  // Delete existing order if the key changed
  if (newObject.key !== key) {
    await s3.send(
      new DeleteObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    )
  }

  return successResponse<PutResponse>({
    headers: responseHeaders,
    body: {
      ...newObject,
      message: "Order updated",
    },
  })
}
