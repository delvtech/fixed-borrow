import { useQuery } from "@tanstack/react-query"
import { Badge } from "components/ui/badge"
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
import { MorphoMarketReader } from "lib/markets/MarketsReader"
import { Check } from "lucide-react"
import { Address } from "viem"

function useAllBorrowPositions(account?: Address) {
  return useQuery({
    queryKey: ["all-borrow-positions", account],
    queryFn: async () => {
      return await MorphoMarketReader.getBorrowPositions(account!)
    },
    enabled: !!account,
  })
}

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

function BorrowPositionCard(props: BorrowPositionCardProps) {
  return (
    <Card className="min-w-[1200px]">
      <CardHeader>
        <CardTitle>{props.loanTokenSymbol}</CardTitle>
        <CardDescription>{props.loanTokenName}</CardDescription>
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

export function HomePage() {
  const { data: borrowPositions = [] } = useAllBorrowPositions(
    "0x9e990c8dc9768f959b5abf7910f5fd3b965ccf24"
  )

  return (
    <main className="h-min-screen mt-16 flex flex-col gap-y-12">
      <div>
        <div className="flex flex-col items-center gap-y-4">
          <h1 className="text-2xl font-bold">Fix Your Borrow</h1>
          <span className="text-sm text-gray-500">
            Keep all the best parts of your Borrow position, but have peace of
            mind with a predictable interest rate.
          </span>

          <div>
            <Badge className="text-xs" variant="secondary">
              <Check size={16} className="mr-1" /> Protect against high future
              rates
            </Badge>

            <Badge className="text-xs" variant="secondary">
              <Check size={16} className="mr-1" /> Core position remains
              unchanged
            </Badge>

            <Badge className="text-xs" variant="secondary">
              <Check size={16} className="mr-1" /> Keep using automations or
              other tools
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-12 items-center">
        {borrowPositions.map((position) => {
          return <BorrowPositionCard {...position} />
        })}
      </div>
      {/* <Card>
        <CardHeader>
          <CardTitle>Your Positions</CardTitle>
          <CardDescription>Open borrow positions on Morpho.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of your Morpho borrow positions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Loan</TableHead>
                <TableHead>Borrow</TableHead>
                <TableHead>Collateral</TableHead>
                <TableHead>Borrow Apy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrowPositions.map((position) => (
                <TableRow key={position.market.uniqueKey}>
                  <TableCell className="font-medium">
                    {position.market.collateralAsset?.symbol} /{" "}
                    {position.market.loanAsset.symbol}
                  </TableCell>
                  <TableCell>
                    ${dn.format(dn.from(position.borrowAssetsUsd ?? 0), 2)}
                  </TableCell>
                  <TableCell>
                    ${dn.format(dn.from(position.collateralUsd ?? 0), 2)}
                  </TableCell>
                  <TableCell>
                    {dn.format(
                      dn.from((position.market.state?.borrowApy ?? 0) * 100),
                      {
                        digits: 2,
                        trailingZeros: true,
                      }
                    )}
                    %
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}
    </main>
  )
}
