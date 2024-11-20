import { fixed } from "@delvtech/fixed-point-wasm"
import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { QueryKey, useQuery, UseQueryOptions } from "@tanstack/react-query"
import { SupportedChainId } from "dfb-config"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { Market, OpenShortPlusQuote, Position } from "src/types"
import { Address, fromHex, Hex, parseAbiItem, toFunctionSelector } from "viem"
import { useAccount, useChainId, usePublicClient } from "wagmi"

type TypedQueryOptions = Omit<
  UseQueryOptions<Position, Error, Position, QueryKey>,
  "queryKey" | "queryFn"
>

export function useActivePosition(
  market?: Market,
  options?: TypedQueryOptions
) {
  const { address } = useAccount()
  const chainId = useChainId()
  const client = usePublicClient()

  const enabled = !!address && !!client && !!market

  return useQuery({
    queryKey: ["active-position", address, market?.hyperdrive],
    queryFn: enabled
      ? async () => {
          const reader = new MorphoMarketReader(
            client,
            chainId as SupportedChainId
          )
          const position = await reader.getBorrowPosition(address, market)

          if (!position) throw new Error()
          const blockNumber = await client.getBlockNumber()

          const readHyperdrive = new ReadHyperdrive({
            address: position.market.hyperdrive,
            publicClient: client!,
          })

          const logs = await client.getLogs({
            address: position.market.hyperdrive,
            args: {
              trader: address,
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

              if (toFunctionSelector("frb(uint24)") === (selector as Address)) {
                rateQuoteRecord.set(
                  assetId.toString(),
                  fromHex(quoteHex as Hex, "bigint")
                )
              }
            }
          }

          const decimals = position.market.loanToken.decimals

          const shorts = await readHyperdrive.getOpenShorts({
            account: address,
            options: {
              blockNumber,
            },
          })

          const frbShorts: OpenShortPlusQuote[] = shorts
            .filter((short) => rateQuoteRecord.has(short.assetId.toString()))
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
              : fixed(totalCoverage, decimals).div(position.totalDebt, decimals)

          return {
            market: position.market,
            position,
            shorts: frbShorts,
            totalCoverage,
            debtCovered,
          }
        }
      : undefined,
    ...options,
    enabled: enabled && options?.enabled,
  })
}
