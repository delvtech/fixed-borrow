import { ListObjectsV2Command } from "@aws-sdk/client-s3"
import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda"
import { s3 } from "../../lib/s3.js"
import { getOrder, parseOrderKey } from "../../lib/utils/orders.js"
import { errorResponse, successResponse } from "../../lib/utils/response.js"
import type { HandlerParams } from "../types.js"
import {
  GetRequestSchema,
  type GetOneResponse,
  type QueryResponse,
} from "./schema.js"

export async function GET({
  event,
  responseHeaders,
  bucketName,
}: HandlerParams): Promise<APIGatewayProxyStructuredResultV2> {
  const { data, error, success } = GetRequestSchema.safeParse(
    event.queryStringParameters || {}
  )

  if (!success) {
    return errorResponse({
      message: `Invalid request: ${error.format()}`,
      headers: responseHeaders,
    })
  }

  // If a key is provided, get the specific order
  if ("key" in data) {
    const order = await getOrder(data.key, bucketName)
    return order
      ? successResponse<GetOneResponse>({
          headers: responseHeaders,
          body: {
            key: data.key,
            order,
          },
        })
      : errorResponse({
          headers: responseHeaders,
          status: 404,
          message: "Order not found",
        })
  }

  // Otherwise, list objects

  // Each filter can only be applied to the prefix if the previous filter was
  // applied to avoid keys like "undefined/undefined:0x123"
  let prefix = ""

  if (data.status) {
    // Orders are stored in subfolders named after their status
    prefix += `${data.status}/`

    if (data.trader) {
      prefix += `${data.trader}:`

      if (data.hyperdrive) {
        prefix += `${data.hyperdrive}:`
      }
    }
  }

  const list = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix || undefined,
      ContinuationToken: data.continuationToken,
    })
  )

  // Apply filters not able to be applied to the prefix
  list.Contents = list.Contents?.filter((obj) => {
    const { trader, hyperdrive } = parseOrderKey(obj.Key || "")
    if (!data.status && data.trader) return trader === data.trader
    if (!data.trader && data.hyperdrive) return hyperdrive === data.hyperdrive
    return true
  })

  // Fetch full orders
  const orders: QueryResponse["orders"] = []
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

  return successResponse<QueryResponse>({
    headers: responseHeaders,
    body: {
      orders,
      hasMore: !!list.IsTruncated as any,
      nextContinuationToken: list.NextContinuationToken,
    },
  })
}
