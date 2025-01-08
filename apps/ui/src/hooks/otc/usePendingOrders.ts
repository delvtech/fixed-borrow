import { useQuery } from "@tanstack/react-query"
import { OrderObject } from "otc-api"
import { otc } from "src/otc/client"
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
      const response = await otc.getOrders({
        status: "pending",
      })

      if (response.success) {
        return (
          response.orders
            // Cancel and remove expired orders
            // TODO: Should this be done in the API or client class instead?
            .filter((order) => {
              if (order.data.expiry < Date.now() / 1000) {
                otc.cancelOrder(order.key)
                return false
              }
              return true
            })
            // Sort by expiry
            .sort((a, b) => a.data.expiry - b.data.expiry)
        )
      } else {
        throw new Error(response.error)
      }
    },
  })
}
