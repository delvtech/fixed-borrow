import { Market } from "src/types"

/**
 * Props for the TokenPair component.
 */
interface TokenPairProps {
  market: Market
  size?: number
}

/**
 * A component that renders a pair of token icons for a given market.
 *
 * @param {TokenPairProps} props - The properties for the TokenPair component.
 * @returns A JSX element displaying the token icons.
 */
export function TokenPair({ market, size = 20 }: TokenPairProps) {
  return (
    <div className="flex">
      <img
        src={market.collateralToken.iconUrl}
        height={size}
        width={size}
        alt={`${market.collateralToken.symbol} token symbol`}
      />

      <img
        src={market.loanToken.iconUrl}
        className="-ml-3"
        height={size}
        width={size}
        alt={`${market.loanToken.symbol} token symbol`}
      />
    </div>
  )
}
