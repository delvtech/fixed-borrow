import { fixed, FixedPoint } from "@delvtech/fixed-point-wasm"
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
import { CloseCoverageDialog } from "components/core/CloseCoverageDialog"
import { MarketHeader } from "components/markets/MarketHeader"
import { ChevronDown, ChevronUp } from "lucide-react"
import { useMemo, useState } from "react"
import { Market, OpenShortPlusQuote } from "src/types"
import { dayInSeconds } from "utils/constants"
import { Link } from "wouter"

interface ActivePositionCardProps {
  market: Market
  totalCoverage: bigint
  debtCovered: bigint
  shorts: OpenShortPlusQuote[]
  /** The card is fully opened by default. */
  startOpened?: boolean
}

export function ActivePositionCard(props: ActivePositionCardProps) {
  const [selectedOpenShort, setSelectedOpenShort] =
    useState<OpenShortPlusQuote>()
  const [tableOpen, setTableOpen] = useState(props.startOpened ?? false)

  const [closeCoverageModalOpen, setCloseCoverageModalOpen] = useState(false)
  const handleCloseCoverageModelOpen = (open: boolean) => {
    setCloseCoverageModalOpen(open)
    setSelectedOpenShort(undefined)
  }

  const decimals = props.market.loanToken.decimals
  const symbol = props.market.loanToken.symbol

  const oldestShort = props.shorts.at(0)

  const debtCovered = fixed(props.debtCovered, decimals)

  const currentDateSeconds = Date.now()
  const daysRemaining = oldestShort
    ? Math.round(
        (Number(oldestShort.maturity) - currentDateSeconds / 1000) /
          dayInSeconds
      )
    : undefined

  const shouldShowAddCoverageButton =
    debtCovered.gt(0n) && debtCovered.lt(FixedPoint.one(decimals))

  const averageFixedRate = useMemo(() => {
    const weightShortSum = props.shorts.reduce((prev, curr) => {
      return prev + fixed(curr.bondAmount, 18).mul(curr.rateQuote, 6).bigint
    }, 0n)

    const weightSum = props.shorts.reduce((prev, curr) => {
      return prev + curr.bondAmount
    }, 0n)

    if (weightSum === 0n) {
      return undefined
    }

    return fixed(weightShortSum, 18).div(weightSum, 18)
  }, [props.shorts, debtCovered])

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row justify-between space-y-0">
        <MarketHeader market={props.market} className="text-h4" />

        {shouldShowAddCoverageButton && (
          <Link href={`/borrow/${props.market.hyperdrive}`}>
            <Button>Convert More Debt</Button>
          </Link>
        )}
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-secondary-foreground">
              Total Fixed Debt
            </p>
            <p className="font-mono text-lg">
              {fixed(props.totalCoverage, decimals).format({
                decimals: 2,
                trailingZeros: false,
              })}{" "}
              {symbol}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-secondary-foreground">Debt Converted</p>
            <p className="font-mono text-lg">
              {fixed(props.debtCovered, decimals).format({
                percent: true,
                trailingZeros: false,
              })}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-secondary-foreground">
              Average Fixed Rate
            </p>
            <p className="font-mono text-lg">
              {averageFixedRate
                ? averageFixedRate.format({
                    decimals: 2,
                    percent: true,
                    trailingZeros: false,
                  })
                : "n/a"}
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-secondary-foreground">Next Expiry</p>
            <p className="font-mono text-lg">
              {daysRemaining
                ? daysRemaining < 0
                  ? "expired"
                  : `${daysRemaining} day${dayInSeconds === 1 ? "" : "s"}`
                : "n/a"}
            </p>
          </div>

          <Button
            variant="outline"
            onClick={() => setTableOpen((open) => !open)}
          >
            <p>Manage</p> {tableOpen ? <ChevronUp /> : <ChevronDown />}
          </Button>
        </div>

        <Collapsible open={tableOpen}>
          <CollapsibleContent>
            <Separator />

            <h6 className="p-4 font-chakra font-medium">
              Fix Rate Debt Positions
            </h6>
            <Table className="animate-fadeFast">
              <TableHeader className="[&_tr]:border-b-0">
                <TableRow className="hover:bg-card">
                  <TableHead className="font-normal text-secondary-foreground">
                    Date Opened
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

                  const isMatured = new Date() > maturity

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
                      <TableCell className="font-mono">
                        {fixed(short.rateQuote, 6).format({
                          percent: true,
                          decimals: 2,
                        })}
                      </TableCell>
                      <TableCell className="font-mono">
                        {maturity.toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        {isMatured ? (
                          <Button
                            className="ml-auto"
                            onClick={() => {
                              setSelectedOpenShort(short)
                              setCloseCoverageModalOpen(true)
                            }}
                          >
                            Close Position
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            className="ml-auto"
                            onClick={() => {
                              setSelectedOpenShort(short)
                              setCloseCoverageModalOpen(true)
                            }}
                          >
                            Close Coverage
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>

      {selectedOpenShort && (
        <CloseCoverageDialog
          open={closeCoverageModalOpen}
          onOpenChange={handleCloseCoverageModelOpen}
          market={props.market}
          short={selectedOpenShort}
        />
      )}
    </Card>
  )
}
