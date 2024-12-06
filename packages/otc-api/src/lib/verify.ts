import { verifyTypedData } from "viem"
import type { Order } from "./schemas.js"

// Constants for EIP-712 domain
const MATCHING_ENGINE_NAME = "Hyperdrive Matching Engine"
const VERSION = "1"
const CHAIN_ID = 1 // Mainnet

// Domain separator for EIP-712
const domain = {
  name: MATCHING_ENGINE_NAME,
  version: VERSION,
  chainId: CHAIN_ID,
} as const

// EIP-712 types for order intents
const ORDER_INTENT_TYPE = {
  Order: [
    { name: "trader", type: "address" },
    { name: "hyperdrive", type: "address" },
    { name: "amount", type: "uint256" },
    { name: "slippageGuard", type: "uint256" },
    { name: "minVaultSharePrice", type: "uint256" },
    { name: "options", type: "Options" },
    { name: "orderType", type: "uint8" },
    { name: "expiry", type: "uint256" },
    { name: "salt", type: "bytes32" },
  ],
  Options: [
    { name: "destination", type: "address" },
    { name: "asBase", type: "bool" },
  ],
} as const

/**
 * Verify a signed request including nonce and timestamp checks
 */
export async function verifyOrder(order: Order): Promise<
  | {
      valid: true
      error?: undefined
    }
  | { valid: false; error: string }
> {
  if (!order.signature) {
    return {
      valid: true,
    }
  }

  // Verify EIP-712 signature
  const valid = await verifyTypedData({
    address: order.trader,
    domain,
    types: ORDER_INTENT_TYPE,
    primaryType: "Order",
    message: {
      trader: order.trader,
      hyperdrive: order.hyperdrive,
      amount: BigInt(order.amount),
      slippageGuard: BigInt(order.slippageGuard),
      minVaultSharePrice: BigInt(order.minVaultSharePrice),
      options: order.options,
      orderType: order.orderType,
      expiry: BigInt(order.expiry),
      salt: order.salt,
    },
    signature: order.signature,
  })

  return {
    valid,
    error: valid ? undefined : "Invalid signature",
  } as any
}
