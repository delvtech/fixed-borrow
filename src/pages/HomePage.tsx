import { Badge } from "components/base/badge"
import { Skeleton } from "components/base/skeleton"
import { AllMarketsTable } from "components/markets/AllMarketsTable"
import { BorrowPositionCard } from "components/position/BorrowPositionCard"
import { useAllBorrowPositions } from "hooks/markets/useAllBorrowPositions"
import { Check, CircleSlash } from "lucide-react"
import { match } from "ts-pattern"
import { useAccount } from "wagmi"

export function HomePage() {
  const { address: account } = useAccount()

  const { data: borrowPositions, status: allBorrowPositionsQueryStatus } =
    useAllBorrowPositions(account)

  return (
    <main className="my-16 flex flex-col gap-y-24">
      <div className="flex gap-y-12 flex-col">
        <div className="flex flex-col items-center gap-y-4">
          <h1 className="text-6xl font-chakra gradient-text">
            Fix Your Borrow
          </h1>

          <p className="text-lg text-secondary-foreground text-center">
            Keep all the best parts of your Borrow position, but have peace of{" "}
            <br />
            mind with a predictable interest rate.
          </p>

          <div className="flex gap-x-2">
            <Badge className="text-xs">
              <Check size={16} className="mr-1 stroke-primary" /> Protect
              against high future rates
            </Badge>

            <Badge className="text-xs">
              <Check size={16} className="mr-1 stroke-primary" /> Core position
              remains unchanged
            </Badge>

            <Badge className="text-xs">
              <Check size={16} className="mr-1 stroke-primary" /> Keep using
              automations or other tools
            </Badge>
          </div>
        </div>

        <div className="flex flex-col gap-y-12 items-center px-12">
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
              return Array.from({ length: 2 }, (_, index) => (
                <Skeleton
                  key={index}
                  className="h-[396px] w-full max-w-screen-lg rounded-lg"
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

      <div className="flex flex-col items-center gap-y-4 px-12">
        <img
          className="h-12 bg-[#0F1117] p-2 rounded"
          src="logos/morpho-logo-dark.svg"
        />
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-chakra">
            Available Morpho Blue Markets
          </h1>
          <p className="text-secondary-foreground">
            Open a supported position on Morpho Blue and fix your rate in one
            transaction with Hyperdrive.
          </p>
        </div>

        <AllMarketsTable />
      </div>
    </main>
  )
}
