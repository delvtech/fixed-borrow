import { z } from "zod"
import { ensureHexPrefix } from "./utils/ensureHexPrefix.js"

// Order //

export const OrderSchema = z.object({
  /** Signature may be pending */
  signature: z.string().transform(ensureHexPrefix).optional(),
  trader: z.string().transform(ensureHexPrefix),
  hyperdrive: z.string().transform(ensureHexPrefix),
  amount: z.coerce.bigint(),
  slippageGuard: z.coerce.bigint(),
  minVaultSharePrice: z.coerce.bigint(),
  options: z.object({
    asBase: z.boolean(),
    destination: z.string().transform(ensureHexPrefix),
    extraData: z.string().transform(ensureHexPrefix),
  }),
  orderType: z.number().min(0).max(1),
  expiry: z.string(),
  salt: z.string().transform(ensureHexPrefix),
})
export type Order = z.infer<typeof OrderSchema>

export const OrderIntentSchema = OrderSchema.required()
export type OrderIntent = z.infer<typeof OrderIntentSchema>

export const MatchedOrderSchema = OrderIntentSchema.extend({
  matchedAt: z.number(),
  matchKey: z.string(),
})
export type MatchedOrder = z.infer<typeof MatchedOrderSchema>

export const CanceledOrderSchema = OrderIntentSchema.extend({
  cancelledAt: z.number(),
})
export type CanceledOrder = z.infer<typeof CanceledOrderSchema>

export const AnyOrderSchema =
  OrderSchema.or(MatchedOrderSchema).or(CanceledOrderSchema)
export type AnyOrder = z.infer<typeof AnyOrderSchema>

// Response //

export const ErrorResponseSchema = z.object({
  error: z.string(),
})
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
