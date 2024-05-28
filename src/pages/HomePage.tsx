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
    "0xecded8b1c603cf21299835f1dfbe37f10f2a29af"
  )

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
        {borrowPositions.map((position) => {
          return <BorrowPositionCard {...position} />
        })}
      </div>
    </main>
  )
}
