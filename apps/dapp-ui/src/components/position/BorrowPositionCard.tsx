import { fixed, parseFixed } from "@delvtech/fixed-point-wasm"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import { Separator } from "components/base/separator"
import { ChevronDown } from "lucide-react"
import { ReactNode } from "react"
import { MorphoLogo } from "static/images/MorphoLogo"
import { Link } from "wouter"
import { BorrowPosition } from "../../types"

type BorrowPositionCardProps = BorrowPosition

export function BorrowPositionCard(props: BorrowPositionCardProps) {
  const decimals = props.market.loanToken.decimals

  const currentRate = fixed(props.currentRate ?? 0n, decimals)
  const currentFixedRate = fixed(props.fixedRate)

  const totalDebt = fixed(props.totalDebt, decimals)

  const highestRate = parseFixed(props.rates?.highestRate ?? 0n, decimals)
  const lowestRate = parseFixed(props.rates?.lowestRate ?? 0n, decimals)

  return (
    <div className="grid w-full grid-cols-2">
      <Card className="z-10 rounded-xl">
        <CardHeader className="flex space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex">
              <img
                src={props.market.collateralToken.iconUrl}
                className="size-6"
              />
              <img
                src={props.market.loanToken.iconUrl}
                className="-ml-3 size-6"
              />
            </div>

            <h4 className="font-chakra font-semibold">
              {props.market.collateralToken.symbol}/
              {props.market.loanToken.symbol}
            </h4>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-mono text-xs">
              <MorphoLogo />
              Morpho
            </Badge>

            <Badge variant="secondary" className="ont-mono text-xs">
              LLTV: 86%
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="grid grid-rows-3 gap-5">
          <BorrowPositionCardStat
            title="Your Current Loan"
            value={`${totalDebt.format({
              decimals: 2,
              compactDisplay: "short",
            })} ${props.market.loanToken.symbol}`}
            secondaryValue={`$${props.totalDebtUsd}`}
          />

          <BorrowPositionCardStat
            title="Your Borrowing Rate"
            value={currentRate.format({
              decimals: 2,
              percent: true,
            })}
          />

          <BorrowPositionCardStat
            title="Volitility"
            value={<p className="text-md font-light text-primary/90">Low</p>}
          />
        </CardContent>
      </Card>

      <div className="-ml-8 flex flex-col items-center gap-5 rounded-xl rounded-l-none border-y border-r bg-background p-6 pl-16">
        <div className="flex w-full grow flex-col justify-between">
          <div className="space-y-2 text-center">
            <p className="text-sm font-medium text-secondary-foreground">
              Variable Rate
            </p>

            {props.rates ? (
              <p className="font-chakra text-h4 text-[#D3DAEB]">
                {`${lowestRate.format({
                  decimals: 2,
                  percent: true,
                })} - ${highestRate.format({
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
              {currentFixedRate.format({
                decimals: 2,
                trailingZeros: true,
                percent: true,
              })}
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

interface BorrowPositionCardStatProps {
  title: string
  value: ReactNode
  secondaryValue?: ReactNode
}

function BorrowPositionCardStat(props: BorrowPositionCardStatProps) {
  return (
    <div className="flex w-full justify-between gap-y-2">
      <p className="text-sm font-light text-secondary-foreground">
        {props.title}
      </p>

      <div className="flex flex-col items-end gap-1 font-mono text-md font-light">
        <p>{props.value}</p>

        <p className="text-xs text-secondary-foreground">
          {props.secondaryValue}
        </p>
      </div>
    </div>
  )
}
