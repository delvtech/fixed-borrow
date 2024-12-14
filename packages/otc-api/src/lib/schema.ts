import { z } from "zod"

export const HexSchema = z
  .string()
  .refine((s): s is `0x${string}` => s.startsWith("0x"), {
    message: "must start with 0x",
  })

// Order //

export const BaseOrderSchema = z.object({
  trader: HexSchema,
  hyperdrive: HexSchema,
  amount: z.coerce.bigint(),
  slippageGuard: z.coerce.bigint(),
  minVaultSharePrice: z.coerce.bigint(),
  options: z.object({
    asBase: z.boolean(),
    destination: HexSchema,
    extraData: HexSchema,
  }),
  orderType: z.union([z.literal(0), z.literal(1)]),
  expiry: z.string(),
  salt: HexSchema,
})

export const OrderSchema = BaseOrderSchema.extend({
  signature: HexSchema.optional(),
})
export type Order = z.infer<typeof OrderSchema>

export const OrderIntentSchema = BaseOrderSchema.extend({
  signature: HexSchema,
})
export type OrderIntent = z.infer<typeof OrderIntentSchema>

// Order Status //

export const OrderStatusSchema = z.enum([
  "awaiting_signature",
  "canceled",
  "pending",
  "matched",
])
export type OrderStatus = z.infer<typeof OrderStatusSchema>

// S3 Order Object Key //

export type OrderKey<T extends OrderStatus = OrderStatus> = `${T}/${string}`

export function orderKeySchema<T extends OrderStatus[]>(
  ...possibleStatuses: T
) {
  return z
    .string()
    .refine((k): k is OrderKey<T[number]> =>
      possibleStatuses.some((status) => k.startsWith(`${status}/`))
    )
}

export const AnyOrderKeySchema = orderKeySchema(...OrderStatusSchema.options)

// S3 Order Object Data //

const DataSchemaByStatus = {
  awaiting_signature: BaseOrderSchema.extend({
    signature: z.undefined().optional(),
  }),
  canceled: OrderSchema.extend({
    canceledAt: z.number(),
  }),
  pending: OrderIntentSchema,
  matched: OrderIntentSchema.extend({
    /**
     * The key of the matching order
     */
    matchKey: orderKeySchema("matched"),
    matchedAt: z.number(),
  }),
} as const

export type OrderData<TStatus extends OrderStatus = OrderStatus> = z.infer<
  (typeof DataSchemaByStatus)[TStatus]
>

/**
 * Get the data schema for a specific order status
 */
export function orderDataSchema<T extends OrderStatus>(status: T) {
  return DataSchemaByStatus[status]
}

// S3 Order Object //

/**
 * Get the order object schema for a specific order status.
 */
export function orderObjectSchema<T extends OrderStatus>(status: T) {
  return z.object({
    key: orderKeySchema(status),
    status: z.literal(status),
    data: orderDataSchema(status),
  })
}

export const OrderObjectSchema = z.discriminatedUnion("status", [
  orderObjectSchema("awaiting_signature"),
  orderObjectSchema("canceled"),
  orderObjectSchema("pending"),
  orderObjectSchema("matched"),
])

export type OrderObject<T extends OrderStatus = OrderStatus> = Extract<
  z.infer<typeof OrderObjectSchema>,
  { status: T }
>
// Response //

export const ErrorResponseSchema = z.object({
  error: z.string(),
})
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>
