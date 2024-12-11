import { fixed } from "@delvtech/fixed-point-wasm"
import { useQuery } from "@tanstack/react-query"
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
import { SupportedChainId } from "dfb-config"
import { ArrowRight } from "lucide-react"
import { OtcClient } from "otc-api"
import { OTC_API_URL } from "utils/constants"
import { getAppConfig } from "utils/getAppConfig"
import { useAccount, useChainId } from "wagmi"
import { Link } from "wouter"

function usePendingOrders() {
  const chainId = useChainId()
  return useQuery({
    queryKey: ["pendingOrders", chainId],
    queryFn: async () => {
      const otcClient = new OtcClient(OTC_API_URL)

      const response = await otcClient.getOrders()

      if ("error" in response) {
        throw new Error(response.error)
      } else {
        const orders = response.orders
        return orders.filter((order) => order.key.includes("pending"))
      }
    },
  })
}

function Orders() {
  const { address: account } = useAccount()
  const chainId = useChainId()
  const appConfig = getAppConfig(chainId as SupportedChainId)
  const { data: pendingOrders } = usePendingOrders()

  return (
    <div className="relative m-auto flex max-w-6xl flex-col gap-8 px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="max-w-lg space-y-2">
          <h1 className="font-chakra text-h3 font-medium text-primary">
            Hyperdrive OTC
          </h1>

          <p className="text-secondary-foreground">
            Hyperdrive OTC enables you to view and create over-the-counter
            orders for Hyperdrive markets.
          </p>
        </div>
        <Link href="/otc/new">
          <Button>
            New Order <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-chakra text-h4 text-white">Pending Orders</h2>
        </div>
        <div className="rounded-lg border">
          <Table className="w-full animate-fade bg-[#0E1320]">
            <TableHeader className="rounded-tl-lg [&_tr]:border-b-0">
              <TableRow className="bg-[#0E1320] hover:bg-[#0E1320]">
                <TableHead className="font-normal text-secondary-foreground">
                  Market
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
              {pendingOrders?.map((intent) => {
                const market = appConfig.morphoMarkets.find(
                  (market) => market.hyperdrive === intent.order.hyperdrive
                )

                if (!market) return null
                const decimals = market.loanToken.decimals
                const symbol = market.loanToken.symbol

                return (
                  <TableRow
                    key={intent.order.signature}
                    className="bg-[#0E1320] hover:bg-[#0E1320]"
                  >
                    <TableCell className="p-6 font-mono">
                      <MarketHeader
                        market={market}
                        className="text-h5"
                        size={16}
                      />
                    </TableCell>
                    <TableCell className="font-mono">
                      {fixed(intent.order.amount, decimals).format({
                        decimals: 2,
                        trailingZeros: false,
                      })}{" "}
                      {symbol}
                    </TableCell>
                    <TableCell className="font-mono">
                      {new Date(
                        Number(intent.order.expiry) * 1000
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono">
                      {fixed(intent.order.slippageGuard, decimals).format({
                        decimals: 2,
                        percent: true,
                        trailingZeros: false,
                      })}
                    </TableCell>

                    <TableCell>
                      {account === intent.order.trader ? (
                        <Button
                          className="ml-auto bg-[#1B1E26] text-red-400 hover:bg-[#1B1E26]/50"
                          onClick={() => {}}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Button className="ml-auto" onClick={() => {}}>
                          Fill order
                        </Button>
                      )}
                    </TableCell>

                    {/* <TableCell>
              {isMatured ? (
                <Button
                  className="ml-auto"
                  onClick={() => {
                    // setSelectedOpenShort(short)
                    // setCloseCoverageModalOpen(true)
                  }}
                >
                  Close Position
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="ml-auto"
                  onClick={() => {
                    // setSelectedOpenShort(short)
                    // setCloseCoverageModalOpen(true)
                  }}
                >
                  Revert to Variable
                </Button>
              )}
            </TableCell> */}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>{" "}
        </div>
      </div>
    </div>
  )
}

export function OTCPage() {
  return <Orders />
}
