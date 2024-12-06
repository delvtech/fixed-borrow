import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3"
import { s3 } from "./s3.js"
import { OrderSchema } from "./schemas.js"

/**
 * Create an order key
 * @param trader the address of the trader
 * @param hyperdrive the address of the hyperdrive
 * @param salt a random string used to prevent collisions
 * @returns the key for the order object in S3
 */
export function createOrderKey(
  trader: string,
  hyperdrive: string,
  salt: string
) {
  return `${trader}:${hyperdrive}:${salt}.json`
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
    const order = OrderSchema.parse(obj)
    return order.cancelled || order.matched ? null : order
  } catch (error) {
    if (error instanceof NoSuchKey) {
      return null
    }
    throw error
  }
}
