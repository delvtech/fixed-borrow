import { CollateralCard } from "components/position/CollateralCard"
import { DebtCard } from "components/position/DebtCard"
import { useState } from "react"
import { getAppConfig } from "utils/getAppConfig"
import { useChainId } from "wagmi"
import { useParams } from "wouter"
import { SupportedChainId } from "~/constants"
import { Market } from "../types"
import { useBorrowPosition } from "./BorrowPage"

export function PositionPage() {
  const params = useParams()
  const chainId = useChainId()
  const appConfig = getAppConfig(chainId as SupportedChainId)
  const hyperdrive = params.hyperdrive

  const [market] = useState<Market | undefined>(() => {
    return appConfig.morphoMarkets.find(
      (market) => market.hyperdrive === hyperdrive
    )
  })
  const { data: position, status: positionStatus } = useBorrowPosition(market)

  return (
    <main className="my-8 flex flex-col gap-8 px-28">
      <DebtCard
        position={position}
        positionStatus={positionStatus}
        market={market}
      />
      <CollateralCard
        position={position}
        positionStatus={positionStatus}
        market={market}
      />
    </main>
  )
}
