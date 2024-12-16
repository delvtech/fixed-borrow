import { Button } from "components/base/button"
import { Skeleton } from "components/base/skeleton"
import { PendingOrdersTable } from "components/otc/PendingOrdersTable"
import { usePendingOrders } from "hooks/otc/usePendingOrders"
import { ArrowRight } from "lucide-react"
import { Link } from "wouter"

function Orders() {
  const { data: pendingOrders, isLoading: isPendingOrdersLoading } =
    usePendingOrders()

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

        <Button asChild>
          <Link href="/otc/new">
            New Order <ArrowRight size={14} />
          </Link>
        </Button>
      </div>
      <div className="grid gap-4">
        <h2 className="font-chakra text-h4 text-white">Pending Orders</h2>

        {loading ? (
          <Skeleton className="h-96 w-full animate-fade" />
        ) : (
          <div className="rounded-lg border">
            <PendingOrdersTable pendingOrders={pendingOrders} />
          </div>
        )}
      </div>
    </div>
  )
}

export function OTCPage() {
  return <Orders />
}
