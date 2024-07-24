import { DebtCard } from "components/position/DebtCard"
import { useState } from "react"
import { getAppConfig } from "utils/getAppConfig"
import { useChainId } from "wagmi"
import { useParams } from "wouter"
import { SupportedChainId } from "~/constants"
import { Market } from "../types"

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

  return (
    <main className="my-8 flex flex-col gap-8 px-28">
      <DebtCard market={market} />
      {/* <CollateralCard market={market} position={position} /> */}
    </main>
  )
}
