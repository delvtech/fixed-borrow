import { Address, Hex, WalletClient } from "viem"

// we need to construct a hash order object
// then sign it via signTypedData

// TODO update with live data

// create a function using viem that signs a message with the connect wallet
export async function signOrderIntent(
  matchingEngineAddress: Address,
  walletClient: WalletClient,
  address: Address,
  order: Order
) {
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
        // { name: "signature", type: "bytes" },
        { name: "expiry", type: "uint256" },
        { name: "salt", type: "bytes32" },
      ],
      Options: [
        { name: "destination", type: "address" },
        { name: "asBase", type: "bool" },
        // { name: "extraData", type: "bytes" },
      ],
    },
    primaryType: "Order",
    message: {
      trader: order.trader,
      hyperdrive: order.hyperdrive,
      amount: order.amount,
      slippageGuard: order.slippageGuard,
      minVaultSharePrice: order.minVaultSharePrice,
      options: {
        asBase: true, // base always true
        destination: order.options.destination,
        // extraData: order.options.extraData,
      },
      orderType: order.orderType,
      // this is used for eip-1271
      //   signature: "0x",
      expiry: order.expiry,
      salt: order.salt,
    },
  })

  return signature
}

// types

interface Options {
  asBase: boolean
  destination: Address
  // extraData: Hex
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
