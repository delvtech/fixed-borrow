import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/base/card"
import { Separator } from "components/base/separator"
import * as dnum from "dnum"
import { ReactNode } from "react"
import { formatRate } from "utils/base/formatRate"
import { BorrowPosition } from "../../types"

interface BorrowPositionCardStatProps {
  title: string
  value: string
  subValue?: string
  secondaryValue?: ReactNode
}
function BorrowPositionCardStat(props: BorrowPositionCardStatProps) {
  return (
    <div className="flex flex-col items-start gap-y-2">
      <span className="text-sm text-secondary-foreground">{props.title}</span>
      <div className="font-dm text-lg font-medium leading-5">
        {props.value}
        {props.subValue && (
          <span className="relative left-0.5 top-0.5 text-sm font-normal">
            {props.subValue}
          </span>
        )}
      </div>
      {props.secondaryValue && (
        <div className="font-dm text-sm text-secondary-foreground">
          {props.secondaryValue}
        </div>
      )}
    </div>
  )
}

type BorrowPositionCardProps = BorrowPosition & {
  onClick?: () => void
}

export function BorrowPositionCard(props: BorrowPositionCardProps) {
  const borrowRateDelta = props.rates?.averageRate
    ? props.currentRate - props.rates?.averageRate
    : null

  return (
    <div className="flex w-full max-w-screen-lg">
      <Card className="grow">
        <CardHeader>
          <div className="w-fit rounded-[8px] bg-[#1c1f27] p-3">
            <img
              src={props.market.collateralToken.iconUrl}
              className="inline h-5 w-5"
            />
            <img
              src={props.market.loanToken.iconUrl}
              className="-ml-3 inline h-5 w-5"
            />
          </div>
          <CardTitle className="flex items-center gap-x-2 font-chakra text-xl">
            {props.market.collateralToken.symbol} /{" "}
            {props.market.loanToken.symbol}
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-[1fr_24px_1fr] gap-x-4">
          <div>
            <div className="mb-4 text-sm font-medium">Your Current Loan</div>
            <div className="grid grid-cols-2 grid-rows-2 gap-y-8">
              <BorrowPositionCardStat
                title="Total Collateral"
                value={dnum.format(
                  [
                    BigInt(props.totalCollateral),
                    props.market.collateralToken.decimals,
                  ],
                  2
                )}
                subValue={props.market.collateralToken.symbol}
                secondaryValue={`$${props.totalCollateralUsd}`}
              />

              <BorrowPositionCardStat
                title="Debt"
                value={dnum.format(
                  [BigInt(props.totalDebt), props.market.loanToken.decimals],
                  2
                )}
                subValue={props.market.loanToken.symbol}
                secondaryValue={`$${props.totalDebtUsd}`}
              />

              <BorrowPositionCardStat
                title="Liq. Price"
                value={`${props.ltv * 100}%`}
                secondaryValue={`${dnum.format([BigInt(props.market.lltv), 16])}% Max LTV`}
              />

              <BorrowPositionCardStat
                title="LTV"
                value={props.liquidationPrice ?? ""}
                subValue={props.market.collateralToken.symbol}
                secondaryValue={`${props.market.collateralToken.symbol}/${props.market.loanToken.symbol}`}
              />
            </div>
          </div>

          <div>
            <Separator className="min-h-full" orientation="vertical" />
          </div>

          <div>
            <div className="mb-4 text-sm">Your Borrowing Cost</div>

            <div className="grid grid-cols-1 grid-rows-2 gap-y-8">
              <BorrowPositionCardStat
                title="Current Borrow APY"
                value={`${dnum.format(dnum.from(props.currentRate), 2)}%`}
                secondaryValue={
                  <Badge
                    className="w-fit rounded-[4px] px-[4px] py-[2px] text-xs"
                    variant="destructive"
                  >
                    {(borrowRateDelta ?? 0) > 0 ? "+" : ""}
                    {dnum.format(dnum.from(borrowRateDelta ?? 0), 2)}% (30d)
                  </Badge>
                }
              />

              <BorrowPositionCardStat
                title=" 30d avg Borrow APY"
                value={
                  props.rates?.averageRate
                    ? `${dnum.format(dnum.from(props.rates?.averageRate), 2)}%`
                    : "unknown"
                }
                secondaryValue={
                  <Badge
                    className="w-fit rounded-[4px] px-[4px] py-[2px] text-xs"
                    variant="destructive"
                  >
                    {(borrowRateDelta ?? 0) > 0 ? "+" : ""}
                    {dnum.format(dnum.from(borrowRateDelta ?? 0), 2)}% (30d)
                  </Badge>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* TODO FIX */}
      <div className="-ml-10 flex min-h-full flex-col gap-6 rounded-lg border-b border-r border-t bg-background p-8">
        <span className="text-center text-lg font-medium text-primary">
          Fix your Rate
        </span>

        <div className="text-center">
          <div>
            <div className="text-sm font-medium text-secondary-foreground">
              Variable
            </div>
            {props.rates && (
              <span className="font-mono text-3xl text-secondary-foreground">
                {`${dnum.format(dnum.from(props.rates.lowestRate), 2)}%-${dnum.format(dnum.from(props.rates.highestRate), 2)}%`}
              </span>
            )}
          </div>
        </div>

        <div>
          <Separator className="min-w-full" orientation="horizontal" />
        </div>

        <div className="flex flex-col items-center gap-y-2">
          <div className="text-sm font-medium text-secondary-foreground">
            Max Projected Fixed Rate
          </div>
          <div className="gradient-text font-chakra text-3xl font-semibold">
            {formatRate(props.fixedRate)}
          </div>
        </div>

        <div className="flex flex-col items-center gap-y-2">
          <Button size="lg" onClick={props.onClick}>
            Fix Your Rate
          </Button>
          <div className="text-center text-sm text-secondary-foreground">
            Coverage Period: 1 year. Remove anytime.
          </div>
        </div>
      </div>
    </div>
  )
}
