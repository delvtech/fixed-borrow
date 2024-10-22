import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { Chain, mainnet, sepolia } from "viem/chains"
import { http } from "wagmi"

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

const productionConfig = getDefaultConfig({
  appName: "Hyperdrive Borrow",
  projectId: import.meta.env.VITE_WALLET_CONNECT_ID,
  chains: [mainnet],
  ssr: false,
  transports: {
    [mainnet.id]: http(
      "https://eth-mainnet.g.alchemy.com/v2/jhjiuDykxwKqhI8hEbj15nV2ZKED7O6z",
      {
        batch: true,
      }
    ),
  },
})

const developmentConfig = getDefaultConfig({
  appName: "Hyperdrive Borrow",
  projectId: import.meta.env.VITE_WALLET_CONNECT_ID,
  chains: [mainnet, sepolia, delvChain],
  ssr: false,
  transports: {
    [mainnet.id]: http(
      "https://eth-mainnet.g.alchemy.com/v2/jhjiuDykxwKqhI8hEbj15nV2ZKED7O6z",
      {
        batch: true,
      }
    ),
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/1lwuV3-H1ieTJ_tXRFJz2s5cXpmtJTvD",
      {
        batch: true,
      }
    ),
    [707]: http(
      "http://ec2-3-18-106-165.us-east-2.compute.amazonaws.com:8545/",
      {
        batch: true,
      }
    ),
  },
})

export const rainbowConfig =
  import.meta.env.MODE === "production" ? productionConfig : developmentConfig
