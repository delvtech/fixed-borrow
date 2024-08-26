import { CollateralCard } from "components/position/CollateralCard"
import { DebtCard } from "components/position/DebtCard"
import { PositionCardSkeleton } from "components/position/PositionCardSkeleton"
import { getAppConfig } from "utils/getAppConfig"
import { useChainId } from "wagmi"
import { useParams } from "wouter"
import { SupportedChainId } from "~/constants"
import { useBorrowPosition } from "./BorrowPage"

export function PositionPage() {
  const params = useParams()
  const chainId = useChainId()
  const appConfig = getAppConfig(chainId as SupportedChainId)
  const hyperdrive = params.hyperdrive

  const { data: position } = useBorrowPosition(
    appConfig.morphoMarkets.find((market) => market.hyperdrive === hyperdrive)
  )

  if (!position) {
    return (
      <main className="my-8 flex flex-col gap-8 px-4 lg:px-28">
        <PositionCardSkeleton />
        <PositionCardSkeleton />
      </main>
    )
  }

  return (
    <main className="my-8 flex flex-col gap-8 px-4 lg:px-28">
      <DebtCard position={position} />
      <CollateralCard position={position} />
    </main>
  )
}
