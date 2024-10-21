import { useQuery } from "@tanstack/react-query"

import { useAccount } from "wagmi"
import { useLocation } from "wouter"

const url = import.meta.env.VITE_ADDRESS_SCREEN_URL

type AddressScreenResult = {
  isBlocked?: boolean
  error?: string
  enabled: boolean
}

export function useAddressScreen(): AddressScreenResult {
  const { address } = useAccount()
  const [location, navigate] = useLocation()
  const enabled = !!url && !!address

  const { data: result } = useQuery<APIResponse>({
    queryKey: ["address-screen", address],
    enabled,
    staleTime: Infinity,
    retry: 6,
    queryFn: () =>
      fetch(url, {
        method: "POST",
        body: JSON.stringify({ address }),
      }).then((res) => res.json()),
  })

  const isBlocked = result?.data === false

  if (isBlocked && location !== "/vpn") {
    navigate("/vpn")
  } else if (result?.error && location !== "/error") {
    if (import.meta.env.DEV) {
      console.error(result?.error)
    }
    navigate("/error")
  }

  return {
    enabled,
    error: result?.error ? String(result?.error) : undefined,
    isBlocked,
  }
}

interface APIResponse {
  status: number
  /**
   * false if the address is ineligible
   */
  data: boolean | null
  error: string | null
}
