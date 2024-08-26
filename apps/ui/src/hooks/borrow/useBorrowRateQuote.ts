import { useQuery } from "@tanstack/react-query"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { useChainId, usePublicClient } from "wagmi"
import { SupportedChainId } from "~/constants"
import { Market } from "../../types"

export function useBorrowRateQuote(market: Market, spotRateOverride?: bigint) {
  const chainId = useChainId()
  const client = usePublicClient()

  return useQuery({
    queryKey: ["borrow-rate-quote", chainId, spotRateOverride?.toString()],
    queryFn: async () => {
      const reader = new MorphoMarketReader(
        client!,
        chainId as SupportedChainId
      )

      return reader.quoteRate(market, spotRateOverride)
    },
    enabled: !!chainId && !!client,
  })
}
