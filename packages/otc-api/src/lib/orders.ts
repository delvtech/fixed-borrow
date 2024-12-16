import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3"
import { s3 } from "./s3.js"
import { OrderSchema, type GetRequestParams, type Order } from "./schemas.js"

/**
 * Create an order key for an object in S3
 */
export function createOrderKey({
  status,
  trader,
  hyperdrive,
  orderType,
  salt,
}: Required<Pick<GetRequestParams, "status">> &
  Pick<Order, "trader" | "hyperdrive" | "orderType" | "salt">) {
  return `${status}/${trader}:${hyperdrive}:${orderType}:${salt}.json`
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
