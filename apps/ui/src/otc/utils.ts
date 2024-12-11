import { fixed, FixedPoint } from "@delvtech/fixed-point-wasm"
import { Order, OrderIntent } from "otc-api"
import { Address, bytesToHex, WalletClient } from "viem"

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
