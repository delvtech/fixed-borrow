import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda"
import { createOrderKey } from "../../lib/utils/orderKey.js"
import { getOrder } from "../../lib/utils/orders.js"
import { errorResponse, successResponse } from "../../lib/utils/response.js"
import { PUT } from "../PUT/handler.js"
import { getNewOrderStatus } from "../PUT/utils.js"
import type { HandlerParams } from "../types.js"
import { PostRequest, type PostResponse } from "./schema.js"

// TODO: Move the bulk of this to PUT to avoid 409s on update requests.

export async function POST({
  event,
  responseHeaders,
  bucketName,
}: HandlerParams<PostRequest>): Promise<APIGatewayProxyStructuredResultV2> {
  // Parse and validate request
  const { success, error, data } = PostRequest.safeParse(
    typeof event.body === "string" ? JSON.parse(event.body) : event.body
  )

  if (!success) {
    return errorResponse({
      headers: responseHeaders,
      message: `Invalid request: ${error.format()}`,
    })
  }

  const { matchKey, signature, ...baseOrderData } = data

  // Ensure order doesn't already exist
  const status = getNewOrderStatus(data)
  const key = createOrderKey(status, baseOrderData)
  const existingOrder = await getOrder(key, bucketName)

  if (existingOrder) {
    return errorResponse({
      headers: responseHeaders,
      status: 409,
      message: `Order already exists with key: ${key}`,
    })
  }

  // Save new order
  const putResponse = await PUT({
    responseHeaders,
    bucketName,
    event: {
      ...event,
      body: {
        ...data,
        key,
        upsert: true,
      },
    },
  })

  if (putResponse.statusCode !== 200) {
    return putResponse
  }

  return successResponse<PostResponse>({
    headers: responseHeaders,
    status: 201,
    body: {
      ...JSON.parse(putResponse.body || ""),
      message: "Order created",
    },
  })
}
