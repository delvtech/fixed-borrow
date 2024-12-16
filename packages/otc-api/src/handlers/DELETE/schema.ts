import { z } from "zod"
import { AnyOrderKey, OrderObject, SuccessResponse } from "../../lib/schema.js"

export const DeleteRequest = z.object({
  key: AnyOrderKey,
})
export type DeleteRequest = z.infer<typeof DeleteRequest>

export const DeleteResponse = SuccessResponse.extend({
  message: z.string(),
}).merge(OrderObject("canceled"))
export type DeleteResponse = z.infer<typeof DeleteResponse>
