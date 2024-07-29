import { QueryStatus } from "@tanstack/react-query"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import { Skeleton } from "components/base/skeleton"
import * as dn from "dnum"
import { BorrowPosition, Market } from "../../types"

interface CollateralCardProps {
  market: Market | undefined
  position: BorrowPosition | undefined
  positionStatus: QueryStatus
}

export function CollateralCard({
  market,
  position,
  positionStatus,
}: CollateralCardProps) {
  let currentLTV = 0n
  let liquidationPrice = 0n
  let availableToWithdraw = 0n

  if (
    positionStatus === "success" &&
    position?.totalCollateral &&
    position.totalCollateral !== 0n
  ) {
    currentLTV = dn.divide(
      [position.totalDebt, 18],
      [position.totalCollateral, 18]
    )[0]
    {
      /* liquidationPrice = TotalDebt / (totalCollateral * LTV) */
    }
    liquidationPrice = dn.divide(
      [position.totalDebt, 18],
      dn.multiply([position.totalCollateral, 18], [currentLTV, 18])[0]
    )[0]

    //availableToWithdraw = totalCollateral.minus(totalDebt.dividedBy(ltv));
    availableToWithdraw = dn.subtract(
      [position.totalCollateral, 18],
      dn.divide([position.totalDebt, 18], [currentLTV, 18])[0]
    )[0]
  }

  console.log(liquidationPrice, "liquidationPrice")

  return (
    <Card className="">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <Badge className="bg-ring p-2">
          <img src={market?.collateralToken.iconUrl} className="size-14" />
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
            <p className="mb-4 text-secondary-foreground">Total Collateral</p>
            <div className="flex items-end gap-1">
              <p className="text-h3">
                {positionStatus === "success" ? (
                  dn.format([position?.totalCollateral || 0n, 18], {
                    digits: 2,
                  })
                ) : (
                  <Skeleton className="h-8 w-[250px] rounded-sm bg-muted" />
                )}
              </p>
              <p className="text-sm">{market?.collateralToken.symbol}</p>
            </div>
            {positionStatus === "success" ? (
              <p className="text-secondary-foreground">{`$${position?.totalCollateralUsd}`}</p>
            ) : (
              <Skeleton className="h-8 w-[250px] rounded-sm bg-muted" />
            )}
            <div className="mt-8 flex">
              <div className="flex flex-1 flex-col">
                <p className="text-secondary-foreground">
                  Available to Withdraw
                </p>
                <div className="flex items-end gap-1">
                  {positionStatus === "success" ? (
                    <p className="text-h4">
                      {dn.format([availableToWithdraw || 0n, 18], {
                        digits: 2,
                      })}
                    </p>
                  ) : (
                    <Skeleton className="h-8 w-[250px] rounded-sm bg-muted" />
                  )}

                  <p className="text-sm">{market?.collateralToken.symbol}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-secondary-foreground">Available to Borrow</p>
                <div className="flex items-end gap-1">
                  <p className="text-h4">0</p>
                  <p className="text-sm">{market?.collateralToken.symbol}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="font-chakra text-h5">Your Risk</CardHeader>
          <CardContent>
            <p className="mb-4 text-secondary-foreground">Liquidation Price</p>
            <div className="flex items-end gap-1">
              {positionStatus === "success" ? (
                <p className="text-h3">{Number(liquidationPrice)}</p>
              ) : (
                <Skeleton className="h-8 w-[250px] rounded-sm bg-muted" />
              )}
              <p className="text-sm">{market?.collateralToken.symbol}</p>
            </div>
            <p className="text-secondary-foreground">
              Current Price: 4,000.58 USDC/wstETH
            </p>
            <div className="mt-8 flex">
              <div className="flex flex-1 flex-col">
                <p className="text-secondary-foreground">Current LTV</p>
                <div className="flex items-end gap-1">
                  {positionStatus === "success" ? (
                    <p className="text-h4">
                      {dn.format([currentLTV, 18], { digits: 2 })}
                    </p>
                  ) : (
                    <Skeleton className="h-8 w-[250px] rounded-sm bg-muted" />
                  )}

                  <p className="text-sm">{market?.collateralToken.symbol}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-secondary-foreground">Max LTV</p>
                <div className="flex items-end gap-1">
                  <p className="text-h4">0</p>
                  <p className="text-sm">{market?.collateralToken.symbol}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
