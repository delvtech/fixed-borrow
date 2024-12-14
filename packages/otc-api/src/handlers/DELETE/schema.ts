import { z } from "zod"
import { AnyOrderKeySchema, orderObjectSchema } from "../../lib/schema.js"

export const DeleteRequestSchema = z.object({
  key: AnyOrderKeySchema,
})
export type DeleteRequest = z.infer<typeof DeleteRequestSchema>

export const DeleteResponseSchema = orderObjectSchema("canceled").extend({
  message: z.string(),
})
export type DeleteResponse = z.infer<typeof DeleteResponseSchema>
