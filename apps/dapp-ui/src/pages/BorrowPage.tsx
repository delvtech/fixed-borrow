import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "components/base/skeleton"
import { BorrowFlow } from "components/core/BorrowFlow"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { useState } from "react"
import { getAppConfig } from "utils/getAppConfig"
import { useAccount, useChainId, usePublicClient } from "wagmi"
import { useParams } from "wouter"
import { navigate } from "wouter/use-browser-location"
import { SupportedChainId } from "~/constants"
import { Market } from "../types"

export function useBorrowPosition(market?: Market) {
  const { address: account } = useAccount()
  const chainId = useChainId()
  const client = usePublicClient()

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

  if (!market) {
    navigate("/")
  }

  return (
    <main className="my-16 flex flex-col gap-y-24">
      <div className="flex flex-col gap-y-12">
        {market && position ? (
          <BorrowFlow market={market} position={position} />
        ) : (
          <div className="m-auto w-full max-w-xl space-y-8">
            <Skeleton className="m-auto h-[70px] w-full max-w-xl bg-accent" />{" "}
            <Skeleton className="m-auto h-[570px] w-full max-w-xl bg-accent" />
          </div>
        )}
      </div>
    </main>
  )
}
