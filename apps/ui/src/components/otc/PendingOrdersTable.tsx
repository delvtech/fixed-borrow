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
import { useCancelOrder } from "hooks/otc/useCancelOrder"
import { usePendingOrders } from "hooks/otc/usePendingOrders"
import { OrderObject } from "otc-api"
import { computeTargetRate } from "src/otc/utils"
import { useAccount } from "wagmi"
import { Link } from "wouter"

interface PendingOrdersTableProps {
  pendingOrders: OrderObject<"pending">[]
}

export function PendingOrdersTable({ pendingOrders }: PendingOrdersTableProps) {
  const { address: account } = useAccount()
  const appConfig = useAppConfig()

  const { refetch: refetchPendingOrders, status: pendingOrdersStatus } =
    usePendingOrders()

  const { mutate: cancelOrder, status: cancelOrderStatus } = useCancelOrder()

  const handleCancelOrder = async (order: OrderObject<"pending">) => {
    // await writeContractAsync({
    //   functionName: "cancelOrders",
    //   abi: HYPERDRIVE_MATCHING_ENGINE_ABI,
    //   address: HYPERDRIVE_MATCHING_ENGINE_ADDRESS,
    //   args: [
    //     [
    //       {
    //         trader: order.data.trader,
    //         hyperdrive: order.data.hyperdrive,
    //         orderType: order.data.orderType,
    //         amount: order.data.amount,
    //         expiry: BigInt(order.data.expiry),
    //         salt: order.data.salt,
    //         signature: order.data.signature!,
    //         options: order.data.options,
    //         minVaultSharePrice: order.data.minVaultSharePrice,
    //         slippageGuard: order.data.slippageGuard,
    //       },
    //     ],
    //   ],
    // })

    cancelOrder(order.key, {
      onSuccess: () => {
        refetchPendingOrders()
      },
    })
  }

  return (
    <div className="rounded-lg border">
      <Table className="w-full bg-[#0E1320]">
        <TableHeader className="[&_tr]:border-b-0">
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
                  {order.data.orderType === 0 ? "Long" : "Short"}
                </TableCell>

                <TableCell className="font-mono">
                  {fixed(order.data.amount, decimals).format({
                    decimals: 2,
                    trailingZeros: false,
                  })}{" "}
                  {symbol}
                </TableCell>

                <TableCell className="font-mono">
                  {new Date(order.data.expiry * 1000).toLocaleDateString()}
                </TableCell>

                <TableCell className="font-mono">
                  {fixed(targetRate, decimals).format({
                    decimals: 2,
                    percent: true,
                    trailingZeros: false,
                  })}
                </TableCell>

                <TableCell className="text-right">
                  {account === order.data.trader ? (
                    <Button
                      className="ml-auto bg-[#1B1E26] text-red-400 hover:bg-[#1B1E26]/50"
                      onClick={() => handleCancelOrder(order)}
                      disabled={
                        cancelOrderStatus === "pending" ||
                        pendingOrdersStatus === "pending"
                      }
                    >
                      Cancel
                    </Button>
                  ) : (
                    <Button
                      asChild
                      className="inline-flex"
                      disabled={
                        cancelOrderStatus === "pending" ||
                        pendingOrdersStatus === "pending"
                      }
                    >
                      <Link
                        href={`/otc/fill/${encodeURIComponent(order.key.replace(/\.\w+$/, ""))}`}
                      >
                        Fill order
                      </Link>
                    </Button>
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
