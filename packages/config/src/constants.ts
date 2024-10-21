import { Address, Chain } from "viem"
import { mainnet, sepolia } from "viem/chains"

export const delvChain = {
  id: 707,
  name: "HRB Testnet",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: {
      http: ["http://ec2-3-18-106-165.us-east-2.compute.amazonaws.com:8545/"],
    },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://etherscan.io" },
  },
  contracts: {
    ensRegistry: {
      address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    },
    ensUniversalResolver: {
      address: "0xE4Acdd618deED4e6d2f03b9bf62dc6118FC9A4da",
      blockCreated: 16773775,
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 14353601,
    },
  },
} as const satisfies Chain

export const supportedChainIds: Chain["id"][] = [
  mainnet.id,
  sepolia.id,
  delvChain.id,
] as const

export type SupportedChainId = 1 | 11155111 | 707

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

export const whitelistedMetaMorphoMarketsByChain: Record<
  SupportedChainId,
  { morphoId: string; hyperdrive: Address }[]
> = {
  [mainnet.id]: [
    // sUSDe / DAI 86%
    {
      morphoId:
        "0x39d11026eae1c6ec02aa4c0910778664089cdd97c3fd23f68f7cd05e2e95af48",
      hyperdrive: "0xd41225855A5c5Ba1C672CcF4d72D1822a5686d30",
    },
    // USDe / DAI 86%
    {
      morphoId:
        "0xc581c5f70bd1afa283eed57d1418c6432cbff1d862f94eaf58fdd4e46afbb67f",
      hyperdrive: "0xA29A771683b4857bBd16e1e4f27D5B6bfF53209B",
    },
    // {
    //   morphoId:
    //     "0xd0e50cdac92fe2172043f5e0c36532c6369d24947e40968f34a5e8819ca9ec5d",
    //   hyperdrive: "0xc8D47DE20F7053Cc02504600596A647A482Bbc46",
    // },
  ],
  [sepolia.id]: [
    {
      morphoId:
        "0xb9049de02baa044eb4bf58fc00f772c310bac9e9d1857c3517aa9d41b12fe762",
      hyperdrive: "0x00583284597c48A5de4753A2374076C289B93505",
    },
    // {
    //   morphoId:
    //     "0x25265c1600f7ba171c1037d6a3b431516e817efa9b580d8089cdb51ba719da96",
    //   hyperdrive: "0xE352F4D16C7Ee4162d1aa54b77A15d4DA8f35f4b",
    // },
    {
      morphoId:
        "0x3ac16258a0f8e99f393bf117c45048187f87beacc8d7873d52436a003726b2d5",
      hyperdrive: "0x0399BBA8DE5959007148a95ADaaD04eA3172513E",
    },
  ],
  [delvChain.id]: [
    {
      morphoId:
        "0x39d11026eae1c6ec02aa4c0910778664089cdd97c3fd23f68f7cd05e2e95af48",
      hyperdrive: "0xd41225855A5c5Ba1C672CcF4d72D1822a5686d30",
    },
    {
      morphoId:
        "0x8e6aeb10c401de3279ac79b4b2ea15fc94b7d9cfc098d6c2a1ff7b2b26d9d02c",
      hyperdrive: "0xA29A771683b4857bBd16e1e4f27D5B6bfF53209B",
    },
    {
      morphoId:
        "0xd0e50cdac92fe2172043f5e0c36532c6369d24947e40968f34a5e8819ca9ec5d",
      hyperdrive: "0xc8D47DE20F7053Cc02504600596A647A482Bbc46",
    },
  ],
}

export const tokenIconBySymbol: Record<string, string> = {
  DAI: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=032",
  SDAI: "https://1827921443-files.gitbook.io/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces%2FjvdfbhgN5UCpMtP1l8r5%2Fuploads%2Fgit-blob-9873db4416f6c6f7f29d9be3ead28f5317f3dfa3%2FBadge_Dai%202.svg?alt=media",
  sUSDe: "https://cdn.morpho.org/assets/logos/usde.svg",
  USDe: "https://cdn.morpho.org/assets/logos/susde.svg",
  wstETH: "https://cdn.morpho.org/assets/logos/wsteth.svg",
  USDC: "https://cryptologos.cc/logos/usd-coin-usdc-logo.svg?v=033",
  WETH: "https://cdn.morpho.org/assets/logos/weth.svg",
}
