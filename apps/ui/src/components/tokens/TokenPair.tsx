import { Market } from "src/types"

interface TokenPairProps {
  market: Market
  size?: number
}

export function TokenPair(props: TokenPairProps) {
  return (
    <div className="flex">
      <img
        src={props.market.collateralToken.iconUrl}
        height={props.size ?? 20}
        width={props.size ?? 20}
        alt={`${props.market.collateralToken.symbol} token symbol`}
      />
      <img
        src={props.market.loanToken.iconUrl}
        className="-ml-3"
        height={props.size ?? 20}
        width={props.size ?? 20}
        alt={`${props.market.loanToken.symbol} token symbol`}
      />
    </div>
  )
}
