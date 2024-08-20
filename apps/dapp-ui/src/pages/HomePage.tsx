import { Badge } from "components/base/badge"
import { Skeleton } from "components/base/skeleton"
import { FAQ } from "components/core/FAQ"
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
    <main className="m-auto flex max-w-3xl flex-col gap-y-24 py-8">
      <div className="m-auto w-[766px] space-y-24">
        <div className="flex flex-col items-center gap-4">
          <h1 className="gradient-text font-chakra">Fix your borrow</h1>

          <p className="max-w-xl text-center font-light text-secondary-foreground">
            Keep all the best parts of your Borrow position while gaining peace
            of mind with a predictable interest rate.
          </p>

          <div className="flex w-full justify-between">
            <Badge className="font-light">
              <Check size={16} className="mr-1 stroke-primary" /> Protect
              against high future rates
            </Badge>

            <Badge className="font-light">
              <Check size={16} className="mr-1 stroke-primary" /> Core position
              remains unchanged
            </Badge>

            <Badge className="font-light">
              <Check size={16} className="mr-1 stroke-primary" />
              Automations remain unaffected
            </Badge>
          </div>
        </div>

        <div className="flex flex-col items-center gap-y-12">
          {match(allBorrowPositionsQueryStatus)
            .with("success", () => {
              return borrowPositions!.map((position) => (
                <BorrowPositionCard
                  key={`${position.market.loanToken}${position.market.collateralToken}`}
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
                  <div className="text-3xl flex items-center gap-x-2 font-bold">
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
        <img
          className="size-12 rounded p-2"
          src="logos/morpho-logo-dark.svg"
          alt="Morpho logo"
        />

        <div className="space-y-4 text-center">
          <h2 className="text-4xl font-chakra">Available Morpho Markets</h2>

          <p className="text-secondary-foreground">
            Open a supported position on Morpho Blue and fix your rate in one
            transaction with Hyperdrive.
          </p>
        </div>

        <div className="w-full max-w-screen-lg">
          <AllMarketsTable />
        </div>
      </div>

      <FAQ />
    </main>
  )
}
