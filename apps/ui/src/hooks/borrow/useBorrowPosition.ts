import { useQuery } from "@tanstack/react-query"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { Market } from "src/types"
import { useAccount, useChainId, usePublicClient } from "wagmi"
import { SupportedChainId } from "~/constants"

/**
 * Hook for fetching borrow information data for a singular market.
 *
 * @export
 * @param {?Market} [market]
 * @returns {*}
 */
export function useBorrowPosition(market?: Market) {
  const { address: account } = useAccount()
  const chainId = useChainId()
  const client = usePublicClient()

  return useQuery({
    queryKey: ["borrow-position", account],
    queryFn: async () => {
      const reader = new MorphoMarketReader(
        client!,
        chainId as SupportedChainId
      )

      return reader.getBorrowPosition(account!, market!)
    },
    enabled: !!client && !!account && !!market,
  })
}
