import { Button } from "components/base/button"
import { Skeleton } from "components/base/skeleton"
import { PendingOrdersTable } from "components/otc/PendingOrdersTable"
import { usePendingOrders } from "hooks/otc/usePendingOrders"
import { ArrowRight } from "lucide-react"
import { OrderKey, OrderObject, OtcClient } from "otc-api"
import {
  HYPERDRIVE_MATCHING_ENGINE_ABI,
  HYPERDRIVE_MATCHING_ENGINE_ADDRESS,
} from "src/otc/utils"
import { OTC_API_URL } from "utils/constants"
import { useWriteContract } from "wagmi"
import { Link } from "wouter"

function Orders() {
  const { writeContractAsync } = useWriteContract()

  const {
    data: pendingOrders,
    isLoading: isPendingOrdersLoading,
    refetch: refetchPendingOrders,
  } = usePendingOrders()

  const handleCancelOrder = async (order: OrderObject) => {
    await writeContractAsync({
      functionName: "cancelOrders",
      abi: HYPERDRIVE_MATCHING_ENGINE_ABI,
      address: HYPERDRIVE_MATCHING_ENGINE_ADDRESS,
      args: [
        [
          {
            trader: order.data.trader,
            hyperdrive: order.data.hyperdrive,
            orderType: order.data.orderType,
            amount: order.data.amount,
            expiry: BigInt(order.data.expiry),
            salt: order.data.salt,
            signature: order.data.signature!,
            options: order.data.options,
            minVaultSharePrice: order.data.minVaultSharePrice,
            slippageGuard: order.data.slippageGuard,
          },
        ],
      ],
    })

    const otcClient = new OtcClient(OTC_API_URL)
    await otcClient.cancelOrder(order.key as OrderKey<"pending">)

    await refetchPendingOrders()
  }

  const loading = isPendingOrdersLoading || !pendingOrders

  return (
    <div className="relative m-auto grid max-w-6xl gap-8 px-8">
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

        <Link href="/otc/new" asChild>
          <Button>
            New Order <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
      <div className="grid gap-4">
        <h2 className="font-chakra text-h4 text-white">Pending Orders</h2>

        {loading ? (
          <Skeleton className="h-96 w-full animate-fade" />
        ) : (
          <div className="rounded-lg border">
            <PendingOrdersTable
              pendingOrders={pendingOrders}
              onCancelOrder={handleCancelOrder}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export function OTCPage() {
  return <Orders />
}
