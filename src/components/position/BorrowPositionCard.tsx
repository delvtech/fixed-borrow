import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/base/card"
import { Separator } from "components/base/separator"
import * as dnum from "dnum"
import { ReactNode } from "react"
import { formatRate } from "utils/base/formatRate"
import { Link } from "wouter"
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

type BorrowPositionCardProps = BorrowPosition

export function BorrowPositionCard(props: BorrowPositionCardProps) {
  const averageRate = dnum.from(
    props.rates?.averageRate ?? 0,
    props.market.loanToken.decimals
  )
  const borrowRateDelta = props.rates?.averageRate ? averageRate[0] : null

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
          <CardTitle className="flex items-center gap-x-2 font-chakra">
            <h4>
              {props.market.collateralToken.symbol} /{" "}
              {props.market.loanToken.symbol}
            </h4>
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
                value={props.liquidationPrice?.toString() ?? ""}
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
        <span className="gradient-text text-center text-lg font-medium">
          Fix your Rate
        </span>

        <div className="text-center">
          <div>
            <div className="text-sm font-medium text-secondary-foreground">
              Variable
            </div>
            {props.rates ? (
              <h3 className="font-mono text-secondary-foreground">
                {`${dnum.format(dnum.from(props.rates.lowestRate), 2)}%-${dnum.format(dnum.from(props.rates.highestRate), 2)}%`}
              </h3>
            ) : (
              <h3 className="font-mono text-secondary-foreground">0%-0%</h3>
            )}
          </div>
        </div>

        <div>
          <Separator className="min-w-full" orientation="horizontal" />
        </div>

        <div className="flex flex-col items-center gap-y-2">
          <p className="text-sm font-medium text-secondary-foreground">
            Max Projected Fixed Rate
          </p>
          <h3 className="gradient-text text-3xl font-chakra font-semibold">
            {formatRate(props.fixedRate)}
          </h3>
        </div>

        <div className="mt-auto flex flex-col items-center gap-y-4">
          <Link href={`/borrow/${props.market.hyperdrive}`}>
            <Button size="lg">Fix Your Rate</Button>
          </Link>
          <p className="text-center text-sm font-light text-secondary-foreground">
            Coverage Period: 1 year. Remove anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
