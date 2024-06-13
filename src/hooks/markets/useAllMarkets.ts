import { useQuery } from "@tanstack/react-query"
import { MarketRowData } from "components/markets/AllMarketsTable"
import { MorphoMarketReader } from "lib/markets/MarketsReader"
import { useChainId, usePublicClient } from "wagmi"
import { SupportedChainId } from "../../constants"

export function useAllMarkets() {
  const chainId = useChainId()
  const client = usePublicClient()
  return useQuery({
    queryKey: ["all-markets", chainId],
    queryFn: async (): Promise<MarketRowData[]> => {
      const reader = new MorphoMarketReader(
        client!,
        chainId as SupportedChainId
      )
      const allMarkets = await reader.getAllMarketsInfo()
      return allMarkets?.map((marketData) => ({
        loanCollateralTag: `${marketData.market.collateralToken.symbol}/${marketData.market.loanToken.symbol}`,
        liquidity: marketData.liquidity.toString(),
        fixedRate: marketData.fixedRate,
        borrowRate: marketData.borrowRate,
      }))
    },
    enabled: !!client,
  })
}
