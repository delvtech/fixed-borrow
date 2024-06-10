import { Button } from "components/base/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/base/card"
import { Separator } from "components/base/separator"
import * as dnum from "dnum"
import { BorrowPosition } from "../../types"

export function BorrowPositionCard(props: BorrowPosition) {
  const borrowRateDelta = props.averageBorrowApy
    ? (props.currentBorrowApy - props.averageBorrowApy) * 100
    : null

  console.log(props, props.loanToken.iconUrl)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-x-2 font-chakra text-xl">
          <img src={props.loanToken.iconUrl} className="h-5 w-5" />
          {props.collateralToken.symbol} / {props.loanToken.symbol}
        </CardTitle>
      </CardHeader>

      <CardContent className="flex flex-row gap-x-24">
        <div>
          <div className="text-sm mb-4">Your Current Position</div>
          <div className="grid grid-cols-2 grid-rows-2 gap-8 grow grid-col">
            <div className="flex gap-y-1 items-start flex-col">
              <span className="text-sm text-secondary-foreground">
                Total Col.
              </span>
              <div className="font-dm leading-5 text-lg">
                {dnum.format(
                  [
                    BigInt(props.totalCollateral),
                    props.collateralToken.decimals,
                  ],
                  2
                )}
                <span className="leading-6 text-sm relative top-0.5 left-0.5">
                  {props.collateralToken.symbol}
                </span>
              </div>
              {props.totalCollateralUsd && (
                <div className="text-sm text-secondary-foreground font-dm">
                  ${props.totalCollateralUsd}
                </div>
              )}
            </div>

            <div className="flex gap-y-1 items-start flex-col">
              <span className="text-sm text-secondary-foreground">Debt</span>
              <div className="font-dm leading-5 text-lg">
                {dnum.format(
                  [BigInt(props.totalDebt), props.loanToken.decimals],
                  2
                )}
                <span className="leading-6 text-sm relative top-0.5 left-0.5">
                  {props.loanToken.symbol}
                </span>
              </div>
              {props.totalDebtUsd && (
                <div className="text-sm text-secondary-foreground font-dm">
                  ${props.totalDebtUsd}
                </div>
              )}
            </div>

            <div className="flex gap-y-1 items-start flex-col">
              <span className="text-sm text-secondary-foreground">
                Liq. Price
              </span>
              <div className="font-dm leading-5 text-lg">
                {props.liquidationPrice} {props.collateralToken.symbol}
              </div>
              <div className="text-sm text-secondary-foreground font-dm">
                {props.collateralToken.symbol} / {props.loanToken.symbol}
              </div>
            </div>

            <div className="flex gap-y-1 items-start flex-col">
              <span className="text-sm text-secondary-foreground">LTV</span>
              <div className="font-dm leading-5 text-lg">
                {props.ltv * 100}%
              </div>
              <div className="text-sm text-secondary-foreground font-dm">
                {dnum.format([BigInt(props.marketMaxLtv), 16])}% Max LTV
              </div>
            </div>
          </div>
        </div>

        <div>
          <Separator className="min-h-full" orientation="vertical" />
        </div>

        <div>
          <div className="text-sm mb-4">Your Borrowing Cost</div>

          <div className="grid grid-cols-1 grid-rows-2 gap-8 grow">
            <div className="flex gap-y-1 items-start flex-col">
              <span className="text-sm text-secondary-foreground">
                Current Borrow APY
              </span>
              <div className="font-dm leading-5 text-lg">
                {dnum.format(dnum.from(props.currentBorrowApy * 100), 2)}%
              </div>
              {/* <div className="text-sm text-secondary-foreground font-dm">
                <Badge
                  className="text-xs w-fit ml-2 text-gray-600"
                  variant="destructive"
                >
                  {(borrowRateDelta ?? 0) > 0 ? "+" : ""}
                  {dnum.format(dnum.from(borrowRateDelta ?? 0), 2)}% (30d)
                </Badge>
              </div> */}
            </div>

            <div className="flex gap-y-1 items-start flex-col">
              <span className="text-sm text-secondary-foreground">
                30d avg Borrow APY
              </span>
              <div className="font-dm leading-5 text-lg">
                {props.averageBorrowApy
                  ? `${dnum.format(dnum.from(props.averageBorrowApy * 100), 2)}%`
                  : "unknown"}
              </div>
              {/* <div className="text-sm text-secondary-foreground font-dm">
                <Badge
                  className="text-xs w-fit ml-2 text-gray-600"
                  variant="destructive"
                >
                  {(borrowRateDelta ?? 0) > 0 ? "+" : ""}
                  {dnum.format(dnum.from(borrowRateDelta ?? 0), 2)}% (30d)
                </Badge>
              </div> */}
            </div>
          </div>
        </div>

        <div>
          <Separator className="min-h-full" orientation="vertical" />
        </div>

        <div className="flex flex-col items-center gap-y-2 m-auto p-8 rounded">
          <div className="text-2xl font-semibold">10.41%</div>
          <Button>Fix your rate</Button>
        </div>
      </CardContent>
    </Card>
  )
}
