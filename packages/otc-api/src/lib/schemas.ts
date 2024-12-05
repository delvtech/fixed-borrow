import { z } from "zod"

export const OrderSchema = z.object({
  signature: z.string().optional(),
  trader: z.string(),
  hyperdrive: z.string(),
  amount: z.string(),
  slippageGuard: z.string(),
  minVaultSharePrice: z.string(),
  options: z.object({
    asBase: z.boolean(),
    destination: z.string(),
    extraData: z.string(),
  }),
  orderType: z.enum(["OpenLong", "OpenShort"]),
  expiry: z.string(),
  salt: z.string(),
})

export const PostSchema = z.object({
  order: OrderSchema,
})

export const GetSchema = z
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
      trader: z.string().optional(),
      hyperdrive: z.string().optional(),
      continuationToken: z.string().optional(),
    })
  )

export const PutSchema = z.object({
  key: z.string(),
  order: OrderSchema.partial(),
})

export const DeleteSchema = z.object({
  key: z.string(),
})

export type Order = z.infer<typeof OrderSchema>
export type PostRequest = z.infer<typeof PostSchema>
export type GetRequest = z.infer<typeof GetSchema>
export type PutRequest = z.infer<typeof PutSchema>
export type DeleteRequest = z.infer<typeof DeleteSchema>
