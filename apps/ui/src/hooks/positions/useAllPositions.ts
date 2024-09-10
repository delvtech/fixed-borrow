import { fixed } from "@delvtech/fixed-point-wasm"
import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { useQuery } from "@tanstack/react-query"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { useAccount, useChainId, usePublicClient } from "wagmi"
import { SupportedChainId } from "~/constants"

export function useAllPositions() {
  const chainId = useChainId()
  const client = usePublicClient()
  const { address } = useAccount()

  const enabled = !!address && !!client

  return useQuery({
    queryKey: ["positions", address, chainId],
    enabled: enabled,
    queryFn: enabled
      ? async () => {
          const reader = new MorphoMarketReader(
            client,
            chainId as SupportedChainId
          )
          const borrowPositions = await reader.getBorrowPositions(address)
          const blockNumber = await client.getBlockNumber()

          return await Promise.all(
            borrowPositions.map(async (position) => {
              const readHyperdrive = new ReadHyperdrive({
                address: position.market.hyperdrive,
                publicClient: client!,
              })

              const decimals = position.market.loanToken.decimals

              const shorts = await readHyperdrive.getOpenShorts({
                account: address,
                options: {
                  blockNumber,
                },
              })
              const totalCoverage = shorts.reduce((prev, curr) => {
                return prev + curr.bondAmount
              }, 0n)

              const debtCovered =
                position.totalDebt === 0n
                  ? fixed(0n, decimals)
                  : fixed(totalCoverage, decimals).div(
                      position.totalDebt,
                      decimals
                    )

              return {
                market: position.market,
                position,
                shorts,
                totalCoverage,
                debtCovered,
              }
            })
          )
        }
      : undefined,
  })
}
