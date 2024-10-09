import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query"
import { getPositionsQuery } from "src/queries/getPositionsQuery"
import { Position } from "src/types"
import { useAccount, useChainId, usePublicClient } from "wagmi"
import { SupportedChainId } from "~/constants"

type TypedQueryOptions = Omit<
  UseQueryOptions<Position[], Error, Position[], QueryKey>,
  "queryKey" | "queryFn"
>

export function useActivePositions(options?: TypedQueryOptions) {
  const { address } = useAccount()
  const chainId = useChainId()
  const client = usePublicClient()

  const enabled = !!address && !!client

  return useQuery({
    ...getPositionsQuery(chainId as SupportedChainId, address),
    ...options,
    enabled: enabled && options?.enabled,
  })
}
