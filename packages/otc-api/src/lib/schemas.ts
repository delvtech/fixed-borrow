import { z } from "zod"

export const OrderSchema = z.object({
  // Signature may be pending
  signature: z.string().transform(hexTransform).optional(),
  trader: z.string().transform(hexTransform),
  hyperdrive: z.string().transform(hexTransform),
  amount: z.coerce.bigint(),
  slippageGuard: z.coerce.bigint(),
  minVaultSharePrice: z.coerce.bigint(),
  options: z.object({
    asBase: z.boolean(),
    destination: z.string().transform(hexTransform),
    extraData: z.string().transform(hexTransform),
  }),
  orderType: z.number().min(0).max(1),
  expiry: z.string(),
  salt: z.string().transform(hexTransform),
  // Track match status
  matched: z.boolean().optional(),
  matchedAt: z.number().optional(),
  matchKey: z.string().optional(),
  // Track cancellation status
  cancelled: z.boolean().optional(),
  cancelledAt: z.number().optional(),
})

export const GetRequestSchema = z
  // By key
  .object({
    key: z.string(),
    trader: z.undefined().optional(),
    hyperdrive: z.undefined().optional(),
    continuationToken: z.undefined().optional(),
  })
  .or(
    // By optional prefix
    z.object({
      key: z.undefined().optional(),
      trader: z.string().transform(hexTransform).optional(),
      hyperdrive: z.string().transform(hexTransform).optional(),
      continuationToken: z.string().optional(),
    })
  )

export const QueryResponseSchema = z
  .object({
    orders: z.array(z.object({ key: z.string(), order: OrderSchema })),
  })
  .and(
    z.discriminatedUnion("hasMore", [
      z.object({
        hasMore: z.literal(false),
        nextContinuationToken: z.undefined().optional(),
      }),
      z.object({
        hasMore: z.literal(true),
        nextContinuationToken: z.string(),
      }),
    ])
  )

export const PostRequestSchema = z.object({
  order: OrderSchema,
})

export const PutRequestSchema = PostRequestSchema

export const DeleteRequestSchema = z.object({
  key: z.string(),
})

export type Order = z.infer<typeof OrderSchema>
export type PostRequest = z.infer<typeof PostRequestSchema>
export type GetRequest = z.infer<typeof GetRequestSchema>
export type OrderQueryResponse = z.infer<typeof QueryResponseSchema>
export type PutRequest = z.infer<typeof PutRequestSchema>
export type DeleteRequest = z.infer<typeof DeleteRequestSchema>

function hexTransform(value: string): `0x${string}` {
  return `0x${value}`
}
