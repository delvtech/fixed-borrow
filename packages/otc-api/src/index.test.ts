import {
  DeleteObjectCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
} from "@aws-sdk/client-s3"
import type { LambdaFunctionURLEvent } from "aws-lambda"
import assert from "node:assert"
import { describe, it, mock } from "node:test"
import { DeleteResponse, type DeleteRequest } from "./handlers/DELETE/schema.js"
import {
  GetManyResponse,
  GetOneResponse,
  type GetRequest,
} from "./handlers/GET/schema.js"
import { PostResponse, type PostRequest } from "./handlers/POST/schema.js"
import {
  PutResponse,
  type NewMatchedOrder,
  type NewUnmatchedOrder,
  type PutRequest,
} from "./handlers/PUT/schema.js"
import { handler } from "./index.js"
import { s3 } from "./lib/s3.js"
import type { OrderData, OrderIntent } from "./lib/schema.js"
import { bigintReplacer } from "./lib/utils/bigIntReplacer.js"
import { createOrderKey, updateOrderKey } from "./lib/utils/orderKey.js"

const mockOrder: OrderIntent = {
  trader: "0xAlice",
  hyperdrive: "0x",
  amount: 1n,
  slippageGuard: 1n,
  minVaultSharePrice: 1n,
  options: {
    asBase: true,
    destination: "0x",
    extraData: "0x",
  },
  orderType: 0,
  expiry: 1,
  salt: "0x",
  signature: "0x",
}
const mockOrderStatus = "pending"
const mockOrderKey = createOrderKey(mockOrderStatus, mockOrder)
const mockOrderJson = JSON.stringify(mockOrder, bigintReplacer)

const mockOrder2: OrderIntent = {
  ...mockOrder,
  trader: "0xBob",
  orderType: 1,
}
const mockOrderStatus2 = "pending"
const mockOrderKey2 = createOrderKey(mockOrderStatus2, mockOrder2)
const mockOrderJson2 = JSON.stringify(mockOrder2, bigintReplacer)

describe("OTC API Handler", () => {
  // Mock the s3 client
  mock.method(s3, "send", async (req: unknown) => {
    if (req instanceof DeleteObjectCommand) return
    if (req instanceof ListObjectsV2Command) {
      return {
        Contents: [
          {
            Key: mockOrderKey,
          },
          {
            Key: mockOrderKey,
          },
          {
            Key: mockOrderKey2,
          },
        ],
        IsTruncated: false,
      }
    }
    if (req instanceof GetObjectCommand) {
      return {
        Body: {
          transformToString: async () => {
            return {
              [mockOrderKey]: mockOrderJson,
              [mockOrderKey2]: mockOrderJson2,
            }[req.input.Key || ""]
          },
        },
      }
    }
    if (req instanceof PutObjectCommand) return
  })

  describe("OPTIONS - CORS", () => {
    it("handles CORS preflight requests", async () => {
      const event = createMockEvent("OPTIONS")
      const response = await handler(event)
      assert.strictEqual(response.statusCode, 200)
      assert.strictEqual(
        response.headers?.["Access-Control-Allow-Origin"],
        event.headers.origin
      )
    })
  })

  describe("GET - Query Orders", () => {
    it("lists orders", async () => {
      const event = createMockEvent("GET")
      const response = await handler(event)
      assert.strictEqual(response.statusCode, 200)
      const body = JSON.parse(response.body || "")
      const parsed = GetManyResponse().parse(body)
      assert(parsed.success)
      assert.strictEqual(parsed.orders.length, 3)
      assert.strictEqual(parsed.hasMore, false)
    })

    it("lists filtered orders", async () => {
      const event = createMockEvent("GET", {
        queryStringParameters: {
          trader: mockOrder.trader,
        },
      })
      const response = await handler(event)
      assert.strictEqual(response.statusCode, 200)
      const body = JSON.parse(response.body || "")
      const parsed = GetManyResponse().parse(body)
      assert(parsed.success)
      // Only 2 orders with the given trader
      assert.strictEqual(parsed.orders.length, 2)
    })

    it("gets one order by key", async () => {
      const event = createMockEvent("GET", {
        queryStringParameters: {
          key: mockOrderKey,
        },
      })
      const response = await handler(event)
      assert.strictEqual(response.statusCode, 200)
      const body = JSON.parse(response.body || "")
      const parsed = GetOneResponse().parse(body)
      assert(parsed.success)
      assert.deepEqual(parsed.data, mockOrder)
    })

    it("returns 404 for non-existent order", async () => {
      const event = createMockEvent("GET", {
        queryStringParameters: {
          key: "pending/",
        },
      })
      const response = await handler(event)
      assert.strictEqual(response.statusCode, 404)
    })
  })

  describe("POST - Create Order", () => {
    it("returns 409 if order already exists", async () => {
      const event = createMockEvent("POST", { body: mockOrder })
      const response = await handler(event)
      assert.strictEqual(response.statusCode, 409)
    })

    it("saves new signed orders as 'pending'", async () => {
      const newOrder: NewUnmatchedOrder = {
        ...mockOrder,
        trader: "0xNewOrder",
      }
      const event = createMockEvent("POST", { body: newOrder })
      const response = await handler(event)
      assert.strictEqual(response.statusCode, 201)
      const body = JSON.parse(response.body || "")
      const parsed = PostResponse.parse(body)
      assert(parsed.success)
      assert.strictEqual(parsed.key, createOrderKey("pending", newOrder))
      assert.deepEqual(parsed.data, newOrder)
    })

    it("saves unsigned orders as 'awaiting_signature'", async () => {
      const unsignedOrder: OrderData<"awaiting_signature"> = {
        ...mockOrder,
        signature: undefined,
      }
      const response = createMockEvent("POST", { body: unsignedOrder })
      const res = await handler(response)
      const body = JSON.parse(res.body || "")
      const parsed = PostResponse.parse(body)
      assert(parsed.success)
      assert.strictEqual(
        parsed.key,
        createOrderKey("awaiting_signature", unsignedOrder)
      )
    })

    it("saves signed orders as 'matched' when a `matchKey` is provided", async () => {
      const signedOrder: NewMatchedOrder = {
        ...mockOrder,
        matchKey: createOrderKey("pending", mockOrder),
      }
      const req = createMockEvent("POST", { body: signedOrder })
      const res = await handler(req)
      const body = JSON.parse(res.body || "")
      const parsed = PostResponse.parse(body)
      assert(parsed.success)
      assert.strictEqual(parsed.key, createOrderKey("matched", signedOrder))
    })

    it("returns 400 if a `matchKey` is provided for an unsigned order", async () => {
      const invalidOrder: OrderData<"awaiting_signature"> &
        Pick<NewMatchedOrder, "matchKey"> = {
        ...mockOrder,
        signature: undefined,
        matchKey: createOrderKey("pending", mockOrder),
      }
      const event = createMockEvent("POST", {
        body: invalidOrder as OrderData<"awaiting_signature">,
      })
      const response = await handler(event)
      assert.strictEqual(response.statusCode, 400)
    })
  })

  describe("PUT - Update Order", () => {
    it("returns 404 for non-existent order", async () => {
      const event = createMockEvent("PUT", {
        body: {
          key: "pending/",
        },
      })
      const response = await handler(event)
      assert.strictEqual(response.statusCode, 404)
    })

    it("updates an existing order", async () => {
      const event = createMockEvent("PUT", {
        body: {
          key: mockOrderKey,
          amount: mockOrder.amount + 1n,
        },
      })
      const response = await handler(event)
      assert.strictEqual(response.statusCode, 200)
      const body = JSON.parse(response.body || "")
      const parsed = PutResponse.parse(body)
      assert(parsed.success)
      assert.strictEqual(parsed.data.amount, mockOrder.amount + 1n)
    })
  })

  describe("DELETE - Cancel Order", () => {
    it("returns 404 for non-existent order", async (t) => {
      const event = createMockEvent("DELETE", { body: { key: "pending/" } })
      const response = await handler(event)
      assert.strictEqual(response.statusCode, 404)
    })

    it("cancels an existing order", async () => {
      const event = createMockEvent("DELETE", {
        body: {
          key: mockOrderKey,
        },
      })
      const response = await handler(event)
      assert.strictEqual(response.statusCode, 200)
      const body = JSON.parse(response.body || "")
      const parsed = DeleteResponse.parse(body)
      assert(parsed.success)
      assert.strictEqual(parsed.status, "cancelled")
      assert.strictEqual(
        parsed.key,
        updateOrderKey(mockOrderKey, { status: "cancelled" })
      )
      assert(typeof parsed.data.cancelledAt === "number")
    })
  })
})

interface MethodBodyMap {
  DELETE: DeleteRequest
  GET: never
  OPTIONS: never
  POST: PostRequest
  PUT: PutRequest
}
type Method = keyof MethodBodyMap
interface MockEventOverrides<T extends Method = Method> {
  queryStringParameters?: GetRequest
  body?: MethodBodyMap[T]
}

/**
 * Create a mock Lambda event object.
 */
function createMockEvent<T extends Method>(
  method: T,
  { body, queryStringParameters = {} }: MockEventOverrides<T> = {}
) {
  return {
    queryStringParameters,
    body: JSON.stringify(body, bigintReplacer),
    headers: { origin: "http://localhost:3000" },
    requestContext: { http: { method } },
  } as unknown as LambdaFunctionURLEvent
}
