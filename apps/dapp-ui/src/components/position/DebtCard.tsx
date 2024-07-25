import { QueryStatus } from "@tanstack/react-query"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import { Skeleton } from "components/base/skeleton"
import * as dn from "dnum"
import { BorrowPosition, Market } from "../../types"
interface DebtCardProps {
  market: Market | undefined
  position: BorrowPosition | undefined
  positionStatus: QueryStatus
}
export function DebtCard({ market, position, positionStatus }: DebtCardProps) {
  let currentLTV = 0n
  let coveredDebt = 0n

  if (
    positionStatus === "success" &&
    position?.totalCollateral &&
    position.totalCollateral !== 0n
  ) {
    currentLTV = dn.divide(
      [position.totalDebt, 18],
      [position.totalCollateral, 18]
    )[0]

    coveredDebt = dn.multiply(
      [position.totalCollateral, 18],
      [currentLTV, 18]
    )[0]
  }
  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <Badge className="bg-ring p-2">
          <img src={market?.loanToken.iconUrl} className="size-14" />
        </Badge>
        <div className="flex flex-row items-center gap-2">
          <Button variant={"secondary"} size={"lg"}>
            Remove Coverage
          </Button>
          <Button variant={"secondary"} size={"lg"}>
            Add Coverage
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-evenly gap-6 lg:flex-row">
        <Card className="flex-1">
          <CardHeader className="font-chakra text-h5">Your Debt</CardHeader>
          <CardContent>
            <p className="mb-4 text-secondary-foreground">Total Debt</p>
            <div className="flex items-end gap-1">
              <p className="text-h3">
                {positionStatus === "success" ? (
                  dn.format([position?.totalDebt || 0n, 16], { digits: 2 })
                ) : (
                  <Skeleton className="h-8 w-[250px] rounded-sm bg-muted" />
                )}
              </p>
              <p className="text-sm">{market?.loanToken.symbol}</p>
            </div>

            {positionStatus === "success" ? (
              <p className="text-secondary-foreground">{`$${position?.totalDebtUsd}`}</p>
            ) : (
              <Skeleton className="h-8 w-[250px] rounded-sm bg-muted" />
            )}

            <div className="mt-8 flex">
              <div className="flex flex-1 flex-col">
                <p className="text-secondary-foreground">Covered Debt</p>
                <div className="flex items-end gap-1">
                  {positionStatus === "success" ? (
                    <p className="text-h4">
                      {dn.format([coveredDebt, 18], { digits: 2 })}
                    </p>
                  ) : (
                    <Skeleton className="h-8 w-[250px] rounded-sm bg-muted" />
                  )}
                  <p className="text-sm">{market?.loanToken.symbol}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-secondary-foreground">Outstanding Debt</p>
                <div className="flex items-end gap-1">
                  <p className="text-h4">0</p>
                  <p className="text-sm">{market?.loanToken.symbol}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="font-chakra text-h5">
            Your Borrow Rate
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-secondary-foreground">
              Current Effective Borrow Rate
            </p>
            <div className="flex items-end gap-1">
              <p className="text-h3">173,000</p>
              <p className="text-sm">{market?.loanToken.symbol}</p>
            </div>
            <p className="text-secondary-foreground">3,432 USDC/yr</p>
            <div className="mt-8 flex">
              <div className="flex flex-1 flex-col">
                <p className="text-secondary-foreground">Current Borrow APY</p>
                <div className="flex items-end gap-1">
                  <p className="text-h4">171,624.00</p>
                  <p className="text-sm">{market?.loanToken.symbol}</p>
                </div>
              </div>
              <div className="flex flex-1 flex-col">
                <p className="text-secondary-foreground">
                  Projected Max Borrow APY
                </p>
                <div className="flex items-end gap-1">
                  <p className="text-h4">0</p>
                  <p className="text-sm">{market?.loanToken.symbol}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
