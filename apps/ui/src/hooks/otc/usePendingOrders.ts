import { useQuery } from "@tanstack/react-query"
import { OrderObject, OtcClient } from "otc-api"
import { OTC_API_URL } from "src/otc/utils"
import { QueryOptionsWithoutQueryKey } from "src/types"
import { useChainId } from "wagmi"

type UsePendingOrdersReturnType = OrderObject<"pending">[]

/**
 * Fetches a list of all pending orders on the OTC API.
 *
 * @param options Options for the `useQuery` hook.
 * @returns A list of pending orders.
 */
export function usePendingOrders(
  options?: QueryOptionsWithoutQueryKey<UsePendingOrdersReturnType>
) {
  const chainId = useChainId()

  return useQuery<UsePendingOrdersReturnType>({
    ...options,
    queryKey: ["pendingOrders", chainId],
    queryFn: async () => {
      const otcClient = new OtcClient(OTC_API_URL)
      const response = await otcClient.getOrders({
        status: "pending",
      })

      if (response.success) {
        return response.orders.sort((a, b) => a.data.expiry - b.data.expiry)
      } else {
        throw new Error(response.error)
      }
    },
  })
}
