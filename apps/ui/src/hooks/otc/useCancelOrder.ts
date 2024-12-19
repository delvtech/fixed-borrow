import { useMutation } from "@tanstack/react-query"
import type { OrderKey } from "otc-api"
import { otc } from "src/otc/client"

export function useCancelOrder() {
  return useMutation({
    mutationFn: (key: OrderKey<"pending" | "awaiting_signature">) => {
      return otc.cancelOrder(key)
    },
  })
}
