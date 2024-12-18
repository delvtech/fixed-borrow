import { fixed } from "@delvtech/fixed-point-wasm"
import { Button } from "components/base/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/base/table"
import { MarketHeader } from "components/markets/MarketHeader"
import { useAppConfig } from "hooks/base/useAppConfig"
import { OrderObject } from "otc-api"
import { computeTargetRate } from "src/otc/utils"
import { useAccount } from "wagmi"
import { Link } from "wouter"

interface PendingOrdersTableProps {
  pendingOrders: OrderObject[]
  onCancelOrder: (order: OrderObject) => void
}

export function PendingOrdersTable({
  pendingOrders,
  onCancelOrder,
}: PendingOrdersTableProps) {
  const { address: account } = useAccount()
  const appConfig = useAppConfig()

  return (
    <div className="rounded-lg border">
      <Table className="w-full bg-[#0E1320]">
        <TableHeader className="rounded-tl-lg [&_tr]:border-b-0">
          <TableRow className="bg-[#0E1320] hover:bg-[#0E1320]">
            <TableHead className="font-normal text-secondary-foreground">
              Market
            </TableHead>
            <TableHead className="font-normal text-secondary-foreground">
              Type
            </TableHead>
            <TableHead className="font-normal text-secondary-foreground">
              Amount
            </TableHead>
            <TableHead className="font-normal text-secondary-foreground">
              Active Until
            </TableHead>
            <TableHead className="font-normal text-secondary-foreground">
              Target Rate
            </TableHead>
            <TableHead></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pendingOrders.map((order) => {
            const market = appConfig.morphoMarkets.find(
              (market) => market.hyperdrive === order.data.hyperdrive
            )

            if (!market) return null

            const decimals = market.loanToken.decimals
            const symbol = market.loanToken.symbol
            const targetRate = computeTargetRate(
              order.data.orderType,
              order.data.amount,
              order.data.slippageGuard
            )

            return (
              <TableRow
                key={order.data.signature}
                className="bg-[#0E1320] hover:bg-[#0E1320]"
              >
                <TableCell className="p-6 font-mono">
                  <MarketHeader market={market} className="text-h5" size={16} />
                </TableCell>

                <TableCell>
                  <span>{order.data.orderType === 0 ? "Long" : "Short"}</span>
                </TableCell>

                <TableCell className="font-mono">
                  {fixed(order.data.amount, decimals).format({
                    decimals: 2,
                    trailingZeros: false,
                  })}{" "}
                  {symbol}
                </TableCell>

                <TableCell className="font-mono">
                  {new Date(
                    Number(order.data.expiry) * 1000
                  ).toLocaleDateString()}
                </TableCell>

                <TableCell className="font-mono">
                  {fixed(targetRate, decimals).format({
                    decimals: 2,
                    percent: true,
                    trailingZeros: false,
                  })}
                </TableCell>

                <TableCell>
                  {account === order.data.trader ? (
                    <Button
                      className="ml-auto bg-[#1B1E26] text-red-400 hover:bg-[#1B1E26]/50"
                      onClick={() => onCancelOrder(order)}
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Link
                      href={`/otc/fill/${encodeURIComponent(order.key.slice(0, -5))}`}
                      asChild
                    >
                      <Button className="ml-auto">Fill order</Button>
                    </Link>
                  )}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
