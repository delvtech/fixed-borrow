import { fixed } from "@delvtech/fixed-point-wasm"
import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { UseQueryOptions } from "@tanstack/react-query"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { rainbowConfig } from "src/client/rainbowClient"
import { Position } from "src/types"
import { Address } from "viem"
import { getPublicClient } from "wagmi/actions"
import { SupportedChainId } from "~/constants"
export function getPositionsQuery(
  chainId: SupportedChainId,
  account?: Address
): UseQueryOptions<Position[]> {
  return {
    queryKey: ["positions", account, chainId],
    queryFn: async () => {
      if (!account) return []

      const client = getPublicClient(rainbowConfig)

      const reader = new MorphoMarketReader(client, chainId as SupportedChainId)
      const borrowPositions = await reader.getBorrowPositions(account)
      const blockNumber = await client.getBlockNumber()

      return await Promise.all(
        borrowPositions.map(async (position) => {
          const readHyperdrive = new ReadHyperdrive({
            address: position.market.hyperdrive,
            publicClient: client!,
          })

          const decimals = position.market.loanToken.decimals

          const shorts = await readHyperdrive.getOpenShorts({
            account: account,
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
              : fixed(totalCoverage, decimals).div(position.totalDebt, decimals)

          return {
            market: position.market,
            position,
            shorts,
            totalCoverage,
            debtCovered,
          }
        })
      )
    },
  }
}
