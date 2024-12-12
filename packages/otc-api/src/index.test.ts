import { ListObjectsV2Command } from "@aws-sdk/client-s3"
import assert from "node:assert"
import { beforeEach, describe, it, mock } from "node:test"
import { DeleteResponseSchema } from "./handlers/DELETE/schema.js"
import {
  GetOneResponseSchema,
  QueryResponseSchema,
} from "./handlers/GET/schema.js"
import { PostResponseSchema } from "./handlers/POST/schema.js"
import { handler } from "./index.js"
import { s3 } from "./lib/s3.js"
import type { OrderIntent } from "./lib/schema.js"
import { bigintReplacer } from "./lib/utils/bigIntReplacer.js"
import { createOrderKey } from "./lib/utils/orders.js"

// Mock S3 client
mock.method(s3, "send", async () => ({}))

const mockHeaders = {
  origin: "http://localhost:3000",
}

const mockOrder: OrderIntent = {
  trader: "0x1234567890123456789012345678901234567890",
  hyperdrive: "0x1234567890123456789012345678901234567890",
  amount: BigInt("1000000000000000000"),
  slippageGuard: BigInt("1000000000000000000"),
  minVaultSharePrice: BigInt("1000000000000000000"),
  options: {
    asBase: true,
    destination: "0x1234567890123456789012345678901234567890",
    extraData: "0x",
  },
  orderType: 0, // assuming 0 is a valid order type
  expiry: "1234567890",
  salt: "0x123",
  signature:
    "0x1234567890123456789012345678901234567890123456789012345678901234",
}

const mockOrderString = JSON.stringify(mockOrder, bigintReplacer)

const mockOrderKey = createOrderKey({
  order: mockOrder,
  status: "pending",
})

describe("OTC API Handler", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    mock.reset()
  })

  describe("OPTIONS - CORS", () => {
    it("handles CORS preflight requests", async () => {
      const response = await handler({
        requestContext: {
          http: { method: "OPTIONS" },
        },
        headers: mockHeaders,
      } as any)

      assert.equal(response.statusCode, 200)
      assert.equal(
        response.headers?.["Access-Control-Allow-Origin"],
        "http://localhost:3000"
      )
    })
  })

  describe("GET - Query Orders", () => {
    it("gets a specific order by key", async () => {
      mock.method(s3, "send", async () => ({
        Body: {
          transformToString: async () => mockOrderString,
        },
      }))

      const response = await handler({
        requestContext: {
          http: { method: "GET" },
        },
        headers: mockHeaders,
        queryStringParameters: {
          key: createOrderKey({
            order: mockOrder,
            status: "pending",
          }),
        },
      } as any)

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.body || "")
      const parsed = GetOneResponseSchema.parse(body)
      assert.deepEqual(parsed.order, mockOrder)
    })

    it("returns 404 for non-existent order", async () => {
      mock.method(s3, "send", async () => ({
        Body: null,
      }))

      const response = await handler({
        requestContext: {
          http: { method: "GET" },
        },
        headers: mockHeaders,
        queryStringParameters: {
          key: "nonexistent",
        },
      } as any)

      assert.equal(response.statusCode, 404)
    })

    it("lists orders with filters", async () => {
      mock.method(s3, "send", async (req: any) => {
        if (req instanceof ListObjectsV2Command) {
          return {
            Contents: [
              {
                Key: createOrderKey({
                  order: mockOrder,
                  status: "pending",
                }),
              },
              {
                Key: createOrderKey({
                  order: mockOrder,
                  status: "pending",
                }),
              },
              {
                Key: createOrderKey({
                  order: {
                    ...mockOrder,
                    hyperdrive: "0xNotMe",
                  },
                  status: "pending",
                }),
              },
            ],
            IsTruncated: false,
          }
        }

        return {
          Body: {
            transformToString: async () => mockOrderString,
          },
        }
      })

      const response = await handler({
        requestContext: {
          http: { method: "GET" },
        },
        headers: mockHeaders,
        queryStringParameters: {
          status: "pending",
          hyperdrive: mockOrder.hyperdrive,
        },
      } as any)

      assert.equal(response.statusCode, 200)
      const parsedResponse = QueryResponseSchema.parse(
        JSON.parse(response.body || "")
      )
      assert.equal(parsedResponse.orders.length, 2)
      assert.equal(parsedResponse.hasMore, false)
    })
  })

  describe("POST - Create Order", () => {
    mock.method(s3, "send", async () => {})

    it("creates a new order", async () => {
      const response = await handler({
        requestContext: {
          http: { method: "POST" },
        },
        headers: mockHeaders,
        body: JSON.stringify(mockOrder, bigintReplacer),
      } as any)

      assert.equal(response.statusCode, 201)
      const body = JSON.parse(response.body || "")
      const parsed = PostResponseSchema.parse(body)
      assert(parsed.key)
      assert.deepEqual(parsed.order, mockOrder)
    })

    it("returns 409 if order already exists", async () => {
      mock.method(s3, "send", async () => ({
        Body: {
          transformToString: async () => mockOrderString,
        },
      }))

      const response = await handler({
        requestContext: {
          http: { method: "POST" },
        },
        headers: mockHeaders,
        body: JSON.stringify(mockOrder, bigintReplacer),
      } as any)

      assert.equal(response.statusCode, 409)
    })
  })

  describe("PUT - Update Order", () => {
    it("updates an existing order", async () => {
      // Mock existing order
      mock.method(s3, "send", async () => ({
        Body: {
          transformToString: async () => mockOrderString,
        },
      }))

      const response = await handler({
        requestContext: {
          http: { method: "PUT" },
        },
        headers: mockHeaders,
        body: JSON.stringify(
          { ...mockOrder, key: mockOrderKey },
          bigintReplacer
        ),
      } as any)

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.body || "")
      assert.deepEqual(body.order, mockOrder)
    })

    it("returns 404 for non-existent order", async () => {
      mock.method(s3, "send", async () => ({
        Body: null,
      }))

      const response = await handler({
        requestContext: {
          http: { method: "PUT" },
        },
        headers: mockHeaders,
        body: JSON.stringify(
          { ...mockOrder, key: mockOrderKey },
          bigintReplacer
        ),
      } as any)

      assert.equal(response.statusCode, 404)
    })
  })

  describe("DELETE - Cancel Order", () => {
    it("cancels an existing order", async () => {
      // Mock existing order
      mock.method(s3, "send", async () => ({
        Body: {
          transformToString: async () => mockOrderString,
        },
      }))

      const response = await handler({
        requestContext: {
          http: { method: "DELETE" },
        },
        headers: mockHeaders,
        body: JSON.stringify({
          key: createOrderKey({
            order: mockOrder,
            status: "pending",
          }),
        }),
      } as any)

      assert.equal(response.statusCode, 200)
      const body = JSON.parse(response.body || "")
      const parsed = DeleteResponseSchema.parse(body)
      assert(parsed.message)
      assert(parsed.deletedKey)
      assert(parsed.newKey)
      assert(parsed.order.cancelledAt)
      assert.deepStrictEqual(parsed.order, {
        ...mockOrder,
        cancelledAt: parsed.order.cancelledAt,
      })
    })

    it("returns 404 for non-existent order", async () => {
      mock.method(s3, "send", async () => ({
        Body: null,
      }))

      const response = await handler({
        requestContext: {
          http: { method: "DELETE" },
        },
        headers: mockHeaders,
        body: JSON.stringify({
          key: "nonexistent",
        }),
      } as any)

      assert.equal(response.statusCode, 404)
    })
  })
})
