import { fixed, FixedPoint } from "@delvtech/fixed-point-wasm"
import { OpenShort, ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { useQuery } from "@tanstack/react-query"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import { Collapsible, CollapsibleContent } from "components/base/collapsible"
import { Separator } from "components/base/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/base/table"
import { MarketHeader } from "components/markets/MarketHeader"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { formatAddress } from "utils/base/formatAddress"
import { getUSDPrice } from "utils/price/getUSDPrice"
import { Address } from "viem"
import { useAccount, useChainId, usePublicClient } from "wagmi"
import { SupportedChainId } from "~/constants"
import { Market } from "../types"

interface MarketPositionsCardProps {
  market: Market
  totalCoverage: bigint
  debtCovered: bigint
  shorts: OpenShort[]
}

const dayInSeconds = 60 * 60 * 24

function MarketPositionsCard(props: MarketPositionsCardProps) {
  const [tableOpen, setTableOpen] = useState(false)
  const decimals = props.market.loanToken.decimals
  const symbol = props.market.loanToken.symbol

  const oldestShort = props.shorts.at(0)
  const currentDateSeconds = Date.now()
  const daysRemaining = oldestShort
    ? Math.round(
        (Number(oldestShort.maturity) - currentDateSeconds / 1000) /
          dayInSeconds
      )
    : undefined

  const debtCovered = fixed(props.debtCovered, decimals)

  const shouldShowAddCoverageButton =
    debtCovered.gt(0n) && debtCovered.lt(FixedPoint.one(decimals))

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between space-y-0">
        <MarketHeader market={props.market} className="text-h4" />

        {shouldShowAddCoverageButton && (
          <Button className="bg-gradient-to-r from-primary to-skyBlue">
            Add Coverage
          </Button>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-secondary-foreground">Total Coverage</p>
            <p className="font-mono text-lg">
              {fixed(props.totalCoverage, decimals).format({
                decimals: 2,
                trailingZeros: false,
              })}{" "}
              {symbol}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-secondary-foreground">Debt Covered</p>
            <p className="font-mono text-lg">
              {fixed(props.debtCovered, decimals).format({
                percent: true,
                trailingZeros: false,
              })}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-secondary-foreground">Next Expiry</p>
            <p className="font-mono text-lg">
              {daysRemaining
                ? `${daysRemaining} day${dayInSeconds === 1 ? "" : "s"}`
                : "n/a"}
            </p>
          </div>

          <Button variant="ghost" onClick={() => setTableOpen((open) => !open)}>
            <p>Manage</p> <ChevronDown />
          </Button>
        </div>

        <Collapsible open={tableOpen}>
          <CollapsibleContent>
            <Separator />

            <h6 className="p-4 font-chakra font-medium">Coverage Positions</h6>
            <Table>
              <TableHeader className="[&_tr]:border-b-0">
                <TableRow className="hover:bg-card">
                  <TableHead className="font-normal text-secondary-foreground">
                    Coverage Date
                  </TableHead>
                  <TableHead className="font-normal text-secondary-foreground">
                    Amount
                  </TableHead>
                  <TableHead className="font-normal text-secondary-foreground">
                    Fixed Rate
                  </TableHead>
                  <TableHead className="font-normal text-secondary-foreground">
                    Expiry Date
                  </TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {props.shorts.map((short) => {
                  const openedDate = new Date(
                    Number(short.openedTimestamp) * 1000
                  )
                  const maturity = new Date(Number(short.maturity) * 1000)

                  return (
                    <TableRow
                      key={short.assetId.toString()}
                      className="hover:bg-card"
                    >
                      <TableCell className="font-mono">
                        {openedDate.toLocaleDateString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        {fixed(short.bondAmount, decimals).format({
                          decimals: 2,
                          trailingZeros: false,
                        })}{" "}
                        {symbol}
                      </TableCell>
                      <TableCell className="font-mono">10.70%</TableCell>
                      <TableCell className="font-mono">
                        {maturity.toLocaleString()}
                      </TableCell>
                      <TableCell className="font-mono">
                        <Button
                          variant="secondary"
                          className="ml-auto"
                          disabled
                        >
                          Remove Coverage
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

function useAllBorrowPositions(account?: Address) {
  const chainId = useChainId()
  const client = usePublicClient()

  return useQuery({
    queryKey: ["borrow-positions", account, chainId],
    queryFn: async () => {
      const reader = new MorphoMarketReader(
        client!,
        chainId as SupportedChainId
      )
      const borrowPositions = await reader.getBorrowPositions(account!)

      const usdPrices = await getUSDPrice(
        borrowPositions.map((p) => p.market.loanToken.address),
        client!.chain
      )

      return await Promise.all(
        borrowPositions.map(async (position) => {
          const readHyperdrive = new ReadHyperdrive({
            address: position.market.hyperdrive,
            publicClient: client!,
          })

          const usdPrice: bigint | undefined =
            usdPrices[position.market.loanToken.address]

          const decimals = position.market.loanToken.decimals

          const shorts = await readHyperdrive.getOpenShorts({
            account: account!,
          })
          const totalCoverage = shorts.reduce((prev, curr) => {
            return prev + curr.bondAmount
          }, 0n)

          const totalCoverageUsd = usdPrice
            ? shorts.reduce((prev, curr) => {
                return (
                  prev + fixed(curr.bondAmount).mul(usdPrice, decimals).bigint
                )
              }, 0n)
            : 0n

          const debtCovered =
            position.totalDebt === 0n
              ? fixed(0n, decimals)
              : fixed(totalCoverage, decimals).div(position.totalDebt, decimals)

          return {
            market: position.market,
            position,
            shorts,
            totalCoverage,
            totalCoverageUsd,
            debtCovered,
          }
        })
      )
    },
    enabled: !!account && !!client,
  })
}

export function PositionPage() {
  const { address: account } = useAccount()

  const { data: borrowPositions } = useAllBorrowPositions(account)

  // const totalCoverage = borrowPositions?.reduce(
  //   (prev, curr) => prev + curr.totalCoverage,
  //   0n
  // )

  return (
    <main className="m-auto my-8 flex max-w-7xl flex-col gap-8 px-8 lg:px-28">
      <h2 className="gradient-text w-fit font-chakra font-medium">
        My Positions
      </h2>

      <div className="flex gap-12">
        {account && (
          <div className="space-y-1">
            <p className="text-secondary-foreground">Account</p>
            <p className="font-mono text-h5">{formatAddress(account)}</p>
          </div>
        )}

        {/* TODO */}
        <div className="space-y-1">
          <p className="text-secondary-foreground">Total Fixed Debt</p>
          <p className="font-mono text-h5">$170,000</p>
        </div>
      </div>

      {borrowPositions
        ?.filter(Boolean)
        .map((position) => (
          <MarketPositionsCard
            key={position.market.hyperdrive}
            market={position.market}
            totalCoverage={position.totalCoverage}
            debtCovered={position.debtCovered.bigint}
            shorts={position.shorts}
          />
        ))}
    </main>
  )
}
