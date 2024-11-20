import { useQuery } from "@tanstack/react-query"
import { SupportedChainId } from "dfb-config"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { useChainId, usePublicClient } from "wagmi"
import { MarketInfo } from "../../types"

export function useAllMarkets() {
  const chainId = useChainId()
  const client = usePublicClient()
  return useQuery({
    queryKey: ["all-markets", chainId],
    queryFn: async (): Promise<MarketInfo[]> => {
      const reader = new MorphoMarketReader(
        client!,
        chainId as SupportedChainId
      )

      return reader.getAllMarketsInfo()
    },
    enabled: !!client,
  })
}
