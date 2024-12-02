import { Address, Hex, WalletClient, zeroAddress } from "viem"

// we need to construct a hash order object
// then sign it via signTypedData

// TODO update with live data
const domain = {
  name: "Hyperdrive Matching Engine",
  version: "1",
  chainId: 1,
  verifyingContract: zeroAddress,
}

// create a function using viem that signs a message with the connect wallet
async function signMessage(
  walletClient: WalletClient,
  address: Address,
  orderIntent: OrderIntent
) {
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
      trader: orderIntent.trader,
      hyperdrive: orderIntent.hyperdrive,
      amount: orderIntent.amount,
      slippageGuard: orderIntent.slippageGuard,
      minVaultSharePrice: orderIntent.minVaultSharePrice,
      options: {
        asBase: true, // base always true
        destination: orderIntent.options.destination,
        // extraData: orderIntent.options.extraData,
      },
      orderType: orderIntent.orderType,
      // this is used for eip-1271
      //   signature: "0x",
      expiry: orderIntent.expiry,
      salt: orderIntent.salt,
    },
  })

  return signature
}

// types

interface Options {
  asBase: boolean
  destination: Address
  extraData: Hex
}

export enum OrderType {
  OpenLong,
  OpenShort,
}

export interface OrderIntent {
  trader: Address
  hyperdrive: Address
  amount: bigint
  slippageGuard: bigint
  minVaultSharePrice: bigint
  options: Options
  orderType: OrderType
  signature: Hex
  expiry: bigint
  salt: Hex
}
