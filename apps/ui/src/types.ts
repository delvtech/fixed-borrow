import { FixedPoint } from "@delvtech/fixed-point-wasm"
import { OpenShort } from "@delvtech/hyperdrive-viem"
import { UseQueryOptions } from "@tanstack/react-query"
import { Market as CustomMarket } from "dfb-config"
import { Address } from "viem"

/** Interface that includes useful market state data.  */
export interface MarketInfo {
  /** The underlying market. */
  market: Market

  /** The amount of Hyperdrive liqudity in the market.
   * Amount is a BigNum priced in the base asset.
   */
  liquidity: bigint

  /** The current spot fixed rate of the Hyperdrive market,
   * priced in 18 point decimals.
   */
  fixedRate: bigint

  /** The current variable rate of the  market,
   * priced in 18 point decimals.
   */
  borrowRate: bigint
}

/** The core interface for a market that contains critical information. */
// TODO: Remove this and replace with Market type from dfb-config
export type Market = CustomMarket

export interface MorphoMarketMetadata {
  id: Address
  oracle: Address
  irm: Address
}

export interface Token {
  symbol: string
  name: string
  decimals: number
  address: Address
  iconUrl?: string
}

export interface RateHistory {
  lowestRate: bigint
  highestRate: bigint
  averageRate: bigint
}

export interface BorrowPosition {
  /** The underlying market. */
  market: Market

  /** Total debt in 18 point decimal. */
  totalDebt: bigint

  /** Total debt priced in USD. */
  totalDebtUsd?: string

  fixedRate: bigint

  /** Current borrow APY as a decimal ex .12 = 12% */
  currentRate: bigint

  rates?: RateHistory
}

export type OpenShortPlusQuote = OpenShort & { rateQuote: bigint }

export interface Position {
  market: Market
  position: BorrowPosition
  shorts: OpenShortPlusQuote[]
  totalCoverage: bigint
  debtCovered: FixedPoint
}

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never

export type QueryOptionsWithoutQueryKey<T> = Omit<
  UseQueryOptions<T>,
  "queryKey" | "queryFn"
>
