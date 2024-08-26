import { Badge } from "components/base/badge"
import { MorphoLogo } from "static/images/MorphoLogo"
import { Market } from "../../types"

interface MarketHeaderProps {
  market: Market
}

export function MarketHeader(props: MarketHeaderProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex">
          <img src={props.market.collateralToken.iconUrl} className="size-6" />
          <img src={props.market.loanToken.iconUrl} className="-ml-3 size-6" />
        </div>

        <h3 className="font-chakra font-semibold">
          {props.market.collateralToken.symbol} /{" "}
          {props.market.loanToken.symbol}
        </h3>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono text-xs">
          <MorphoLogo />
          Morpho
        </Badge>

        <Badge variant="secondary" className="ont-mono text-xs">
          LLTV: 86%
        </Badge>
      </div>
    </div>
  )
}
