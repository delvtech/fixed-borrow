import { z } from "zod"
import { CanceledOrderSchema, OrderSchema } from "../../lib/schema.js"

export const DeleteRequestSchema = z.object({
  key: z.string(),
})
export type DeleteRequest = z.infer<typeof DeleteRequestSchema>

export const DeleteResponseSchema = z.object({
  message: z.string(),
  deleted: z.object({
    key: z.string(),
    order: OrderSchema,
  }),
  updated: z.object({
    key: z.string(),
    order: CanceledOrderSchema,
  }),
})
export type DeleteResponse = z.infer<typeof DeleteResponseSchema>
