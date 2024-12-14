import { GetObjectCommand, NoSuchKey } from "@aws-sdk/client-s3"
import { s3 } from "../s3.js"
import {
  OrderSchema,
  type OrderData,
  type OrderKey,
  type OrderStatus,
} from "../schema.js"

/**
 * Get an order by key, handling common error cases
 */
export async function getOrder<T extends OrderStatus = OrderStatus>(
  key: OrderKey<T>,
  bucketName: string
): Promise<OrderData<T> | undefined> {
  try {
    const response = await s3.send(
      new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
      })
    )

    const orderData = await response.Body?.transformToString()
    if (!orderData) {
      return undefined
    }

    const obj = JSON.parse(orderData)
    return OrderSchema.parse(obj) as OrderData<T>
  } catch (error) {
    if (error instanceof NoSuchKey) {
      return undefined
    }
    throw error
  }
}
