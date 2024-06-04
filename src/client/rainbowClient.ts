import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet, sepolia } from "viem/chains"

export const rainbowConfig = getDefaultConfig({
  appName: "Hyperdrive Borrow",
  projectId: import.meta.env.VITE_WALLET_CONNECT_ID,
  chains: [mainnet, sepolia],
  ssr: false, // If your dApp uses server side rendering (SSR)
})

export const viemClient = rainbowConfig.getClient()
