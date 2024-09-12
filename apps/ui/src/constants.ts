import { Address, Chain } from "viem"
import { mainnet, sepolia } from "viem/chains"
import { delvChain } from "./client/rainbowClient"

export const supportedChainIds: Chain["id"][] = [
  mainnet.id,
  sepolia.id,
] as const

export type SupportedChainId = 1 | 11155111 | 42069

export const morphoAddressesByChain: Record<
  SupportedChainId,
  {
    blue: Address
    irm: Address
  }
> = {
  [mainnet.id]: {
    blue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
  },
  [sepolia.id]: {
    blue: "0x927A9E3C4B897eF5135e6B2C7689637fA8E2E0Bd",
    irm: "0x0fB591F09ab2eB967c0EFB9eE0EF6642c2abe6Ab",
  },
  [delvChain.id]: {
    blue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
  },
}

export const dayInSeconds = 60 * 60 * 24
