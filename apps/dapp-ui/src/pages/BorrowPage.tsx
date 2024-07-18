import { useQuery } from "@tanstack/react-query"
import { BorrowFlow } from "components/core/BorrowFlow"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { useState } from "react"
import { getAppConfig } from "utils/getAppConfig"
import { useChainId, usePublicClient } from "wagmi"
import { useParams } from "wouter"
import { navigate } from "wouter/use-browser-location"
import { SupportedChainId } from "~/constants"
import { Market } from "../types"

export function useBorrowPosition(market?: Market) {
  // const { address: account } = useAccount()
  const chainId = useChainId()
  const client = usePublicClient()
  const account = "0x042CAb2Ea353fC48C9491bDbF10a12Cfe9072B6C"
  return useQuery({
    queryKey: ["borrow-position", account],
    queryFn: async () => {
      const reader = new MorphoMarketReader(
        client!,
        chainId as SupportedChainId
      )

      return reader.getBorrowPosition(account!, market!)
    },
    enabled: !!client && !!account && !!market,
  })
}

export function BorrowPage() {
  const params = useParams()
  const chainId = useChainId()
  const appConfig = getAppConfig(chainId as SupportedChainId)

  const hyperdrive = params.hyperdrive

  const [market] = useState<Market | undefined>(() => {
    return appConfig.morphoMarkets.find(
      (market) => market.hyperdrive === hyperdrive
    )
  })

  const { data: position } = useBorrowPosition(market)
  console.log(position, "position")
  if (!market) {
    navigate("/")
  }

  return (
    <main className="my-16 flex flex-col gap-y-24">
      <div className="flex flex-col gap-y-12">
        {market && position && (
          <BorrowFlow market={market} position={position} />
        )}
      </div>
    </main>
  )
}
