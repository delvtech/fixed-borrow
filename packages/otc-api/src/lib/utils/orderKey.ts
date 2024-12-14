import { type Order, type OrderKey, type OrderStatus } from "../schema.js"

interface OrderKeyProps
  extends Pick<Order, "trader" | "hyperdrive" | "orderType" | "salt"> {}

/**
 * Create an order key for an object in S3
 */
export function createOrderKey<T extends OrderStatus = OrderStatus>(
  status: T,
  props: OrderKeyProps
) {
  return `${status}/${props.trader}:${props.hyperdrive}:${props.orderType}:${props.salt}.json` as const
}

export interface ParsedOrderKey<T extends OrderStatus = OrderStatus>
  extends OrderKeyProps {
  status: T
}

/**
 * Parse an order key from an object in S3
 */
export function parseOrderKey<T extends OrderStatus = OrderStatus>(
  key: OrderKey<T>
): ParsedOrderKey<T> {
  const [status, order] = key.split("/")
  const [trader, hyperdrive, orderType, salt] = order.split(":")
  return {
    status: status as T,
    trader: trader as `0x${string}`,
    hyperdrive: hyperdrive as `0x${string}`,
    orderType: Number(orderType) as 0 | 1,
    salt: salt as `0x${string}`,
  }
}

/**
 * Alter the properties of an order key and return a new key.
 */
export function updateOrderKey<
  T extends OrderStatus = OrderStatus,
  U extends OrderStatus = OrderStatus,
>(
  key: OrderKey<T>,
  updates: Partial<ParsedOrderKey<U>>
): OrderKey<OrderStatus extends U ? T : U> {
  const { status: oldStatus, ...oldProps } = parseOrderKey(key)
  const { status: newStatus, ...newProps } = updates
  return createOrderKey(newStatus || oldStatus, {
    ...oldProps,
    ...newProps,
  }) as any
}
