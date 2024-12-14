export { OtcClient } from "./client.js"

export {
  createOrderKey,
  parseOrderKey,
  updateOrderKey,
  type ParsedOrderKey,
} from "./utils/orderKey.js"

export {
  ErrorResponseSchema,
  OrderIntentSchema,
  OrderSchema,
  orderObjectSchema,
  type ErrorResponse,
  type Order,
  type OrderData,
  type OrderIntent,
  type OrderKey,
  type OrderObject,
  type OrderStatus,
} from "./schema.js"

export {
  DeleteRequestSchema,
  DeleteResponseSchema,
  type DeleteRequest,
  type DeleteResponse,
} from "../handlers/DELETE/schema.js"

export {
  GetManyRequestSchema,
  GetManyResponseSchema,
  GetOneRequestSchema,
  GetOneResponseSchema,
  GetRequestSchema,
  GetResponseSchema,
  type GetManyRequest,
  type GetManyResponse,
  type GetOneRequest,
  type GetOneResponse,
  type GetRequest,
  type GetResponse,
} from "../handlers/GET/schema.js"

export {
  NewMatchedOrderSchema,
  NewUnmatchedOrderSchema,
  PostRequestSchema,
  PostResponseSchema,
  type NewMatchedOrder,
  type NewUnmatchedOrder,
  type PostRequest,
  type PostResponse,
} from "../handlers/POST/schema.js"

export {
  PutRequestSchema,
  PutResponseSchema,
  type PutRequest,
  type PutResponse,
} from "../handlers/PUT/schema.js"
