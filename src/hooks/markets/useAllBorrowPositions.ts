import { useQuery } from "@tanstack/react-query"
import { MorphoMarketReader } from "lib/markets/MarketsReader"
import { Address } from "viem"
import { useChainId, usePublicClient } from "wagmi"
import { SupportedChainId } from "~/constants"

export function useAllBorrowPositions(account?: Address) {
  const chainId = useChainId()
  const client = usePublicClient()
  return useQuery({
    queryKey: ["all-borrow-positions", account, chainId],
    queryFn: async () => {
      const reader = new MorphoMarketReader(
        client!,
        chainId as SupportedChainId
      )
      return await reader.getBorrowPositions(account!)
    },
    enabled: !!account && !!client,
  })
}
