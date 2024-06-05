import { Address } from "viem"

export interface Market {
  loanToken: Token
  collateralToken: Token

  hyperdriveAddress: Address
}

export interface Token {
  symbol: string
  name: string
  decimals: number
  address: Address
  iconUrl?: string
}

export interface BorrowPosition {
  /** Loan token */
  loanToken: Token

  /** Collateral token*/
  collateralToken: Token

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

  /** Market maximum loan to value as a decimal ex. 0.90 */
  marketMaxLtv: string

  /** Current borrow APY as a decimal ex .12 = 12% */
  currentBorrowApy: number

  /** Average borrow APY as a decimal ex .12 = 12% */
  averageBorrowApy?: number
}
