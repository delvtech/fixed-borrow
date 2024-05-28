export enum MarketType {
  Morpho = "Morpho",
}

export interface BorrowPosition {
  /** Loan token symbol ex. DAI */
  loanTokenSymbol: string

  /** Long form loan token name. */
  loanTokenName: string

  /** Collateral token symbol ex. DAI */
  collateralTokenSymbol: string

  /** Long form collateral token name. */
  collateralTokenName: string

  /** Total collateral in 18 decimals. */
  totalCollateral: string

  /** Total collateral priced in USD. */
  totalCollateralUsd: string

  /** Total debt in 18 point decimal. */
  totalDebt: string

  /** Total debt priced in USD. */
  totalDebtUsd: string

  /** TODO */
  ltv: number

  /** Market maximum loan to value as a decimal ex. 0.90 */
  marketMaxLtv: string

  /** Current borrow APY as a decimal ex .12 = 12% */
  currentBorrowApy: number

  /** Average borrow APY as a decimal ex .12 = 12% */
  averageBorrowApy: number
}
