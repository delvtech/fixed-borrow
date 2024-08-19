import { fixed, parseFixed } from "@delvtech/fixed-point-wasm"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import { Separator } from "components/base/separator"
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
    <div className="flex w-full justify-between gap-y-2">
      <p className="flex items-baseline gap-x-1 text-sm font-light text-secondary-foreground">
        {props.title}
      </p>

      {props.value && (
        <div className="flex flex-col items-end gap-1 font-mono text-md font-light">
          <p>{props.value}</p>

          <p className="text-xs text-secondary-foreground">
            {props.secondaryValue}
          </p>
        </div>
      )}
    </div>
  )
}

type BorrowPositionCardProps = BorrowPosition

export function BorrowPositionCard(props: BorrowPositionCardProps) {
  const decimals = props.market.loanToken.decimals

  const currentRate = fixed(props.currentRate ?? 0n, decimals)

  console.log(props.rates)

  // const averageRate = parseFixed(props.rates?.averageRate ?? 0n, decimals)
  // const rateDelta = currentRate.sub(averageRate)

  return (
    <div className="grid w-full grid-cols-2">
      <Card className="z-10 rounded-[32px]">
        <CardHeader className="flex space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex">
              <img
                src={props.market.collateralToken.iconUrl}
                className="inline size-6"
              />
              <img
                src={props.market.loanToken.iconUrl}
                className="-ml-3 inline size-6"
              />
            </div>
            <h4 className="font-chakra font-semibold">
              {props.market.collateralToken.symbol}/
              {props.market.loanToken.symbol}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="flex items-center gap-1 rounded-[4px] border-none bg-popover px-2 py-1 font-mono text-xs text-secondary-foreground">
              <svg
                width="14"
                height="12"
                viewBox="0 0 14 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.08472 8.15516V11.6482C2.08472 11.8633 2.2667 11.9525 2.32332 11.9728C2.37993 11.9971 2.57001 12.0499 2.73985 11.8916L5.38236 9.35222C5.60739 9.13599 5.82458 8.90868 5.98778 8.64272C6.0646 8.51768 6.09645 8.44726 6.09645 8.44726C6.25824 8.11865 6.25824 7.8022 6.10046 7.48576C5.86599 7.01516 5.26742 6.53642 4.36554 6.08203L2.82478 6.94213C2.36781 7.20177 2.08472 7.66022 2.08472 8.15516Z"
                  fill="#00378A"
                />
                <path
                  d="M0.565552 0.385416V4.04888C0.565552 4.50731 0.872906 4.913 1.30967 5.04283C2.79788 5.47288 5.39014 6.39786 6.01699 7.75695C6.0978 7.93545 6.14635 8.10992 6.16263 8.29247C6.57914 7.53382 6.76919 6.66157 6.68023 5.77715C6.55887 4.52354 5.8956 3.38352 4.86039 2.65732L1.16813 0.0730267C1.10341 0.0243426 1.02658 0 0.949743 0C0.88503 0 0.828414 0.0121714 0.767756 0.0446274C0.646428 0.113596 0.565552 0.239365 0.565552 0.385416Z"
                  fill="#1859F2"
                />
                <path
                  d="M11.9125 8.15516V11.6482C11.9125 11.8633 11.7306 11.9525 11.6739 11.9728C11.6173 11.9971 11.4271 12.0499 11.2574 11.8916L8.55334 9.29315C8.36928 9.11624 8.19352 8.92915 8.05487 8.71475C7.94506 8.54504 7.9008 8.44726 7.9008 8.44726C7.73901 8.11865 7.73901 7.8022 7.89665 7.48576C8.13125 7.01516 8.72983 6.53642 9.63155 6.08203L11.1724 6.94213C11.6335 7.20177 11.9125 7.66022 11.9125 8.15516Z"
                  fill="#00378A"
                />
                <path
                  d="M13.4345 0.385416V4.04887C13.4345 4.5073 13.1271 4.913 12.6903 5.04282C11.2021 5.47287 8.60994 6.39787 7.98309 7.75695C7.90212 7.93546 7.85357 8.10991 7.83745 8.29248C7.42092 7.53383 7.23087 6.66158 7.31983 5.77714C7.44105 4.52353 8.10432 3.38353 9.13969 2.65733L12.832 0.0730252C12.8966 0.0243412 12.9735 0 13.0503 0C13.115 0 13.1716 0.0121713 13.2322 0.0446272C13.3536 0.113596 13.4345 0.239364 13.4345 0.385416Z"
                  fill="#1859F2"
                />
              </svg>{" "}
              Morpho
            </Badge>
            <Badge className="rounded-[4px] border-none bg-popover px-2 py-1 font-mono text-xs text-secondary-foreground">
              LLTV: 86%
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="grid grid-rows-2 gap-5">
          <BorrowPositionCardStat
            title="Your Current Loan"
            value={`${fixed(props.totalDebt, decimals).format({
              decimals: 2,
              compactDisplay: "short",
            })} ${props.market.loanToken.symbol}`}
            subValue={props.market.loanToken.symbol}
            secondaryValue={`$${props.totalDebtUsd}`}
          />

          <BorrowPositionCardStat
            title="Your Borrowing Rate"
            value={fixed(props.currentRate, 18).format({
              decimals: 2,
              percent: true,
            })}
            subValue={props.market.loanToken.symbol}
            // secondaryValue={
            //   <Badge
            //     className="w-fit rounded-[4px] px-[4px] py-[2px] text-xs"
            //     variant="destructive"
            //   >
            //     {rateDelta.gt(0n) ? "+" : ""}
            //     {rateDelta.format({
            //       decimals: 2,
            //       percent: true,
            //     })}{" "}
            //     (30d)
            //   </Badge>
            // }
          />
        </CardContent>
      </Card>

      <div className="-ml-8 flex flex-col items-center gap-5 rounded-[32px] rounded-l-none border-y border-r bg-background p-6 pl-16">
        <div className="w-full">
          <div className="space-y-2 text-center">
            <p className="text-sm font-medium text-secondary-foreground">
              Variable Rate
            </p>
            {props.rates ? (
              <p className="font-chakra text-h4 text-[#D3DAEB]">
                {`${parseFixed(props.rates.lowestRate).format({
                  decimals: 2,
                  percent: true,
                })} - ${parseFixed(props.rates.highestRate).format({
                  decimals: 2,
                  percent: true,
                })}`}
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
            <p className="text-sm font-medium text-secondary-foreground">
              Fixed Rate
            </p>

            <p className="gradient-text font-chakra text-h3 font-medium">
              {formatRate(props.fixedRate)}
            </p>
          </div>
        </div>

        <Link href={`/borrow/${props.market.hyperdrive}`}>
          <Button size="lg" className="font-semibold">
            Fix Your Rate
          </Button>
        </Link>
      </div>
    </div>
  )
}
