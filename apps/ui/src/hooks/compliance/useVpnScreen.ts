import { useQuery } from "@tanstack/react-query"
import { useLocation } from "wouter"

const url = import.meta.env.VITE_VPN_SCREEN_URL

interface VpnScreenResult extends ApiResponse {
  enabled: boolean
}

export function useVpnScreen(): VpnScreenResult {
  const [location, navigate] = useLocation()

  const enabled = !!url

  const { data: result } = useQuery<VpnScreenResult>({
    queryKey: ["vpn-screen", url],
    staleTime: Infinity,
    enabled,
    retry: 2,
    retryDelay: 1000,
    queryFn: () =>
      fetch(url, { method: "POST" }).then(
        (res) => res.json() as Promise<VpnScreenResult>
      ),
  })

  if (result?.isBlocked && location !== "/vpn") {
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
    isBlocked: result?.isBlocked,
  }
}

type ApiResponse = {
  isBlocked?: boolean
  error?: string
}
