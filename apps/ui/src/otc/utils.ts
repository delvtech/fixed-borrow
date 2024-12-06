import { Address, Hex, WalletClient } from "viem"

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
    message: order,
  })

  return {
    signature,
    ...order,
  }
}

interface Options {
  asBase: boolean
  destination: Address
  extraData: Hex
}

export enum OrderType {
  OpenLong,
  OpenShort,
}

export interface Order {
  trader: Address
  hyperdrive: Address
  amount: bigint
  slippageGuard: bigint
  minVaultSharePrice: bigint
  options: Options
  orderType: OrderType
  expiry: bigint
  salt: Hex
}

export interface OrderIntent extends Order {
  signature: Hex
}
