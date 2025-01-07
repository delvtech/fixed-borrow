import { useQuery } from "@tanstack/react-query"
import { OrderKey, OrderObject, OrderStatus } from "otc-api"
import { otc } from "src/otc/client"
import { QueryOptionsWithoutQueryKey } from "src/types"

/**
 * Fetches an order by key from the OTC API.
 *
 * @param orderKey The key of the order to fetch. If not provided, the hook will not run.
 * @param options Options for the `useQuery` hook.
 * @returns The order corresponding to the provided key.
 *
 */
export function useOrder<T extends OrderStatus = OrderStatus>(
  orderKey?: OrderKey<T>,
  options?: QueryOptionsWithoutQueryKey<OrderObject<T>>
) {
  const enabled = !!orderKey

  return useQuery<OrderObject<T>>({
    ...options,
    queryKey: ["order", orderKey],
    enabled,
    queryFn: enabled
      ? async () => {
          if (!orderKey!.endsWith(".json")) {
            orderKey = orderKey! + ".json"
          }

          const { success, error, ...object } = await otc.getOrder(orderKey!)

          if (success) {
            return object as OrderObject<T>
          } else {
            throw new Error(error)
          }
        }
      : undefined,
  })
}
