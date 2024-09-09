import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import { PositionCardStat } from "components/position/PositionCardStat"
import * as dn from "dnum"
import { BorrowPosition } from "../../types"

interface CollateralCardProps {
  position: BorrowPosition
}

/**
 * @deprecated
 */
export function CollateralCard({ position }: CollateralCardProps) {
  const currentLTV = 0n

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <Badge className="bg-ring p-2">
          <img
            src={position.market.collateralToken.iconUrl}
            className="size-10"
            alt={`${position.market.collateralToken.symbol} icon`}
          />
        </Badge>
        <div className="flex items-center gap-2">
          <Button
            // TODO: Keep a mapping of brand colors (ie. Morpho Blue). Or decide on a different color for this button.
            className="bg-[#2E4DFF]"
            variant="secondary"
            size="lg"
          >
            Manage Loan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-evenly gap-6 lg:flex-row">
        <Card className="w-full flex-1">
          <CardHeader className="font-chakra text-h5">
            Your Collateral
          </CardHeader>
          <CardContent>
            <div className="mt-8 flex">
              <div className="flex flex-1 flex-col gap-4">
                {/* TODO: Determine if this stat is useful. It is stubbed for now. */}
                <PositionCardStat
                  title="Available to Withdraw"
                  value="0"
                  symbol={position.market.collateralToken.symbol}
                />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                {/* TODO: Determine if this stat is useful. It is stubbed for now. */}
                <PositionCardStat
                  title="Available to Borrow"
                  value="0"
                  symbol={position.market.collateralToken.symbol}
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="w-full flex-1">
          <CardHeader className="font-chakra text-h5">Your Risk</CardHeader>
          <CardContent>
            <div className="mt-8 flex">
              <div className="flex flex-1 flex-col gap-4">
                <PositionCardStat
                  title="Current LTV"
                  value={dn.format([currentLTV, 18], { digits: 2 })}
                  symbol={position.market.collateralToken.symbol}
                />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <PositionCardStat
                  title="Max LTV"
                  value={dn.format([position.market.lltv, 18], 2)}
                  symbol={position.market.collateralToken.symbol}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
