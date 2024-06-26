import { Badge } from "components/base/badge"
import { Skeleton } from "components/base/skeleton"
import { Tabs, TabsList, TabsTrigger } from "components/base/tabs"
import { BorrowFlow } from "components/core/BorrowFlow"
import { FAQ } from "components/core/FAQ"
import { AllMarketsTable } from "components/markets/AllMarketsTable"
import { BorrowPositionCard } from "components/position/BorrowPositionCard"
import { useAllBorrowPositions } from "hooks/markets/useAllBorrowPositions"
import { Check, CircleSlash } from "lucide-react"
import { useState } from "react"
import { match } from "ts-pattern"
import { useAccount } from "wagmi"
import { Market } from "../types"

export function HomePage() {
  const { address: account } = useAccount()

  const { data: borrowPositions, status: allBorrowPositionsQueryStatus } =
    useAllBorrowPositions(account)

  const [selectedMarket, setSelectedMarket] = useState<Market>()

  return (
    <main className="my-16 flex flex-col gap-y-24">
      <div className="flex flex-col gap-y-12">
        <div className="flex flex-col items-center gap-y-4">
          <h1 className="gradient-text font-chakra text-6xl">
            Fix Your Borrow
          </h1>

          <p className="text-center text-lg text-secondary-foreground">
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

        <Tabs
          defaultValue="uncovered-loans"
          className="flex flex-col items-center justify-center"
        >
          <TabsList className="grid h-24 w-1/2 grid-cols-2 border border-primary bg-transparent text-lg md:text-xl lg:w-1/3">
            <TabsTrigger
              className="data-[state=active]:gradient-background h-full text-wrap rounded-r-none text-xl data-[state=active]:text-primary-foreground"
              value="uncovered-loans"
            >
              Uncovered Loans
            </TabsTrigger>
            <TabsTrigger
              className="data-[state=active]:gradient-background h-full text-wrap rounded-l-none text-xl data-[state=active]:text-primary-foreground"
              value="covered-loans"
            >
              Covered Loans
            </TabsTrigger>
          </TabsList>
          {/* TODO: Add TabsContent components here ie. */}
          {/* <TabsContent value="uncovered-loans">Uncovered Loans</TabsContent> */}
        </Tabs>

        {selectedMarket ? (
          <BorrowFlow market={selectedMarket} />
        ) : (
          <div className="flex flex-col items-center gap-y-12 px-12">
            {match(allBorrowPositionsQueryStatus)
              .with("success", () => {
                return borrowPositions!.map((position) => (
                  <BorrowPositionCard
                    key={`${position.market.loanToken}${position.market.collateralToken}`}
                    onClick={() => setSelectedMarket(position.market)}
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
                    <div className="flex items-center gap-x-2 text-3xl font-bold">
                      Error <CircleSlash size={24} className="inline" />
                    </div>
                    <div>
                      Unable to load borrow positions. Please contact our
                      support service.
                    </div>
                  </div>
                )
              })
              .exhaustive()}
          </div>
        )}
      </div>

      <div className="flex flex-col items-center gap-y-4 px-12">
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
      <FAQ />
    </main>
  )
}
