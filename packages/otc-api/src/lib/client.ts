import { DeleteResponse } from "../handlers/DELETE/schema.js"
import {
  GetManyResponse,
  GetOneResponse,
  type GetManyRequest,
} from "../handlers/GET/schema.js"
import { PostResponse, type PostRequest } from "../handlers/POST/schema.js"
import { PutResponse, type PutRequest } from "../handlers/PUT/schema.js"
import { ErrorResponse, type OrderKey, type OrderStatus } from "./schema.js"
import { bigintReplacer } from "./utils/bigIntReplacer.js"
import { parseOrderKey } from "./utils/orderKey.js"

export class OtcClient {
  public constructor(public readonly otcApiUrl: string) {}

  /**
   * Get a single order by key
   */
  async getOrder<T extends OrderStatus = OrderStatus>(key: OrderKey<T>) {
    const url = `${this.otcApiUrl}?key=${key}`
    const response = await fetch(url)
    const data = await response.json()
    if (isError(data)) {
      return ErrorResponse.parse(data)
    }
    const { status } = parseOrderKey(key)
    return GetOneResponse(status).parse(data) as GetOneResponse<T>
  }

  /**
   * Get a list of orders
   */
  async getOrders<T extends OrderStatus = OrderStatus>(
    params: GetManyRequest<T> = {} as GetManyRequest<T>
  ) {
    const paramEntries: [string, string][] = []
    for (const [k, v] of Object.entries(params)) {
      if (v) paramEntries.push([k, String(v)])
    }
    const searchParams = new URLSearchParams(paramEntries)
    const url = `${this.otcApiUrl}?${searchParams.toString()}`
    const response = await fetch(url)
    const data = await response.json()
    if (isError(data)) {
      return ErrorResponse.parse(data)
    }
    const schema = params.status
      ? GetManyResponse(params.status)
      : GetManyResponse()
    return schema.parse(data) as GetManyResponse<T>
  }

  /**
   * Upload a new order
   */
  async createOrder(params: PostRequest) {
    const response = await fetch(this.otcApiUrl, {
      method: "POST",
      body: JSON.stringify(params, bigintReplacer),
    })
    const data = await response.json()
    if (isError(data)) {
      return ErrorResponse.parse(data)
    }
    return PostResponse.parse(data)
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
      return ErrorResponse.parse(obj)
    }
    return PutResponse.parse(obj)
  }

  /**
   * Cancel an existing order
   */
  async cancelOrder(key: OrderKey<"awaiting_signature" | "pending">) {
    const response = await fetch(this.otcApiUrl, {
      method: "DELETE",
      body: JSON.stringify({ key }),
    })
    const obj = await response.json()
    if (isError(obj)) {
      return ErrorResponse.parse(obj)
    }
    return DeleteResponse.parse(obj)
  }

  /**
   * Match existing orders
   */
  async matchOrders(key1: OrderKey<"pending">, key2: OrderKey<"pending">) {
    return this.updateOrder({
      key: key1,
      matchKey: key2,
    })
  }
}

function isError(res: any): res is ErrorResponse {
  return "error" in res && res.error
}

const otcClient = new OtcClient('OTC_API_URL')

const response = await otcClient.getOrders({
  status: "pending",
})
