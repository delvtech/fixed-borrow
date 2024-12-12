import { DeleteResponseSchema } from "../handlers/DELETE/schema.js"
import {
  GetOneResponseSchema,
  QueryResponseSchema,
  type QueryParams,
} from "../handlers/GET/schema.js"
import {
  PostResponseSchema,
  type PostRequest,
} from "../handlers/POST/schema.js"
import { PutResponseSchema, type PutRequest } from "../handlers/PUT/schema.js"
import {
  ErrorResponseSchema,
  type ErrorResponse,
  type OrderIntent,
} from "./schema.js"
import { bigintReplacer } from "./utils/bigIntReplacer.js"

export class OtcClient {
  public constructor(public readonly otcApiUrl: string) {}

  /**
   * Get a single order by key
   */
  async getOrder(key: string) {
    const url = `${this.otcApiUrl}?key=${key}`
    const response = await fetch(url)
    const obj = await response.json()
    if (isError(obj)) {
      return ErrorResponseSchema.parse(obj)
    }
    return GetOneResponseSchema.parse(obj)
  }

  /**
   * Get a list of orders
   */
  async getOrders(params?: QueryParams) {
    const searchParams = new URLSearchParams(params)
    const url = `${this.otcApiUrl}?${searchParams.toString()}`
    const response = await fetch(url)
    const obj = await response.json()
    if (isError(obj)) {
      return ErrorResponseSchema.parse(obj)
    }
    return QueryResponseSchema.parse(obj)
  }

  /**
   * Upload a new order
   */
  async createOrder(params: PostRequest) {
    const response = await fetch(this.otcApiUrl, {
      method: "POST",
      body: JSON.stringify(params, bigintReplacer),
    })
    const obj = await response.json()
    if (isError(obj)) {
      return ErrorResponseSchema.parse(obj)
    }
    return PostResponseSchema.parse(obj)
  }

  /**
   * Update an existing order
   */
  async updateOrder(params: PutRequest) {
    const response = await fetch(this.otcApiUrl, {
      method: "PUT",
      body: JSON.stringify(params, bigintReplacer),
    })
    const obj = await response.json()
    if (isError(obj)) {
      return ErrorResponseSchema.parse(obj)
    }
    return PutResponseSchema.parse(obj)
  }

  /**
   * Cancel an existing order
   */
  async cancelOrder(key: string) {
    const response = await fetch(this.otcApiUrl, {
      method: "DELETE",
      body: JSON.stringify({ key }),
    })
    const obj = await response.json()
    if (isError(obj)) {
      return ErrorResponseSchema.parse(obj)
    }
    return DeleteResponseSchema.parse(obj)
  }

  /**
   * Match existing orders
   */
  async matchOrders(key1: string, key2: string) {
    // Ensure the keys are not the same
    if (key1 === key2) {
      return ErrorResponseSchema.parse({
        error: "Cannot match order with itself",
      })
    }

    // Fetch full order details
    const orders = await Promise.all([this.getOrder(key1), this.getOrder(key2)])

    // Ensure both orders are signed
    for (const order of orders) {
      if (isError(order)) {
        return ErrorResponseSchema.parse(order)
      }
      if (!order.order.signature) {
        return ErrorResponseSchema.parse({
          error: `Order ${order.key} is not signed`,
        })
      }
    }

    // Update orders as matched
    const matchedAt = Date.now()
    return await Promise.all(
      (orders as { key: string; order: OrderIntent }[]).map((order) =>
        this.updateOrder({
          ...order.order,
          key: order.key,
          matchKey: key2,
          matchedAt,
        })
      )
    )
  }
}

function isError(res: any): res is ErrorResponse {
  return "error" in res && res.error
}
