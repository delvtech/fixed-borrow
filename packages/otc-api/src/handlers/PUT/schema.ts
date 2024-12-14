import { z } from "zod"
import { AnyOrderKeySchema } from "../../lib/schema.js"
import {
  NewMatchedOrderSchema,
  NewUnmatchedOrderSchema,
  PostResponseSchema,
  type PostResponse,
} from "../POST/schema.js"

export const OrderUpdateSchema = z.discriminatedUnion("matchKey", [
  NewUnmatchedOrderSchema.partial(),
  NewMatchedOrderSchema.partial(),
])
export type OrderUpdate = z.infer<typeof OrderUpdateSchema>

export const PutRequestSchema = OrderUpdateSchema.and(
  z.object({
    key: AnyOrderKeySchema,
  })
)
export type PutRequest = z.infer<typeof PutRequestSchema>

export const PutResponseSchema = PostResponseSchema
export type PutResponse = PostResponse
