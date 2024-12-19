import { useQuery } from "@tanstack/react-query"
import { OrderKey, OrderObject, OtcClient } from "otc-api"
import { QueryOptionsWithoutQueryKey } from "src/types"
import { OTC_API_URL } from "utils/constants"

/**
 * Fetches an order by key from the OTC API.
 *
 * @param orderKey The key of the order to fetch. If not provided, the hook will not run.
 * @param options Options for the `useQuery` hook.
 * @returns The order corresponding to the provided key.
 *
 */
export function useOrder(
  orderKey?: OrderKey,
  options?: QueryOptionsWithoutQueryKey<OrderObject>
) {
  const enabled = !!orderKey

  return useQuery<OrderObject>({
    ...options,
    queryKey: ["order", orderKey],
    enabled,
    queryFn: enabled
      ? async () => {
          if (!orderKey!.endsWith(".json")) {
            orderKey = orderKey! + ".json"
          }

          const client = new OtcClient(OTC_API_URL)
          const response = await client.getOrder(orderKey as OrderKey)

          if (response.success) {
            return response
          } else {
            throw new Error(response.error)
          }
        }
      : undefined,
  })
}
