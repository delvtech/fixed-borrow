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
        className="size-5"
        alt={`${props.market.collateralToken.symbol} token symbol`}
      />
      <img
        src={props.market.loanToken.iconUrl}
        className="-ml-3 size-5"
        alt={`${props.market.loanToken.symbol} token symbol`}
      />
    </div>
  )
}
