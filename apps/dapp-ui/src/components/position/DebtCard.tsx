import { QueryStatus } from "@tanstack/react-query"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import { PositionCardStat } from "components/position/PositionCardStat"
import * as dn from "dnum"
import { BorrowPosition, Market } from "../../types"
interface DebtCardProps {
  market: Market | undefined
  position: BorrowPosition | undefined
  positionStatus: QueryStatus
}
export function DebtCard({ market, position, positionStatus }: DebtCardProps) {
  const coveredDebt = 0n
  const outstandingDebt = 0n
  const effectiveBorrowAPY = 0n

  return (
    <Card className="flex-1">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <Badge className="bg-ring p-2">
          <img src={market?.loanToken.iconUrl} className="size-10" />
        </Badge>
        <div className="flex flex-row items-center gap-2">
          <Button variant={"default"} size={"lg"}>
            Add Coverage
          </Button>
          <Button variant={"secondary"} size={"lg"}>
            Remove Coverage
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-evenly gap-6 lg:flex-row">
        <Card className="flex-1">
          <CardHeader className="font-chakra text-h5">Your Debt</CardHeader>
          <CardContent>
            <PositionCardStat
              title="Total Debt"
              value={dn.format([position?.totalDebt || 0n, 18], { digits: 2 })}
              symbol={market?.loanToken.symbol}
              secondaryValue={`$${position?.totalDebtUsd || 0}`}
              dataLoading={positionStatus === "success"}
            />

            <div className="mt-8 flex">
              <div className="flex flex-1 flex-col gap-4">
                {/* TODO: Covered Debt is a stubbed value. Replace with actual value when available */}
                <PositionCardStat
                  title="Covered Debt"
                  value={dn.format([coveredDebt, 18], { digits: 2 })}
                  symbol={market?.loanToken.symbol}
                  dataLoading={positionStatus === "success"}
                  size="sm"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                {/* TODO: Outstanding Debt is a stubbed value. Replace with actual value when covered debt becomes available. */}
                <PositionCardStat
                  title="Outstanding Debt"
                  value={dn.format([outstandingDebt, 18], { digits: 2 })}
                  symbol={market?.loanToken.symbol}
                  dataLoading={positionStatus === "success"}
                  size="sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex-1">
          <CardHeader className="font-chakra text-h5">
            Your Borrow Rate
          </CardHeader>
          <CardContent>
            {/* TODO: The substat here is stubbed. Need to work with the product team to determine what is the best stat to display here. */}
            <PositionCardStat
              title="Current Effective Borrow APY"
              value={dn.format([effectiveBorrowAPY, 18], { digits: 2 })}
              symbol="%"
              dataLoading={positionStatus === "success"}
              size="lg"
              secondaryValue={"0 USDC/yr"}
            />

            <div className="mt-8 flex">
              <div className="flex flex-1 flex-col gap-4">
                <PositionCardStat
                  title="Current Borrow APY"
                  value={dn.format([position?.currentRate || 0n, 18], 2)}
                  symbol="%"
                  dataLoading={positionStatus === "success"}
                  size="sm"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                {/* TODO: Projected Max Borrow APY is a stubbed value. Replace with actual value when FRB extra data field becomes available. */}
                <PositionCardStat
                  title="Projected Max Borrow APY"
                  value={"0"}
                  symbol={market?.loanToken.symbol}
                  dataLoading={positionStatus === "success"}
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
