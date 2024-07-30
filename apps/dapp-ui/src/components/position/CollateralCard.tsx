import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import { PositionCardStat } from "components/position/PositionCardStat"
import * as dn from "dnum"
import { BorrowPosition, Market } from "../../types"
import { PositionCardSkeleton } from "./PositionCardSkeleton"

interface CollateralCardProps {
  market: Market | undefined
  position: BorrowPosition | undefined
}

export function CollateralCard({ market, position }: CollateralCardProps) {
  let currentLTV = 0n

  if (position?.totalCollateral && position?.totalDebt) {
    currentLTV = dn.divide(
      [position?.totalDebt, 18],
      [position?.totalCollateral, 18]
    )[0]
  }

  if (!market || !position) {
    return <PositionCardSkeleton />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <Badge className="bg-ring p-2">
          <img src={market.collateralToken.iconUrl} className="size-10" />
        </Badge>
        <div className="flex flex-row items-center gap-2">
          <Button
            // TODO: Keep a mapping of brand colors (ie. Morpho Blue). Or decide on a different color for this button.
            className="bg-[#2E4DFF]"
            variant={"secondary"}
            size={"lg"}
          >
            Manage Loan
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-evenly gap-6 lg:flex-row">
        <Card className="flex-1">
          <CardHeader className="font-chakra text-h5">
            Your Collateral
          </CardHeader>
          <CardContent>
            <PositionCardStat
              title="Total Collateral"
              value={dn.format([position.totalCollateral || 0n, 18], {
                digits: 2,
              })}
              symbol={market.collateralToken.symbol}
              secondaryValue={`$${position?.totalCollateralUsd || 0}`}
              size="lg"
            />

            <div className="mt-8 flex">
              <div className="flex flex-1 flex-col gap-4">
                {/* TODO: Determine if this stat is useful. It is stubbed for now. */}
                <PositionCardStat
                  title="Available to Withdraw"
                  value="0"
                  symbol={market.collateralToken.symbol}
                  size="sm"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                {/* TODO: Determine if this stat is useful. It is stubbed for now. */}
                <PositionCardStat
                  title="Available to Borrow"
                  value="0"
                  symbol={market.collateralToken.symbol}
                  size="sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="font-chakra text-h5">Your Risk</CardHeader>
          <CardContent>
            {/* TODO: Determine the correct secondary value to display here. It is stubbed for now. */}
            <PositionCardStat
              title="Liquidation Price"
              value={dn.format([position.liquidationPrice || 0n, 18], 2)}
              symbol={market.collateralToken.symbol}
              secondaryValue={`Current Price: 4,000.58 USDC/wstETH`}
              size="lg"
            />

            <div className="mt-8 flex">
              <div className="flex flex-1 flex-col gap-4">
                <PositionCardStat
                  title="Current LTV"
                  value={dn.format([currentLTV, 18], { digits: 2 })}
                  symbol={market.collateralToken.symbol}
                  size="sm"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <PositionCardStat
                  title="Max LTV"
                  value={dn.format([position.market.lltv || 0n, 18], 2)}
                  symbol={market.collateralToken.symbol}
                  size="sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
