import { z } from "zod"
import {
  AnyOrderKey,
  AnyOrderObject,
  ErrorResponse,
  Order,
  OrderIntent,
  OrderKey,
  SuccessResponse,
} from "../../lib/schema.js"

export const NewUnmatchedOrder = Order.extend({
  matchKey: z.undefined().optional(),
})
export type NewUnmatchedOrder = z.infer<typeof NewUnmatchedOrder>

export const NewMatchedOrder = OrderIntent.extend({
  matchKey: OrderKey("pending"),
})
export type NewMatchedOrder = z.infer<typeof NewMatchedOrder>

export const NewOrder = NewUnmatchedOrder.or(NewMatchedOrder)
export type NewOrder = z.infer<typeof NewOrder>

export const OrderUpsert = z.object({ upsert: z.literal(true) }).and(NewOrder)
export type OrderUpsert = z.infer<typeof OrderUpsert>

export const OrderUpdate = z
  .object({ upsert: z.literal(false).optional() })
  .and(z.union([NewUnmatchedOrder.partial(), NewMatchedOrder.partial()]))
export type OrderUpdate = z.infer<typeof OrderUpdate>

export const PutRequest = z
  .object({ key: AnyOrderKey })
  .and(OrderUpdate.or(OrderUpsert))
export type PutRequest = z.infer<typeof PutRequest>

export const PutResponse = ErrorResponse.or(
  SuccessResponse.extend({
    message: z.string(),
  }).and(AnyOrderObject)
)
export type PutResponse = z.infer<typeof PutResponse>
