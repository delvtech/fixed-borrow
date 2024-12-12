import { z } from "zod"
import { CanceledOrderSchema } from "../../lib/schema.js"

export const DeleteRequestSchema = z.object({
  key: z.string(),
})
export type DeleteRequest = z.infer<typeof DeleteRequestSchema>

export const DeleteResponseSchema = z.object({
  message: z.string(),
  order: CanceledOrderSchema,
  newKey: z.string(),
  deletedKey: z.string(),
})
export type DeleteResponse = z.infer<typeof DeleteResponseSchema>
