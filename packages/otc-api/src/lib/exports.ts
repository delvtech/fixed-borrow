export { OtcClient } from "./client.js"

export { createOrderKey, parseOrderKey } from "./utils/orders.js"

export {
  AnyOrderSchema,
  CanceledOrderSchema,
  ErrorResponseSchema,
  MatchedOrderSchema,
  OrderIntentSchema,
  OrderSchema,
  type AnyOrder,
  type CanceledOrder,
  type ErrorResponse,
  type MatchedOrder,
  type Order,
  type OrderIntent,
} from "./schema.js"

export {
  DeleteRequestSchema,
  DeleteResponseSchema,
  type DeleteRequest,
  type DeleteResponse,
} from "../handlers/DELETE/schema.js"

export {
  GetOneRequestSchema,
  GetOneResponseSchema,
  GetRequestSchema,
  GetResponseSchema,
  QueryParamsSchema,
  QueryResponseSchema,
  type GetOneRequest,
  type GetOneResponse,
  type GetRequest,
  type GetResponse,
  type QueryParams,
  type QueryResponse,
} from "../handlers/GET/schema.js"

export {
  PostRequestSchema,
  PostResponseSchema,
  type PostRequest,
  type PostResponse,
} from "../handlers/POST/schema.js"

export {
  PutRequestSchema,
  PutResponseSchema,
  type PutRequest,
  type PutResponse,
} from "../handlers/PUT/schema.js"
