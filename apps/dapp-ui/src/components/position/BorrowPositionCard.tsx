import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/base/card"
import { Separator } from "components/base/separator"
import * as dnum from "dnum"
import { ChevronDown } from "lucide-react"
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
      <span className="text-sm font-light text-secondary-foreground">
        {props.title}
      </span>

      <p className="flex items-baseline gap-x-1 font-dm text-lg">
        {props.value}

        {props.subValue && (
          <span className="text-sm font-light">{props.subValue}</span>
        )}
      </p>

      {props.secondaryValue && (
        <div className="font-dm text-sm font-light text-secondary-foreground">
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
          <div className="w-fit rounded-[8px] bg-popover p-3">
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
            <h4 className="font-mono font-bold">
              {props.market.collateralToken.symbol}/
              {props.market.loanToken.symbol}
            </h4>
          </CardTitle>
        </CardHeader>

        <CardContent className="grid grid-cols-[1fr_24px_1fr] gap-x-4 rounded-xl">
          <div>
            <div className="mb-4 text-sm">Your Current Loan</div>

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
                value={dnum.format(
                  [
                    props.liquidationPrice ?? 0n,
                    props.market.collateralToken.decimals,
                  ],
                  2
                )}
                subValue={props.market.collateralToken.symbol}
                secondaryValue={`${props.market.collateralToken.symbol}/${props.market.loanToken.symbol}`}
              />

              <BorrowPositionCardStat
                title="LTV"
                value={`${props.ltv * 100}%`}
                secondaryValue={`${dnum.format([BigInt(props.market.lltv), 16])}% Max LTV`}
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
                value={`${dnum.format([props.currentRate, 16], 2)}%`}
                secondaryValue={
                  <Badge
                    className="w-fit rounded-[4px] px-[4px] py-[2px] text-xs"
                    variant="destructive"
                  >
                    {(borrowRateDelta ?? 0) > 0 ? "+" : ""}
                    {dnum.format([borrowRateDelta ?? 0n, 18], 2)}% (30d)
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
                    {dnum.format([borrowRateDelta ?? 0n, 18], 2)}%
                  </Badge>
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="-ml-10 flex min-h-full flex-col gap-6 rounded-lg rounded-l-none border-y border-r bg-background p-8">
        <p className="gradient-text text-center text-lg font-medium">
          Fix your Rate
        </p>

        <div className="space-y-2 text-center">
          <div className="text-sm font-medium text-secondary-foreground">
            Variable
          </div>
          {props.rates ? (
            <p className="font-mono text-h4 text-secondary-foreground">
              {`${dnum.format(dnum.from(props.rates.lowestRate), 2)}%-${dnum.format(dnum.from(props.rates.highestRate), 2)}%`}
            </p>
          ) : (
            <p className="font-mono text-secondary-foreground">0%-0%</p>
          )}
        </div>

        <div className="grid grid-cols-[1fr_32px_1fr] items-center gap-2">
          <Separator orientation="horizontal" />

          <ChevronDown className="stroke-1" size={32} />

          <Separator orientation="horizontal" />
        </div>

        <div className="flex flex-col items-center gap-y-2">
          <p className="text-sm font-medium text-secondary-foreground">Fixed</p>

          <p className="gradient-text flex items-baseline gap-x-1 font-chakra text-h3 font-semibold">
            {formatRate(props.fixedRate)} <span className="text-h5">APY</span>
          </p>
        </div>

        <div className="mt-auto flex flex-col items-center gap-y-4">
          <Link href={`/borrow/${props.market.hyperdrive}`}>
            <Button size="lg">Fix Your Rate</Button>
          </Link>
          <p className="text-center text-xs font-light text-secondary-foreground">
            Coverage Period: 1 year. Remove anytime.
          </p>
        </div>
      </div>
    </div>
  )
}
