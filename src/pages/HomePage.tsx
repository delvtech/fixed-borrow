import { useQuery } from "@tanstack/react-query"
import { BorrowPositionCard } from "components/Positions/BorrowPositionCard"
import { Badge } from "components/ui/badge"
import { Skeleton } from "components/ui/skeleton"
import { MorphoMarketReader } from "lib/markets/MarketsReader"
import { Check, CircleSlash } from "lucide-react"
import { match } from "ts-pattern"
import { Address } from "viem"
import { useAccount, useChainId, usePublicClient } from "wagmi"

function useAllBorrowPositions(account?: Address) {
  const chainId = useChainId()
  const client = usePublicClient()
  return useQuery({
    queryKey: ["all-borrow-positions", account],
    queryFn: async () => {
      return await MorphoMarketReader.getBorrowPositions(
        client!,
        account!,
        chainId
      )
    },
    enabled: !!account && !!client,
  })
}

export function HomePage() {
  const { address: account } = useAccount()

  const { data: borrowPositions, status: allBorrowPositionsQueryStatus } =
    useAllBorrowPositions(account)

  return (
    <main className="my-16 flex flex-col gap-y-12">
      <div className="flex flex-col items-center gap-y-4">
        <h1 className="text-2xl font-bold">Fix Your Borrow</h1>
        <span className="text-sm text-gray-500">
          Keep all the best parts of your Borrow position, but have peace of
          mind with a predictable interest rate.
        </span>

        <div>
          <Badge className="text-xs" variant="secondary">
            <Check size={16} className="mr-1" /> Protect against high future
            rates
          </Badge>

          <Badge className="text-xs" variant="secondary">
            <Check size={16} className="mr-1" /> Core position remains unchanged
          </Badge>

          <Badge className="text-xs" variant="secondary">
            <Check size={16} className="mr-1" /> Keep using automations or other
            tools
          </Badge>
        </div>
      </div>
      <div className="flex flex-col gap-y-12 items-center">
        {match(allBorrowPositionsQueryStatus)
          .with("success", () => {
            return borrowPositions!.map((position) => (
              <BorrowPositionCard {...position} />
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
    </main>
  )
}
