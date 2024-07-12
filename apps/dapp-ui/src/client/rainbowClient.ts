import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, sepolia } from "viem/chains"
import { http } from "wagmi"

export const rainbowConfig = getDefaultConfig({
  appName: "Hyperdrive Borrow",
  projectId: import.meta.env.VITE_WALLET_CONNECT_ID,
  chains: [mainnet, sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
  transports: {
    [mainnet.id]: http(
      "https://eth-mainnet.g.alchemy.com/v2/jhjiuDykxwKqhI8hEbj15nV2ZKED7O6z"
    ),
    [sepolia.id]: http(
      "https://eth-sepolia.g.alchemy.com/v2/1lwuV3-H1ieTJ_tXRFJz2s5cXpmtJTvD"
    ),
  },
})

export const viemClient = rainbowConfig.getClient()
