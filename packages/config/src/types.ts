import { Address } from "viem"

export type Token = {
  symbol: string
  name: string
  decimals: number
  address: Address
  iconUrl?: string
}

export type Config = {
  tokens: Token[]
  morphoMarkets: Market[]
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

  /** Hyperdrive contract address */
  hyperdrive: Address

  /** Hyperdrive term duration */
  duration: bigint

  /** Special metadata related to the market, this can differ
   * in structure depending on the market type.
   */
  metadata: MorphoMarketMetadata
}

export interface MorphoMarketMetadata {
  id: Address
  oracle: Address
  irm: Address
}
