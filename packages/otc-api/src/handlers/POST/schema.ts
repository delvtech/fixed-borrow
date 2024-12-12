import { z } from "zod"
import { OrderIntentSchema, OrderSchema } from "../../lib/schema.js"

export const PostRequestSchema = OrderIntentSchema.or(OrderSchema)
export type PostRequest = z.infer<typeof PostRequestSchema>

export const PostResponseSchema = z.object({
  message: z.string(),
  key: z.string(),
  order: OrderSchema,
})
export type PostResponse = z.infer<typeof PostResponseSchema>
