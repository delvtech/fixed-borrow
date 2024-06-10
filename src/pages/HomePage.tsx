import { useQuery } from "@tanstack/react-query"
import { Badge } from "components/base/badge"
import { Skeleton } from "components/base/skeleton"
import { AllMarketsTable } from "components/markets/AllMarketsTable"
import { BorrowPositionCard } from "components/position/BorrowPositionCard"
import { MorphoMarketReader } from "lib/markets/MarketsReader"
import { Check, CircleSlash } from "lucide-react"
import { match } from "ts-pattern"
import { Address } from "viem"
import { useAccount, useChainId, usePublicClient } from "wagmi"
import { SupportedChainId } from "../constants"

function useAllBorrowPositions(account?: Address) {
  const chainId = useChainId()
  const client = usePublicClient()
  return useQuery({
    queryKey: ["all-borrow-positions", account, chainId],
    queryFn: async () => {
      const reader = new MorphoMarketReader(
        client!,
        chainId as SupportedChainId
      )
      return await reader.getBorrowPositions(account!)
    },
    enabled: !!account && !!client,
  })
}

export function HomePage() {
  const { address: account } = useAccount()

  const { data: borrowPositions, status: allBorrowPositionsQueryStatus } =
    useAllBorrowPositions(account)

  return (
    <main className="my-16 flex flex-col gap-y-24">
      <div className="flex gap-y-12 flex-col">
        <div className="flex flex-col items-center gap-y-4">
          <h1 className="text-6xl text-primary font-chakra">Fix Your Borrow</h1>
          <span className="text-lg text-secondary-foreground text-center">
            Keep all the best parts of your Borrow position, but have peace of{" "}
            <br />
            mind with a predictable interest rate.
          </span>

          <div className="flex gap-x-2">
            <Badge className="text-xs" variant="secondary">
              <Check size={16} className="mr-1" /> Protect against high future
              rates
            </Badge>

            <Badge className="text-xs" variant="secondary">
              <Check size={16} className="mr-1" /> Core position remains
              unchanged
            </Badge>

            <Badge className="text-xs" variant="secondary">
              <Check size={16} className="mr-1" /> Keep using automations or
              other tools
            </Badge>
          </div>
        </div>
        <div className="flex flex-col gap-y-12 items-center">
          {match(allBorrowPositionsQueryStatus)
            .with("success", () => {
              return borrowPositions!.map((position) => (
                <BorrowPositionCard
                  key={`${position.loanToken}${position.collateralToken}`}
                  {...position}
                />
              ))
            })
            .with("pending", () => {
              return Array.from({ length: 5 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="h-[224px] w-[1200px] rounded-xl"
                />
              ))
            })
            .with("error", () => {
              return (
                <div className="flex flex-col items-center">
                  <div className="text-3xl font-bold flex items-center gap-x-2">
                    Error <CircleSlash size={24} className="inline" />
                  </div>
                  <div>
                    Unable to load borrow positions. Please contact our support
                    service.
                  </div>
                </div>
              )
            })
            .exhaustive()}
        </div>
      </div>

      <div className="flex flex-col items-center gap-y-4">
        <div className="flex flex-col items-center gap-y-4">
          <h1 className="text-4xl font-chakra">
            Available Morpho Blue Markets
          </h1>
          <span className="text-secondary-foreground">
            Open a supported position on Morpho Blue and fix your rate in one
            transaction with Hyperdrive.
          </span>
        </div>
        <div className="flex flex-col gap-y-12 items-center">
          <AllMarketsTable />
        </div>
      </div>
    </main>
  )
}
