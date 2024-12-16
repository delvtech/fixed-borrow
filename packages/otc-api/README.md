# Hyperdrive OTC API

A simple AWS Lambda function that accepts CRUD operations on OTC orders stored in S3.

## Usage

The function is deployed to an AWS Lambda. This package exports a client class, schemas, and utils that can be used to interact with it.

### `OtcClient`

The package exports an `OtcClient` class that can be used for type-safe interactions with the API.

```ts
import { OtcClient } from "otc-api"

const otcApiUrl = import.meta.env.VITE_OTC_API_URL
const client = new OtcClient(otcApiUrl)
```

#### `getOrders`

Get a paginated list of orders matching optional filters.

```ts
const allOrders = await client.getOrders()

// Filter by status
const pendingOrders = await client.getOrders({ status: "pending" })
```

Available filters:

```ts
type QueryParams = {
  trader?: `0x${string}`
  hyperdrive?: `0x${string}`
  status?: "pending" | "matched" | "cancelled" | "awaiting_signature"
  continuationToken?: string
}
```

#### `getOrder`

Get a specific order by key.

```ts
const order = await client.getOrder(orderKey)
```

#### Create a new order

Use `createOrder` to create a new order.

```ts
const response = await client.createOrder({
  trader: "0x1234567890123456789012345678901234567890",
  // ...
})
```

#### `updateOrder`

Uppdate an existing order. Optionally create the order if it doesn't already exist by setting the `upsert` to `true`.

```ts
const response = await client.updateOrder({
  key: unsignedOrderKey,
  signature:
    "0x1234567890123456789012345678901234567890123456789012345678901234",
  // ...
})
```

#### `cancelOrder`

Cancel an existing order.

```ts
const response = await client.cancelOrder(orderKey)
```

#### `matchOrders`

Updated 2 pending orders as matched.

```ts
const response = await client.matchOrders(orderKey1, orderKey2)
```

### Utils

#### `createOrderKey`

Create an order key for an object in S3.

```ts
import { createOrderKey } from "otc-api"

const orderKey = createOrderKey("pending", order)
```

#### `parseOrderKey`

Parse an order key from an object in S3.

```ts
import { parseOrderKey } from "otc-api"

const parsedOrderKey = parseOrderKey(orderKey)
// -> {
//   status: "pending",
//   trader: "0x1234567890123456789012345678901234567890",
//   hyperdrive: "0x1234567890123456789012345678901234567890",
//   orderType: 0,
//   salt: "0x1234567890123456789012345678901234567890123456789012345678901234",
// }
```

#### `updateOrderKey`

Alter the properties of an order key and return a new key.

````ts
import { updateOrderKey } from "otc-api"

const newOrderKey = updateOrderKey(orderKey, { status: "matched" })
``` =

## Deployment

Build and zip the function:

```sh
yw otc-api build
````

This will generate a `function.zip` file in the root of the package. Upload this to the AWS Lambda to deploy the function.
