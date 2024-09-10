import { useQuery } from "@tanstack/react-query"
import { getPositionsQuery } from "src/queries/getPositionsQuery"
import { useAccount, useChainId, usePublicClient } from "wagmi"
import { SupportedChainId } from "~/constants"

export function useAllPositions() {
  const { address } = useAccount()
  const chainId = useChainId()
  const client = usePublicClient()

  const enabled = !!address && !!client

  return useQuery({
    ...getPositionsQuery(chainId as SupportedChainId, address),
    enabled: enabled,
  })
}
