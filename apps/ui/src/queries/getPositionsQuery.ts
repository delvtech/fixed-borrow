import { fixed } from "@delvtech/fixed-point-wasm"
import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { UseQueryOptions } from "@tanstack/react-query"
import { SupportedChainId } from "dfb-config"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { OpenShortPlusQuote, Position } from "src/types"
import { Address, fromHex, Hex, parseAbiItem, toFunctionSelector } from "viem"
import { usePublicClient } from "wagmi"

export function getPositionsQuery(
  chainId: SupportedChainId,
  account?: Address
): UseQueryOptions<Position[]> {
  const client = usePublicClient()
  const enabled = !!account && !!client

  return {
    queryKey: ["positions", account, chainId],
    queryFn: enabled
      ? async () => {
          const reader = new MorphoMarketReader(
            client,
            chainId as SupportedChainId
          )
          const borrowPositions = await reader.getBorrowPositions(account)
          const blockNumber = await client.getBlockNumber()

          return await Promise.all(
            borrowPositions.map(async (position) => {
              const readHyperdrive = new ReadHyperdrive({
                address: position.market.hyperdrive,
                publicClient: client!,
              })

              const logs = await client.getLogs({
                address: position.market.hyperdrive,
                args: {
                  trader: account,
                },
                fromBlock: 0n,
                event: parseAbiItem(
                  "event OpenShort(address indexed trader,uint256 indexed assetId,uint256 maturityTime,uint256 amount,uint256 vaultSharePrice,bool asBase,uint256 baseProceeds,uint256 bondAmount,bytes extraData)"
                ),
              })

              const rateQuoteRecord = new Map<string, bigint>()

              for (const log of logs) {
                const extraData = log.args.extraData
                const assetId = log.args.assetId

                if (extraData && assetId) {
                  const selector = extraData.slice(0, 10)
                  const quoteHex = "0x" + extraData.slice(10)

                  if (
                    toFunctionSelector("frb(uint24)") === (selector as Address)
                  ) {
                    rateQuoteRecord.set(
                      assetId.toString(),
                      fromHex(quoteHex as Hex, "bigint")
                    )
                  }
                }
              }

              const decimals = position.market.loanToken.decimals

              const shorts = await readHyperdrive.getOpenShorts({
                account: account,
                options: {
                  blockNumber,
                },
              })

              const frbShorts: OpenShortPlusQuote[] = shorts
                .filter((short) =>
                  rateQuoteRecord.has(short.assetId.toString())
                )
                .map((short) => ({
                  ...short,
                  rateQuote: rateQuoteRecord.get(short.assetId.toString())!,
                }))
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
                shorts: frbShorts,
                totalCoverage,
                debtCovered,
              }
            })
          )
        }
      : undefined,
  }
}
