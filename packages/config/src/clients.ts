import { createPublicClient, http, PublicClient } from "viem"
import { mainnet, sepolia } from "viem/chains"
import { delvChain } from "./constants"

export const mainnetPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(
    "https://eth-mainnet.g.alchemy.com/v2/jhjiuDykxwKqhI8hEbj15nV2ZKED7O6z"
  ),
})

export const sepoliaPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(
    "https://eth-sepolia.g.alchemy.com/v2/1lwuV3-H1ieTJ_tXRFJz2s5cXpmtJTvD"
  ),
})

export const delvChainPublicClient = createPublicClient({
  chain: delvChain,
  transport: http(
    "http://ec2-3-18-106-165.us-east-2.compute.amazonaws.com:8545/"
  ),
})

export function getClient(chainId: number): PublicClient {
  if (chainId === 1) {
    return mainnetPublicClient
  } else if (chainId === sepolia.id) {
    return sepoliaPublicClient
  }
  return delvChainPublicClient
}
