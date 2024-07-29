import { QueryStatus } from "@tanstack/react-query"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import { Skeleton } from "components/base/skeleton"
import { cn } from "components/utils"
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
          <img src={market?.loanToken.iconUrl} className="size-14" />
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
            <DebtCardStat
              title="Total Debt"
              value={dn.format([position?.totalDebt || 0n, 18], { digits: 2 })}
              symbol={market?.loanToken.symbol}
              secondaryValue={`$${position?.totalDebtUsd || 0}`}
              dataLoading={positionStatus === "success"}
            />

            <div className="mt-8 flex">
              <div className="flex flex-1 flex-col gap-4">
                {/* TODO: Covered Debt is a stubbed value. Replace with actual value when available */}
                <DebtCardStat
                  title="Covered Debt"
                  value={dn.format([coveredDebt, 18], { digits: 2 })}
                  symbol={market?.loanToken.symbol}
                  dataLoading={positionStatus === "success"}
                  size="sm"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                {/* TODO: Outstanding Debt is a stubbed value. Replace with actual value when covered debt becomes available. */}
                <DebtCardStat
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
            <DebtCardStat
              title="Current Effective Borrow APY"
              value={dn.format([effectiveBorrowAPY, 18], { digits: 2 })}
              symbol="%"
              dataLoading={positionStatus === "success"}
              size="lg"
              secondaryValue={"0 USDC/yr"}
            />

            <div className="mt-8 flex">
              <div className="flex flex-1 flex-col gap-4">
                <DebtCardStat
                  title="Current Borrow APY"
                  value={dn.format([position?.currentRate || 0n, 18], 2)}
                  symbol="%"
                  dataLoading={positionStatus === "success"}
                  size="sm"
                />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                {/* TODO: Projected Max Borrow APY is a stubbed value. Replace with actual value when FRB extra data field becomes available. */}
                <DebtCardStat
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

function DebtCardStat({
  title,
  value,
  secondaryValue,
  symbol,
  size = "lg",
  dataLoading,
}: {
  title: string
  value: string | JSX.Element
  secondaryValue?: string | JSX.Element
  symbol?: string
  size?: "lg" | "sm"
  dataLoading?: boolean
}) {
  return (
    <>
      <p className={cn("text-secondary-foreground", { "mb-4": size === "lg" })}>
        {title}
      </p>
      <div className="flex items-end gap-1">
        <p
          className={cn({ "text-h3": size === "lg", "text-h4": size === "sm" })}
        >
          {dataLoading ? (
            value
          ) : (
            <Skeleton className="h-8 w-[250px] rounded-sm bg-muted" />
          )}
        </p>
        <p className="text-sm">{symbol}</p>
      </div>

      {dataLoading ? (
        <p className="text-secondary-foreground">{secondaryValue}</p>
      ) : (
        <Skeleton className="mt-1 h-8 w-[150px] rounded-sm bg-muted" />
      )}
    </>
  )
}
