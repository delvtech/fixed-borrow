import { ListObjectsV2Command } from "@aws-sdk/client-s3"
import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda"
import { s3 } from "../../lib/s3.js"
import type { OrderKey, OrderObject } from "../../lib/schema.js"
import { parseOrderKey } from "../../lib/utils/orderKey.js"
import { getOrder } from "../../lib/utils/orders.js"
import { errorResponse, successResponse } from "../../lib/utils/response.js"
import type { HandlerParams } from "../types.js"
import {
  GetRequest,
  type GetManyResponse,
  type GetOneResponse,
} from "./schema.js"

export async function GET({
  event,
  responseHeaders,
  bucketName,
}: HandlerParams): Promise<APIGatewayProxyStructuredResultV2> {
  // Parse and validate request
  const { data, error, success } = GetRequest().safeParse(
    event.queryStringParameters || {}
  )

  if (!success) {
    return errorResponse({
      message: `Invalid request: ${error.format()}`,
      headers: responseHeaders,
    })
  }

  // Get order by key if provided
  const { key } = data

  if (key) {
    const order = await getOrder(key, bucketName)
    return order
      ? successResponse<GetOneResponse>({
          headers: responseHeaders,
          body: {
            key,
            status: parseOrderKey(key).status,
            data: order,
          } as OrderObject,
        })
      : errorResponse({
          headers: responseHeaders,
          status: 404,
          message: "Order not found",
        })
  }

  // Otherwise, list objects
  const { continuationToken, hyperdrive, orderType, status, trader } = data

  // Each filter can only be applied to the prefix if the previous filter was
  // applied to avoid keys like "undefined/undefined:0x123"
  let prefix = ""

  if (status) {
    // Orders are stored in subfolders named after their status
    prefix += `${status}/`

    if (trader) {
      prefix += `${trader}:`

      if (hyperdrive) {
        prefix += `${hyperdrive}:`

        if (orderType) {
          prefix += `${orderType}:`
        }
      }
    }
  }

  const list = await s3.send(
    new ListObjectsV2Command({
      Bucket: bucketName,
      Prefix: prefix || undefined,
      ContinuationToken: continuationToken,
    })
  )

  // Fetch orders objects and apply filters that may have been omitted from the
  // prefix
  const orders: OrderObject[] = []
  const orderPromises: Promise<void>[] = []

  for (const { Key } of list.Contents || []) {
    const key = (Key || "") as OrderKey
    const { trader, hyperdrive, orderType } = parseOrderKey(key)

    if (data.trader && trader !== data.trader) continue
    if (data.hyperdrive && hyperdrive !== data.hyperdrive) continue
    if (data.orderType && orderType !== data.orderType) continue

    orderPromises.push(
      getOrder(key, bucketName).then((order) => {
        if (order) {
          orders.push({
            key,
            status: parseOrderKey(key).status,
            data: order,
          } as OrderObject)
        }
      })
    )
  }

  await Promise.all(orderPromises)

  return successResponse<GetManyResponse>({
    headers: responseHeaders,
    body: {
      orders,
      hasMore: !!list.IsTruncated as any,
      nextContinuationToken: list.NextContinuationToken,
    },
  })
}
