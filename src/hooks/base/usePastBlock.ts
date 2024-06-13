import { UseQueryResult, useQuery } from "@tanstack/react-query"
import { Block } from "viem"
import { useChainId, useChains, usePublicClient } from "wagmi"

/**
 * Hook that queries for a block in the past by a timestamp.
 *
 * @param paramName Unix timestamp in seconds.
 */
export function usePastBlock(timestamp: number): UseQueryResult<Block> {
  timestamp = Math.floor(timestamp)

  const client = usePublicClient()
  const chainId = useChainId()
  const chain = useChains().find((c) => c.id === chainId)

  const blockExplorerUrl = chain?.blockExplorers?.default.apiUrl

  return useQuery<Block>({
    queryKey: ["prev-block", blockExplorerUrl, timestamp, client?.chain.id],
    queryFn: async () => {
      // Create a URL object
      let url = new URL(blockExplorerUrl!)

      // Append the query parameters to the URL
      url.search = new URLSearchParams({
        module: "block",
        action: "getblocknobytime",
        timestamp: timestamp.toString(),
        closest: "before",
        apikey: import.meta.env.VITE_ETHERSCAN_API_KEY,
      }).toString()

      const res = await fetch(url)
      const resJson = await res.json()
      const blockNumber = resJson.result

      return client!.getBlock({
        blockNumber: BigInt(blockNumber),
      })
    },
    enabled: !!chain && !!client,
    staleTime: Infinity,
    throwOnError: false, // soft failure hook
  })
}
