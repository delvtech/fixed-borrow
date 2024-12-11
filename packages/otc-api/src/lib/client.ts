import {
  QueryResponseSchema,
  type QueryParams,
} from "../handlers/GET/schema.js"
import {
  PostResponseSchema,
  type PostRequest,
} from "../handlers/POST/schema.js"
import { PutResponseSchema, type PutRequest } from "../handlers/PUT/schema.js"
import { OrderSchema } from "./schema.js"

export class OtcClient {
  public constructor(public readonly otcApiUrl: string) {}

  /**
   * Get a single order by key
   */
  async getOrder(key: string) {
    const url = `${this.otcApiUrl}?key=${key}`
    const response = await fetch(url)
    const json = await response.json()
    return OrderSchema.parse(json)
  }

  /**
   * Get a single order by key
   */
  async getOrders(params?: QueryParams) {
    const searchParams = new URLSearchParams(params)
    const url = `${this.otcApiUrl}?${searchParams.toString()}`
    const response = await fetch(url)
    const json = await response.json()
    return QueryResponseSchema.parse(json)
  }

  /**
   * Upload a new order
   */
  async addOrder(params: PostRequest) {
    const response = await fetch(this.otcApiUrl, {
      method: "POST",
      body: JSON.stringify(params),
    })
    const json = await response.json()
    return PostResponseSchema.parse(json)
  }

  /**
   * Update an existing order
   */
  async updateOrder(params: PutRequest) {
    const response = await fetch(this.otcApiUrl, {
      method: "PUT",
      body: JSON.stringify(params),
    })
    const json = await response.json()
    return PutResponseSchema.parse(json)
  }

  /**
   * Cancel an existing order
   */
  async cancelOrder(key: string) {
    const response = await fetch(this.otcApiUrl, {
      method: "DELETE",
      body: JSON.stringify({ key }),
    })
    const json = await response.json()
    return PutResponseSchema.parse(json)
  }
}
