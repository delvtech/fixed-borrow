import { Address } from "viem"
import { useChainId, useChains } from "wagmi"

type EtherscanLinkType = "address" | "tx"

export function useEtherscan(
  value?: Address,
  type: EtherscanLinkType = "address"
) {
  const chainId = useChainId()
  const chains = useChains()

  const currentChain = chains.find((chain) => chain.id === chainId)
  const blockExplorer = currentChain?.blockExplorers?.default
  const url = blockExplorer?.url.concat(`/${type}/${value}`)

  return {
    url,
  }
}
