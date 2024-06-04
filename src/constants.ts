import { Address, Chain } from "viem"
import { mainnet, sepolia } from "viem/chains"

export const whitelistedHyperdriveMarkets: Address[] = [
  "0xb4E605E079B4D9ed50B7202Ca0d008EE473A8de4",
]

export const supportedChainIds: Chain["id"][] = [
  mainnet.id,
  sepolia.id,
] as const
export type SupportedChainId = (typeof supportedChainIds)[number]

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
}

export const whitelistedMetaMorphoMarketsByChain: Record<
  SupportedChainId,
  string[]
> = {
  [mainnet.id]: [],
  [sepolia.id]: [
    "0xdac958d8b0bb0272be51fb3e204ac384d5b463c10b141a3ffb68777857ac2e10",
  ],
}
