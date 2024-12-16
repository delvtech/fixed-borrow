export { OtcClient } from "./client.js"

export {
  createOrderKey,
  parseOrderKey,
  updateOrderKey,
  type ParsedOrderKey,
} from "./utils/orderKey.js"

// Schemas //

export {
  Order,
  OrderData,
  OrderIntent,
  OrderKey,
  OrderObject,
  OrderStatus,
  OtcApiResponse,
} from "./schema.js"

export { DeleteRequest, DeleteResponse } from "../handlers/DELETE/schema.js"
export {
  GetManyRequest,
  GetManyResponse,
  GetOneRequest,
  GetOneResponse,
  GetRequest,
  GetResponse,
} from "../handlers/GET/schema.js"
export { PostRequest, PostResponse } from "../handlers/POST/schema.js"
export {
  NewMatchedOrder,
  NewOrder,
  NewUnmatchedOrder,
  OrderUpdate,
  OrderUpsert,
  PutRequest,
  PutResponse,
} from "../handlers/PUT/schema.js"
