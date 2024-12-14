import { z } from "zod"
import {
  OrderIntentSchema,
  orderKeySchema,
  OrderObjectSchema,
  OrderSchema,
} from "../../lib/schema.js"

export const NewUnmatchedOrderSchema = OrderSchema.extend({
  matchKey: z.undefined().optional(),
})
export type NewUnmatchedOrder = z.infer<typeof NewUnmatchedOrderSchema>

export const NewMatchedOrderSchema = OrderIntentSchema.extend({
  matchKey: orderKeySchema("pending"),
})
export type NewMatchedOrder = z.infer<typeof NewMatchedOrderSchema>

export const PostRequestSchema = z.discriminatedUnion("matchKey", [
  NewUnmatchedOrderSchema,
  NewMatchedOrderSchema,
])
export type PostRequest = z.infer<typeof PostRequestSchema>

export const PostResponseSchema = OrderObjectSchema.and(
  z.object({
    message: z.string(),
  })
)
export type PostResponse = z.infer<typeof PostResponseSchema>
