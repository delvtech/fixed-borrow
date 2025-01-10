import { z } from "zod"

export const Hex = z
  .string()
  .refine((s): s is `0x${string}` => s.startsWith("0x"), {
    message: "must start with 0x",
  })

// Order //
// The schema for an order in the matching contract

export const BaseOrder = z.object({
  trader: Hex,
  hyperdrive: Hex,
  amount: z.coerce.bigint(),
  slippageGuard: z.coerce.bigint(),
  minVaultSharePrice: z.coerce.bigint(),
  options: z.object({
    asBase: z.boolean(),
    destination: Hex,
    extraData: Hex,
  }),
  orderType: z.union([z.literal(0), z.literal(1)]).pipe(z.coerce.number()),
  expiry: z.coerce.number(),
  salt: Hex,
})

export const Order = BaseOrder.extend({
  signature: Hex.optional(),
})
export type Order = z.infer<typeof Order>

export const OrderIntent = BaseOrder.extend({
  signature: Hex,
})
export type OrderIntent = z.infer<typeof OrderIntent>

// Order Status //
// The status of a saved order in S3

export const OrderStatus = z.enum([
  "awaiting_signature",
  "cancelled",
  "pending",
  "matched",
])
export type OrderStatus = z.infer<typeof OrderStatus>

// S3 Order Object Key //
// The key (path) of an order object in S3

/**
 * Get an order key schema based on the order status
 */
export function OrderKey<T extends OrderStatus>(...statuses: T[]) {
  if (!statuses.length) statuses = OrderStatus.options as any
  return z.string().refine(
    // Orders are stored in sub-directories named after their status
    (k): k is `${T}/${string}` =>
      statuses.some((status) => k.startsWith(`${status}/`)),

    (k) => ({
      message: `Invalid key: ${k}, expected key to start with ${statuses.length > 1 ? 'one of "' : '"'}${statuses.join(
        '/", "'
      )}/"`,
    })
  )
}
export type OrderKey<T extends OrderStatus = OrderStatus> = z.infer<
  ReturnType<typeof OrderKey<T>>
>

export const AnyOrderKey = OrderKey()

// S3 Order Object Data //
// The actual data saved in S3 for an order

const OrderDataByStatus = {
  awaiting_signature: BaseOrder.extend({
    signature: z.undefined().optional(),
  }),
  cancelled: Order.extend({
    cancelledAt: z.number(),
  }),
  pending: OrderIntent,
  matched: OrderIntent.extend({
    /**
     * The key of the matching order
     */
    matchKey: OrderKey("matched"),
    matchedAt: z.number(),
  }),
} as const satisfies Record<OrderStatus, z.ZodObject<z.ZodRawShape>>

/**
 * Get an order data schema based on order status
 */
export function OrderData<T extends OrderStatus>(...statuses: T[]) {
  switch (statuses.length) {
    case 1:
      return OrderDataByStatus[statuses[0]]
    case 0:
      statuses = OrderStatus.options as any
    default:
      return z
        .object({})
        .passthrough()
        .superRefine(
          (obj, ctx): obj is z.infer<(typeof OrderDataByStatus)[T]> => {
            const issues: z.ZodIssue[] = []
            let success = false
            for (const status of statuses) {
              const result = OrderDataByStatus[status].safeParse(obj)
              if (result.success) {
                obj = result.data
                success = true
                break
              }
              issues.push(...result.error.issues)
            }
            if (!success) issues.forEach(ctx.addIssue)
            return success
          }
        )
  }
}
export type OrderData<T extends OrderStatus = OrderStatus> = z.infer<
  ReturnType<typeof OrderData<T>>
>

// S3 Order Object //

/**
 * Ensures order objects are saved correctly in S3 by enforcing the correct
 * combination of key and data based on order status.
 */
export function OrderObject<T extends OrderStatus = OrderStatus>(
  ...statuses: T[]
): {
  [K in T]: z.ZodObject<{
    status: z.ZodLiteral<K>
    key: ReturnType<typeof OrderKey<K>>
    data: ReturnType<typeof OrderData<K>>
  }>
}[T] {
  switch (statuses.length) {
    case 1:
      const [status] = statuses
      return z.object({
        status: z.literal(status),
        key: OrderKey(status),
        data: OrderData(status),
      }) as any
    case 0:
      statuses = OrderStatus.options as any
    default:
      return z
        .object({})
        .passthrough()
        .superRefine((orderObject, ctx) => {
          const { status, key, data } = orderObject
          if (!statuses.includes(status as T)) {
            ctx.addIssue({
              code: z.ZodIssueCode.invalid_literal,
              expected: statuses,
              received: status,
              message: `Invalid status: ${status}, expected ${statuses.length > 1 ? 'one of "' : '"'}${statuses.join(
                '", "'
              )}"`,
              path: ["status"],
              fatal: true,
            })
            return z.NEVER
          }

          const keyResult = OrderKey(status as T).safeParse(key)
          const dataResult = OrderData(status as T).safeParse(data)

          if (!keyResult.success) {
            keyResult.error.issues.forEach(ctx.addIssue)
          }
          if (!dataResult.success) {
            dataResult.error.issues.forEach(ctx.addIssue)
          }
          if (keyResult.success && dataResult.success) {
            orderObject.data = dataResult.data
          }
        }) as any
  }
}
export type OrderObject<T extends OrderStatus = OrderStatus> = z.infer<
  ReturnType<typeof OrderObject<T>>
>

export const AnyOrderObject = OrderObject()

// Response //

export const ErrorResponse = z.object({
  success: z.literal(false),
  error: z.string(),
})
export type ErrorResponse = z.infer<typeof ErrorResponse>

export const SuccessResponse = z.object({
  success: z.literal(true),
  error: z.undefined().optional(),
})
export type SuccessResponse = z.infer<typeof SuccessResponse>

export const OtcApiResponse = ErrorResponse.or(SuccessResponse)
export type OtcApiResponse = z.infer<typeof OtcApiResponse>
