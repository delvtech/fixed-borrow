import { Button } from "components/base/button"
import { Skeleton } from "components/base/skeleton"
import { BorrowFlow } from "components/core/BorrowFlow"
import { useBorrowPosition } from "hooks/borrow/useBorrowPosition"
import { useActivePosition } from "hooks/positions/useActivePosition"
import { MoveLeft } from "lucide-react"
import { useMemo } from "react"
import { getAppConfig } from "utils/getAppConfig"
import { useChainId } from "wagmi"
import { Link, useParams } from "wouter"
import { navigate } from "wouter/use-browser-location"
import { SupportedChainId } from "~/constants"

export function BorrowPage() {
  const params = useParams()
  const chainId = useChainId()
  const appConfig = getAppConfig(chainId as SupportedChainId)
  const hyperdrive = params.hyperdrive

  const market = useMemo(
    () =>
      appConfig.morphoMarkets.find(
        (market) => market.hyperdrive === hyperdrive
      ),
    [appConfig]
  )

  const { data: activePosition } = useActivePosition(market)
  const { data: position } = useBorrowPosition(market)

  // Force push to the root page if a market is not found. Ideally this
  // should not happen, but can if the connected chain changes.
  if (!market) {
    // TODO show a toast
    navigate("/")
  }

  return (
    <main className="my-8 flex flex-col gap-y-12 px-4">
      <div>
        <Link href="/" asChild>
          <Button
            variant="ghost"
            className="flex gap-2 text-primary hover:text-primary"
          >
            <MoveLeft size={16} /> Back
          </Button>
        </Link>
      </div>

      {market && position && activePosition ? (
        <BorrowFlow
          market={market}
          position={position}
          activePosition={activePosition}
        />
      ) : (
        <Skeleton className="m-auto h-[647px] w-full max-w-xl bg-accent" />
      )}
    </main>
  )
}
