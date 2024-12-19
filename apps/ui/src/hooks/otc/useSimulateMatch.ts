import { useQuery } from "@tanstack/react-query"
import { HyperdriveMatchingEngineAbi } from "artifacts/hyperdrive/HyperdriveMatchingEngine"
import { OrderIntent } from "otc-api"
import { HYPERDRIVE_MATCHING_ENGINE_ADDRESS } from "src/otc/utils"
import { QueryOptionsWithoutQueryKey } from "src/types"
import { useAccount, useChainId, usePublicClient } from "wagmi"

/**
 * Simulates a match between two orders.
 *
 * @param longOrder The long order to match.
 * @param shortOrder The short order to match.
 * @param options Options for the query.
 * @returns A boolean indicating if the match was successful.
 */
export function useSimulateMatch(
  longOrder?: OrderIntent,
  shortOrder?: OrderIntent,
  options?: QueryOptionsWithoutQueryKey<boolean>
) {
  const publicClient = usePublicClient()
  const chainId = useChainId()
  const { address: account } = useAccount()
  const enabled = !!publicClient && !!account && !!longOrder && !!shortOrder

  return useQuery({
    ...options,
    queryKey: [
      "simulateMatch",
      longOrder?.signature,
      shortOrder?.signature,
      chainId,
    ],
    enabled,
    queryFn: enabled
      ? async () => {
          try {
            await publicClient.simulateContract({
              address: HYPERDRIVE_MATCHING_ENGINE_ADDRESS,
              abi: HyperdriveMatchingEngineAbi,
              functionName: "matchOrders",
              args: [
                {
                  ...longOrder,
                  expiry: BigInt(longOrder.expiry),
                },
                {
                  ...shortOrder,
                  expiry: BigInt(shortOrder.expiry),
                },
                0n,
                {
                  destination: account,
                  asBase: true,
                  extraData: "0x",
                },
                {
                  destination: account,
                  asBase: true,
                  extraData: "0x",
                },
                account, // Fee recipient
                true, // Long first
              ],
            })

            return true
          } catch (e) {
            console.error(e)
            return false
          }
        }
      : undefined,
  })
}
