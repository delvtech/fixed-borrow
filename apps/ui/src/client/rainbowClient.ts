import { getDefaultConfig } from "@rainbow-me/rainbowkit"
import { mainnet } from "viem/chains"
import { http } from "wagmi"

// TODO @cashd: Feature switch chain list by production or development.
export const rainbowConfig = getDefaultConfig({
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
    // [sepolia.id]: http(
    //   "https://eth-sepolia.g.alchemy.com/v2/1lwuV3-H1ieTJ_tXRFJz2s5cXpmtJTvD",
    //   {
    //     batch: true,
    //   }
    // ),
    // [707]: http(
    //   "http://ec2-3-18-106-165.us-east-2.compute.amazonaws.com:8545/",
    //   {
    //     batch: true,
    //   }
    // ),
  },
})

export const viemClient = rainbowConfig.getClient()
