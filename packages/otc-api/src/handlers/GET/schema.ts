import { z } from "zod"
import { AnyOrderSchema } from "../../lib/schema.js"
import { ensureHexPrefix } from "../../lib/utils/ensureHexPrefix.js"

// Get one //

export const GetOneRequestSchema = z.object({
  key: z.string(),
})
export type GetOneRequest = z.infer<typeof GetOneRequestSchema>

export const GetOneResponseSchema = z.object({
  key: z.string(),
  order: AnyOrderSchema,
})
export type GetOneResponse = z.infer<typeof GetOneResponseSchema>

// Query //

export const QueryParamsSchema = z.object({
  trader: z.string().transform(ensureHexPrefix).optional(),
  hyperdrive: z.string().transform(ensureHexPrefix).optional(),
  status: z
    .enum(["pending", "matched", "cancelled", "awaiting_signature"])
    .optional(),
  continuationToken: z.string().optional(),
})
export type QueryParams = z.infer<typeof QueryParamsSchema>

export const QueryResponseSchema = z
  .object({
    orders: z.array(z.object({ key: z.string(), order: AnyOrderSchema })),
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
export type QueryResponse = z.infer<typeof QueryResponseSchema>

// Merged //

export const GetRequestSchema = GetOneRequestSchema.or(QueryParamsSchema)
export type GetRequest = z.infer<typeof GetRequestSchema>

export const GetResponseSchema = GetOneResponseSchema.or(QueryResponseSchema)
export type GetResponse = z.infer<typeof GetResponseSchema>
