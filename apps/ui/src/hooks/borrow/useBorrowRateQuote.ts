import { fixed, FixedPoint } from "@delvtech/fixed-point-wasm"
import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { useQuery } from "@tanstack/react-query"
import { useDebounce } from "@uidotdev/usehooks"
import { SupportedChainId } from "dfb-config"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { isNil } from "lodash-es"
import { useChainId, usePublicClient } from "wagmi"
import { Market } from "../../types"

/**
 * Encapsulation for all relevant data when quoting a fixed rate.
 *
 * @interface RateQuoteData
 * @typedef {RateQuoteData}
 */
interface RateQuoteData {
  /**
   *
   * Fixed rate the user receives when shorting bonds.
   * @type {FixedPoint}
   */
  quote: FixedPoint
  /**
   * Rate impact when opening the short.
   *
   * @type {FixedPoint}
   */
  impact: FixedPoint
  /**
   * The amount the trader has to pay upfront to open the short.
   *
   * @type {FixedPoint}
   */
  traderDeposit: FixedPoint

  /**
   * Error message when opening the short. Example: not enough liquidity.
   *
   * @type {?string}
   */
  error?: string
}

/**
 * Hook that returns relevant data about a fixed rate quote.
 *
 * @export
 * @param {Market} market
 * @param {bigint} bondAmount
 */
export function useBorrowRateQuote(market: Market, bondAmount: bigint) {
  const client = usePublicClient()
  const chainId = useChainId()

  const enabled = !!client && !isNil(bondAmount)

  const debounceBondAmount = useDebounce(bondAmount, 200) // 200 ms

  return useQuery<RateQuoteData>({
    queryKey: [
      "fixed-borrowing-cost",
      market.hyperdrive,
      chainId,
      debounceBondAmount.toString(),
    ],
    enabled: enabled,
    staleTime: 5000,
    queryFn: enabled
      ? async () => {
          const readHyperdrive = new ReadHyperdrive({
            address: market.hyperdrive,
            publicClient: client!,
          })

          const reader = new MorphoMarketReader(
            client!,
            chainId as SupportedChainId
          )

          const maxShort = await readHyperdrive.getMaxShort()

          // Initialize variables
          let quote = fixed(await reader.quoteRate(market))
          let impact = fixed(0)
          let traderDeposit = fixed(0)
          let error: string | undefined

          // If the bond amount is zero we skip any calculations
          if (bondAmount > 0n) {
            try {
              const previewShortResult = await readHyperdrive.previewOpenShort({
                amountOfBondsToShort: bondAmount!,
                asBase: true,
              })

              traderDeposit = fixed(previewShortResult.traderDeposit)

              const rateQuoteAfterOpen = await reader.quoteRate(
                market,
                previewShortResult.spotRateAfterOpen
              )

              impact = fixed(rateQuoteAfterOpen).sub(quote)

              quote = fixed(
                await reader.quoteRate(
                  market,
                  previewShortResult.spotRateAfterOpen
                )
              )
            } catch (e) {
              if (e instanceof Error) {
                if (e.message.includes("MinimumTransactionAmount")) {
                  error = "Amount too small"
                }

                if (maxShort.maxBaseIn < bondAmount) {
                  error = "Not Enough Liquidity"
                }
              } else {
                // Placeholder for unidentified error
                error = "Error"
              }
            }
          }

          return {
            quote,
            impact,
            traderDeposit,
            error,
          }
        }
      : undefined,
  })
}
