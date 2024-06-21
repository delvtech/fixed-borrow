import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/base/card"
import { Separator } from "components/base/separator"
import * as dnum from "dnum"
import { ReactNode } from "react"
import { BorrowPosition } from "../../types"

interface BorrowPositionCardStatProps {
  title: string
  value: string
  subValue?: string
  secondaryValue?: ReactNode
}
function BorrowPositionCardStat(props: BorrowPositionCardStatProps) {
  return (
    <div className="flex gap-y-2 items-start flex-col">
      <span className="text-sm text-secondary-foreground">{props.title}</span>
      <div className="font-dm leading-5 text-lg font-medium">
        {props.value}
        {props.subValue && (
          <span className="text-sm relative top-0.5 left-0.5 font-normal">
            {props.subValue}
          </span>
        )}
      </div>
      {props.secondaryValue && (
        <div className="text-sm text-secondary-foreground font-dm">
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
          <div className="bg-[#1c1f27] p-3 rounded-[8px] w-fit">
            <img
              src={props.market.collateralToken.iconUrl}
              className="h-5 w-5 inline"
            />
            <img
              src={props.market.loanToken.iconUrl}
              className="h-5 w-5 inline -ml-3"
            />
          </div>
          <CardTitle className="flex items-center gap-x-2 font-chakra text-xl">
            {props.market.collateralToken.symbol} /{" "}
            {props.market.loanToken.symbol}
          </CardTitle>
        </CardHeader>

        <CardContent className="grid gap-x-4 grid-cols-[1fr_24px_1fr]">
          <div>
            <div className="text-sm mb-4 font-medium">Your Current Loan</div>
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
            <div className="text-sm mb-4">Your Borrowing Cost</div>

            <div className="grid grid-cols-1 grid-rows-2 gap-y-8">
              <BorrowPositionCardStat
                title="Current Borrow APY"
                value={`${dnum.format(dnum.from(props.currentRate), 2)}%`}
                secondaryValue={
                  <Badge
                    className="text-xs w-fit py-[2px] px-[4px] rounded-[4px]"
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
                    className="text-xs w-fit py-[2px] px-[4px] rounded-[4px]"
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
      <div className="flex flex-col bg-background min-h-full p-8 rounded-lg gap-6 border-t border-b border-r -ml-10">
        <span className="text-lg font-medium text-primary text-center">
          Fix your Rate
        </span>

        <div className="text-center">
          <div>
            <div className="text-sm font-medium text-secondary-foreground">
              Variable
            </div>
            {props.rates && (
              <span className="text-3xl text-secondary-foreground font-mono">
                {`${dnum.format(dnum.from(props.rates.lowestRate), 2)}%-${dnum.format(dnum.from(props.rates.highestRate), 2)}%`}
              </span>
            )}
          </div>
        </div>

        <div>
          <Separator className="min-w-full" orientation="horizontal" />
        </div>

        <div className="flex flex-col gap-y-2 items-center">
          <div className="text-sm text-secondary-foreground font-medium">
            Max Projected Fixed Rate
          </div>
          <div className="text-3xl font-chakra font-semibold gradient-text">{`${dnum.format(dnum.from(props.fixedRate), 2)}%`}</div>
        </div>

        <div className="flex flex-col gap-y-2 items-center">
          <Button size="lg" onClick={props.onClick}>
            Fix Your Rate
          </Button>
          <div className="text-sm text-secondary-foreground text-center">
            Coverage Period: 1 year. Remove anytime.
          </div>
        </div>
      </div>
    </div>
  )
}
