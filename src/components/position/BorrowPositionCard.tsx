import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/base/card"
import { Separator } from "components/base/separator"
import * as dnum from "dnum"
import { BorrowPosition } from "../../types"

export function BorrowPositionCard(props: BorrowPosition) {
  console.log(props)
  const borrowRateDelta =
    (props.currentBorrowApy - props.averageBorrowApy) * 100

  return (
    <Card className="min-w-[1200px]">
      <CardHeader>
        <CardTitle>{props.loanToken.symbol} </CardTitle>
        <CardDescription>
          {props.loanToken.symbol} / {props.collateralToken.symbol}{" "}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-row gap-x-12">
        <div className="grid grid-cols-2 grid-rows-2 gap-4 grow grid-col">
          <div className="flex gap-x-2 items-start">
            <span className="text-sm text-gray-600">Total Col.</span>
            <div>
              <div className="font-medium font-display leading-5 text-lg">
                {dnum.format(
                  [
                    BigInt(props.totalCollateral),
                    props.collateralToken.decimals,
                  ],
                  2
                )}{" "}
                {props.collateralToken.symbol}
              </div>
              {props.totalCollateralUsd && (
                <div className="text-sm text-gray-600">
                  ${dnum.format(dnum.from(props.totalCollateralUsd), 2)}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-x-2 items-start">
            <span className="text-sm text-gray-600">Debt</span>
            <div>
              <div className="font-medium font-display leading-5 text-lg">
                {dnum.format(
                  [BigInt(props.totalDebt), props.loanToken.decimals],
                  2
                )}{" "}
                {props.loanToken.symbol}
              </div>
              {props.totalDebtUsd && (
                <div className="text-sm text-gray-600">
                  ${dnum.format(dnum.from(props.totalDebtUsd), 2)}
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-x-2 items-start">
            <span className="text-sm text-gray-600">Liq. Price</span>
            <div>
              <div className="font-medium font-display leading-5 text-lg">
                32%
              </div>
              <div className="text-sm text-gray-600">86% Max LTV</div>
            </div>
          </div>

          <div className="flex gap-x-2 items-start">
            <span className="text-sm text-gray-600">LTV</span>
            <div>
              <div className="font-medium font-display leading-5 text-lg">
                {/* {dnum.format(
                  dnum.from(
                    (+props.totalDebtUsd / +props.totalCollateralUsd) * 100
                  ),
                  2
                )} */}
                {props.ltv * 100}%
              </div>
              <div className="text-sm text-gray-600">
                {dnum.format([BigInt(props.marketMaxLtv), 16])}% Max LTV
              </div>
            </div>
          </div>
        </div>

        <div>
          <Separator className="min-h-full" orientation="vertical" />
        </div>

        <div className="grid grid-cols-1 grid-rows-2 gap-4 grow">
          <div className="flex flex-col">
            <span className="text-sm text-gray-600">Current Borrow APY</span>
            <div className="font-medium font-display leading-5 text-lg flex items-center">
              {dnum.format(dnum.from(props.currentBorrowApy * 100), 2)}%
              <Badge
                className="text-xs w-fit ml-2 text-gray-600"
                variant="secondary"
              >
                {borrowRateDelta > 0 ? "+" : ""}
                {dnum.format(dnum.from(borrowRateDelta), 2)}% (30d)
              </Badge>
            </div>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-600">30d avg Borrow APY</span>
            <div className="font-medium font-display leading-5 text-lg">
              {dnum.format(dnum.from(props.averageBorrowApy * 100), 2)}%
            </div>
            {/* <div className="text-sm text-gray-600">+1.52% (7d)</div> */}
          </div>
        </div>

        <div>
          <Separator className="min-h-full" orientation="vertical" />
        </div>

        <div className="m-auto flex flex-col items-center gap-y-2 grow">
          <div className="text-2xl font-semibold">10.41%</div>
          <Button>Fix your rate</Button>
        </div>
      </CardContent>
    </Card>
  )
}
