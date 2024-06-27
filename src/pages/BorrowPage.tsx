import { BorrowFlow } from "components/core/BorrowFlow"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { useState } from "react"
import { getAppConfig } from "utils/getAppConfig"
import { useChainId, usePublicClient } from "wagmi"
import { useParams } from "wouter"
import { navigate } from "wouter/use-browser-location"
import { SupportedChainId } from "~/constants"
import { Market } from "../types"

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

  if (!market) {
    navigate("/")
  }

  const client = usePublicClient()

  if (client && market) {
    const reader = new MorphoMarketReader(client, chainId as SupportedChainId)

    console.log(reader.quoteRate(market))
  }

  return (
    <main className="my-16 flex flex-col gap-y-24">
      <div className="flex flex-col gap-y-12">
        {market && <BorrowFlow market={market} />}
      </div>

      {/* <div className="flex flex-col items-center gap-y-4 px-12">
        <img
          className="h-12 rounded bg-[#0F1117] p-2"
          src="logos/morpho-logo-dark.svg"
        />
        <div className="space-y-4 text-center">
          <h1 className="font-chakra text-4xl">
            Available Morpho Blue Markets
          </h1>
          <p className="text-secondary-foreground">
            Open a supported position on Morpho Blue and fix your rate in one
            transaction with Hyperdrive.
          </p>
        </div>

        <div className="w-full max-w-screen-lg">
          <AllMarketsTable />
        </div>
      </div>
      <FAQ /> */}
    </main>
  )
}
