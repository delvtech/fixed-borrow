import type { Order, OrderData, OrderIntent } from "../../lib/schema.js"
import type { NewMatchedOrder, NewOrder } from "./schema.js"

export function isMatchedOrder(
  order: NewOrder | OrderData
): order is NewMatchedOrder | OrderData<"matched"> {
  return !!("matchKey" in order && order.matchKey && order.signature)
}

export function isOrderIntent(order: Order): order is OrderIntent {
  return !!order.signature
}

export function getNewOrderStatus<T extends NewOrder>(order: T) {
  if (isMatchedOrder(order)) return "matched" as const
  if (isOrderIntent(order)) return "pending" as const
  return "awaiting_signature" as const
}
