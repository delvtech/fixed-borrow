import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3"
import type { QueryParams } from "../../handlers/GET/schema.js"
import { s3 } from "../s3.js"
import { OrderSchema, type Order } from "../schema.js"

/**
 * Create an order key for an object in S3
 */
export function createOrderKey({
  status,
  order,
}: {
  status: NonNullable<QueryParams["status"]>
  order: Order
}) {
  return `${status}/${order.trader}:${order.hyperdrive}:${order.orderType}:${order.salt}.json`
}

/**
 * Parse an order key from an object in S3
 */
export function parseOrderKey(key: string): {
  status: NonNullable<QueryParams["status"]>
  trader: `0x${string}`
  hyperdrive: `0x${string}`
  orderType: number
  salt: `0x${string}`
} {
  const [status, order] = key.split("/")
  const [trader, hyperdrive, orderType, salt] = order.split(":")
  return {
    status: status as NonNullable<QueryParams["status"]>,
    trader: trader as `0x${string}`,
    hyperdrive: hyperdrive as `0x${string}`,
    orderType: Number(orderType),
    salt: salt as `0x${string}`,
  }
}

/**
 * Get an order by key, handling common error cases
 */
export async function getOrder(key: string, bucketName: string) {
  try {
    const response = await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    )

    const orderData = await response.Body?.transformToString()
    if (!orderData) {
      return null
    }

    const obj = JSON.parse(orderData)
    return OrderSchema.parse(obj)
  } catch (error) {
    if (error instanceof NoSuchKey) {
      return null
    }
    throw error
  }
}
