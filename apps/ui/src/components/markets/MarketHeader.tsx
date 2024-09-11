import { Badge } from "components/base/badge"
import { cn } from "components/utils"
import { MorphoLogo } from "static/images/MorphoLogo"
import { formatTermLength } from "utils/formatTermLength"
import { Market } from "../../types"

interface MarketHeaderProps {
  market: Market
  className?: string
  classNameToken?: string
  size?: number
}

export function MarketHeader(props: MarketHeaderProps) {
  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center gap-2">
        <div className="flex">
          <img
            src={props.market.collateralToken.iconUrl}
            height={props.size ?? 24}
            width={props.size ?? 24}
            alt={`${props.market.collateralToken.symbol} token symbol`}
          />
          <img
            src={props.market.loanToken.iconUrl}
            className={cn("-ml-2", props.classNameToken)}
            height={props.size ?? 24}
            width={props.size ?? 24}
            alt={`${props.market.loanToken.symbol} token symbol`}
          />
        </div>

        <h2
          className={cn("font-chakra text-h3 font-semibold", props.className)}
        >
          {props.market.collateralToken.symbol} /{" "}
          {props.market.loanToken.symbol}
        </h2>
      </div>

      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="font-mono text-xs">
          <MorphoLogo />
          Morpho
        </Badge>

        <Badge variant="secondary" className="font-mono text-xs">
          LLTV: 86%
        </Badge>

        <Badge variant="secondary" className="font-mono text-xs">
          {formatTermLength(props.market.duration).formatted}
        </Badge>
      </div>
    </div>
  )
}
