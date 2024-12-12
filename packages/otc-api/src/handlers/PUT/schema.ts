import { z } from "zod"
import { AnyOrderSchema } from "../../lib/schema.js"

export const PutRequestSchema = AnyOrderSchema.and(
  z.object({
    key: z.string(),
  })
)
export type PutRequest = z.infer<typeof PutRequestSchema>

export const PutResponseSchema = z.object({
  message: z.string(),
  key: z.string(),
  order: AnyOrderSchema,
})
export type PutResponse = z.infer<typeof PutResponseSchema>
