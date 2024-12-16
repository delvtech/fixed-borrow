import { z } from "zod"
import {
  ErrorResponse,
  Order,
  OrderKey,
  OrderObject,
  OrderStatus,
  SuccessResponse,
} from "../../lib/schema.js"

// Get one //

export function GetOneRequest<T extends OrderStatus>(...statuses: T[]) {
  return z.object({
    key: OrderKey(...statuses),
  })
}
export type GetOneRequest<T extends OrderStatus = OrderStatus> = z.infer<
  ReturnType<typeof GetOneRequest<T>>
>

export function GetOneResponse<T extends OrderStatus>(...statuses: T[]) {
  return ErrorResponse.or(SuccessResponse.and(OrderObject(...statuses)))
}
export type GetOneResponse<T extends OrderStatus = OrderStatus> = z.infer<
  ReturnType<typeof GetOneResponse<T>>
>

// Get many //

export function GetManyRequest<T extends OrderStatus>(...statuses: T[]) {
  return Order.pick({
    hyperdrive: true,
    orderType: true,
    trader: true,
  })
    .extend({
      key: z.undefined().optional(),
      status: z
        .string()
        .refine((s): s is T =>
          statuses.length
            ? statuses.includes(s as T)
            : OrderStatus.safeParse(s).success
        ),
      continuationToken: z.string().optional(),
    })
    .partial()
}
export type GetManyRequest<T extends OrderStatus = OrderStatus> = z.infer<
  ReturnType<typeof GetManyRequest<T>>
>

export function GetManyResponse<T extends OrderStatus>(...statuses: T[]) {
  return ErrorResponse.or(
    SuccessResponse.extend({
      orders: OrderObject(...statuses).array(),
    }).and(
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
  )
}
export type GetManyResponse<T extends OrderStatus = OrderStatus> = z.infer<
  ReturnType<typeof GetManyResponse<T>>
>

// Union //

export function GetRequest<T extends OrderStatus>(...statuses: T[]) {
  return GetOneRequest(...statuses).or(GetManyRequest(...statuses))
}
export type GetRequest<T extends OrderStatus = OrderStatus> = z.infer<
  ReturnType<typeof GetRequest<T>>
>

export function GetResponse<T extends OrderStatus>(...statuses: T[]) {
  return GetOneResponse(...statuses).or(GetManyResponse(...statuses))
}
export type GetResponse<T extends OrderStatus = OrderStatus> = z.infer<
  ReturnType<typeof GetResponse<T>>
>
