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
import { ErrorResponseSchema, type ErrorResponse } from "./schema.js"
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
  async addOrder(params: PostRequest) {
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
}

function isError(res: any): res is ErrorResponse {
  return "error" in res && res.error
}
