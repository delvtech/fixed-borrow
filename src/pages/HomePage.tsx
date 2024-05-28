import { useQuery } from "@tanstack/react-query"
import { BorrowPositionCard } from "components/Positions/BorrowPositionCard"
import { Badge } from "components/ui/badge"
import { MorphoMarketReader } from "lib/markets/MarketsReader"
import { Check } from "lucide-react"
import { Address } from "viem"

function useAllBorrowPositions(account?: Address) {
  return useQuery({
    queryKey: ["all-borrow-positions", account],
    queryFn: async () => {
      return await MorphoMarketReader.getBorrowPositions(account!)
    },
    enabled: !!account,
  })
}

export function HomePage() {
  const { data: borrowPositions = [] } = useAllBorrowPositions(
    "0x9e990c8dc9768f959b5abf7910f5fd3b965ccf24"
  )

  return (
    <main className="h-min-screen mt-16 flex flex-col gap-y-12">
      <div>
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
              <Check size={16} className="mr-1" /> Core position remains
              unchanged
            </Badge>

            <Badge className="text-xs" variant="secondary">
              <Check size={16} className="mr-1" /> Keep using automations or
              other tools
            </Badge>
          </div>
        </div>
      </div>
      <div className="flex flex-col gap-y-12 items-center">
        {borrowPositions.map((position) => {
          return <BorrowPositionCard {...position} />
        })}
      </div>
    </main>
  )
}
