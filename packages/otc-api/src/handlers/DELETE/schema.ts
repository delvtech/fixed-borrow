import { z } from "zod"
import {
  AnyOrderKey,
  ErrorResponse,
  OrderObject,
  SuccessResponse,
} from "../../lib/schema.js"

export const DeleteRequest = z.object({
  key: AnyOrderKey,
})
export type DeleteRequest = z.infer<typeof DeleteRequest>

export const DeleteResponse = ErrorResponse.or(
  SuccessResponse.extend({
    message: z.string(),
  }).merge(OrderObject("cancelled"))
)
export type DeleteResponse = z.infer<typeof DeleteResponse>
