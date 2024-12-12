import { fixed, FixedPoint } from "@delvtech/fixed-point-wasm"
import { Order, OrderIntent } from "otc-api"
import { Address, bytesToHex, WalletClient } from "viem"

export const HYPERDRIVE_MATCHING_ENGINE_ADDRESS: Address =
  "0x6662B6e771FACD61E33cCAfDc23BE16B4eAd0666"

/**
 * Signs an order intent with the given wallet client and address, using the given matching engine address.
 *
 * @param matchingEngineAddress The address of the Hyperdrive Matching Engine contract.
 * @param walletClient The wallet client to use for signing.
 * @param address The address of the user signing the order.
 * @param order The order to sign, in the form of an object.
 * @returns An object with the following properties:
 *   - `signature`: The signature of the signed order, as a hex string.
 *   - All of the properties of the original `order` object.
 */
export async function signOrderIntent(
  matchingEngineAddress: Address,
  walletClient: WalletClient,
  address: Address,
  order: Order
): Promise<OrderIntent> {
  const domain = {
    name: "Hyperdrive Matching Engine",
    version: "1",
    chainId: walletClient.chain!.id,
    verifyingContract: matchingEngineAddress,
  }
  const signature = await walletClient.signTypedData({
    account: address,
    domain,
    types: {
      Order: [
        { name: "trader", type: "address" },
        { name: "hyperdrive", type: "address" },
        { name: "amount", type: "uint256" },
        { name: "slippageGuard", type: "uint256" },
        { name: "minVaultSharePrice", type: "uint256" },
        { name: "options", type: "Options" },
        // enum as uint8
        { name: "orderType", type: "uint8" },
        { name: "expiry", type: "uint256" },
        { name: "salt", type: "bytes32" },
      ],
      Options: [
        { name: "destination", type: "address" },
        { name: "asBase", type: "bool" },
      ],
    },
    primaryType: "Order",
    message: {
      ...order,
      expiry: BigInt(order.expiry),
    },
  })

  return {
    signature,
    ...order,
  }
}

/**
 * Computes the deposit amount for a given order type and desired rate
 *
 * @param amount - order amount
 * @param orderType - 0 for long, 1 for short
 * @param desiredRate - desired fixed point rate
 * @returns deposit amount
 */
export function computeDepositAmount(
  amount: bigint,
  orderType: number,
  desiredRate: bigint
) {
  if (orderType === 0) {
    // long
    const bondPrice = FixedPoint.one().sub(desiredRate)
    return fixed(amount).mul(bondPrice).bigint
  } else {
    // short
    const x = FixedPoint.one().add(desiredRate)
    const z = FixedPoint.one().div(x)
    const shortPrice = FixedPoint.one().sub(z)
    return fixed(amount).mul(shortPrice).bigint
  }
}
/**
 * Computes the target rate for a given order type and desired rate
 *
 * @param orderType - 0 for long, 1 for short
 * @param amount - order amount
 * @param slippageGuard - desired slippage guard
 * @returns the target fixed point rate
 */
export function computeTargetRate(
  orderType: number,
  amount: bigint,
  slippageGuard: bigint
) {
  if (orderType === 0) {
    // long
    return fixed(amount).sub(fixed(slippageGuard)).div(amount)
  } else {
    // short TODO FIX
    return fixed(slippageGuard).div(fixed(amount))
  }
}

/**
 * Generates a random salt value to be used in OTC orders.
 *
 * The salt is a cryptographically secure random value, represented as a
 * 32-byte hex string.
 *
 * @returns A random salt value.
 */
export function getRandomSalt() {
  const randomBytes = crypto.getRandomValues(new Uint8Array(32))
  return bytesToHex(randomBytes)
}

export const HYPERDRIVE_MATCHING_ENGINE_ABI = [
  {
    inputs: [
      {
        components: [
          { internalType: "address", name: "trader", type: "address" },
          { internalType: "address", name: "hyperdrive", type: "address" },
          { internalType: "uint256", name: "amount", type: "uint256" },
          { internalType: "uint256", name: "slippageGuard", type: "uint256" },
          {
            internalType: "uint256",
            name: "minVaultSharePrice",
            type: "uint256",
          },
          {
            components: [
              { internalType: "bool", name: "asBase", type: "bool" },
              { internalType: "address", name: "destination", type: "address" },
              { internalType: "bytes", name: "extraData", type: "bytes" },
            ],
            internalType: "struct IHyperdrive.Options",
            name: "options",
            type: "tuple",
          },
          { internalType: "uint8", name: "orderType", type: "uint8" },
          { internalType: "bytes", name: "signature", type: "bytes" },
          { internalType: "uint256", name: "expiry", type: "uint256" },
          { internalType: "bytes32", name: "salt", type: "bytes32" },
        ],
        internalType: "struct OrderIntent[]",
        name: "_orders",
        type: "tuple[]",
      },
    ],
    name: "cancelOrders",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "sender",
        type: "address",
      },
      {
        indexed: false,
        internalType: "bytes32[]",
        name: "orderHashes",
        type: "bytes32[]",
      },
    ],
    name: "OrdersCancelled",
    type: "event",
  },
] as const

/**
 * Transforms an `OrderIntent` into the format required by the HyperdriveMatchingEngine `cancelOrders` function.
 *
 * @param intent The order intent to transform.
 * @returns The transformed order intent.
 */
export function transformIntentForCancelOrder(intent: OrderIntent) {
  return {
    ...intent,
    expiry: BigInt(intent.expiry),
    signature: intent.signature as `0x${string}`,
    // Ensure all required properties are present and of the correct type
    trader: intent.trader,
    hyperdrive: intent.hyperdrive,
    amount: BigInt(intent.amount),
    slippageGuard: BigInt(intent.slippageGuard),
    minVaultSharePrice: BigInt(intent.minVaultSharePrice),
    options: {
      asBase: Boolean(intent.options.asBase),
      destination: intent.options.destination,
      extraData: intent.options.extraData,
    },
    Type: Number(intent.orderType),
    salt: intent.salt,
  }
}
