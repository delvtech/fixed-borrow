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
export interface Market {
  /** Loan token information. */
  loanToken: Token

  /** Collateral token information. */
  collateralToken: Token

  /** The max loan to value ratio for the market,
   * priced in 18 point decimals.
   */
  lltv: bigint

  /** The Hyperdrive market address */
  hyperdrive: Address

  /** Special metadata related to the market, this can differ
   * in structure depending on the market type.
   */
  metadata?: MorphoMarket
}

export interface MorphoMarket extends Market {
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

export interface BorrowPosition {
  /** The underlying market. */
  market: Market

  /** Total collateral in 18 decimals. */
  totalCollateral: string

  /** Total collateral priced in USD. */
  totalCollateralUsd?: string

  /** Total debt in 18 point decimal. */
  totalDebt: string

  /** Total debt priced in USD. */
  totalDebtUsd?: string

  /** Loan to value. */
  ltv: number

  /** Price of one unit of collateral in which a liquidation will be triggered. */
  liquidationPrice?: string

  fixedRate: number

  /** Current borrow APY as a decimal ex .12 = 12% */
  currentRate: number

  rates?: {
    highestRate: number
    lowestRate: number
    averageRate: number
  }
}

export type ArrayElement<A> = A extends readonly (infer T)[] ? T : never
