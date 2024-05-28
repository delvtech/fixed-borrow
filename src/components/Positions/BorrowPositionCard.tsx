import { Button } from "components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card"
import { Separator } from "components/ui/separator"
import * as dnum from "dnum"

interface BorrowPositionCardProps {
  loanTokenSymbol: string
  loanTokenName: string
  collateralTokenSymbol: string
  collateralTokenName: string
  totalCollateral: string
  totalCollateralUsd: string
  totalDebt: string
  totalDebtUsd: string
  ltv: number
  marketMaxLtv: string
  currentBorrowApy: number
  averageBorrowApy: number
}

export function BorrowPositionCard(props: BorrowPositionCardProps) {
  return (
    <Card className="min-w-[1200px]">
      <CardHeader>
        <CardTitle>{props.loanTokenSymbol} </CardTitle>
        <CardDescription>
          {props.loanTokenSymbol} / {props.collateralTokenSymbol}{" "}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-row gap-x-12">
        <div className="grid grid-cols-2 grid-rows-2 gap-4 grow grid-col">
          <div className="flex gap-x-2 items-start">
            <span className="text-sm text-gray-600">Total Col.</span>
            <div>
              <div className="font-medium font-display leading-5 text-lg">
                {dnum.format([BigInt(props.totalCollateral), 18], 2)}{" "}
                {props.loanTokenSymbol}
              </div>
              <div className="text-sm text-gray-600">
                ${dnum.format(dnum.from(props.totalCollateralUsd), 2)}
              </div>
            </div>
          </div>

          <div className="flex gap-x-2 items-start">
            <span className="text-sm text-gray-600">Debt</span>
            <div>
              <div className="font-medium font-display leading-5 text-lg">
                {dnum.format([BigInt(props.totalDebt), 18], 2)}{" "}
                {props.loanTokenSymbol}
              </div>
              <div className="text-sm text-gray-600">
                ${dnum.format(dnum.from(props.totalDebtUsd), 2)}
              </div>
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
                {dnum.format(
                  dnum.from(
                    (+props.totalDebtUsd / +props.totalCollateralUsd) * 100
                  ),
                  2
                )}
                %
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
            <div className="font-medium font-display leading-5 text-lg">
              {dnum.format(dnum.from(props.currentBorrowApy * 100), 2)}%
            </div>
            <div className="text-sm text-gray-600">+2.00% (7d)</div>
          </div>

          <div className="flex flex-col">
            <span className="text-sm text-gray-600">30d avg Borrow APY</span>
            <div className="font-medium font-display leading-5 text-lg">
              {dnum.format(dnum.from(props.averageBorrowApy * 100), 2)}%
            </div>
            <div className="text-sm text-gray-600">+1.52% (7d)</div>
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
