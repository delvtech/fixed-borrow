import { z } from "zod"
import {
  AnyOrderKeySchema,
  OrderObjectSchema,
  OrderSchema,
  OrderStatusSchema,
  type OrderObject,
  type OrderStatus,
} from "../../lib/schema.js"

// Get one //

export const GetOneRequestSchema = z.object({
  key: AnyOrderKeySchema,
})
export type GetOneRequest = z.infer<typeof GetOneRequestSchema>

export const GetOneResponseSchema = OrderObjectSchema
export type GetOneResponse<T extends OrderStatus = OrderStatus> = OrderObject<T>

// Get many //

export const GetManyRequestSchema = OrderSchema.pick({
  hyperdrive: true,
  orderType: true,
  trader: true,
})
  .extend({
    key: z.undefined().optional(),
    status: OrderStatusSchema,
    continuationToken: z.string().optional(),
  })
  .partial()
type _GetManyRequest = z.infer<typeof GetManyRequestSchema>

export type GetManyRequest<T extends OrderStatus = OrderStatus> =
  OrderStatus extends T
    ? _GetManyRequest
    : { status: T } & Omit<_GetManyRequest, "status">

export const GetManyResponseSchema = z
  .object({
    orders: z.array(OrderObjectSchema),
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
type _GetManyResponse = z.infer<typeof GetManyResponseSchema>

export type GetManyResponse<T extends OrderStatus = OrderStatus> =
  OrderStatus extends T
    ? _GetManyResponse
    : { orders: OrderObject<T>[] } & Omit<_GetManyResponse, "orders">

// Union //

export const GetRequestSchema = GetOneRequestSchema.or(GetManyRequestSchema)
export type GetRequest = z.infer<typeof GetRequestSchema>

export const GetResponseSchema = GetOneResponseSchema.or(GetManyResponseSchema)
export type GetResponse = z.infer<typeof GetResponseSchema>
