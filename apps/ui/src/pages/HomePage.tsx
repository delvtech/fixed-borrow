import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Skeleton } from "components/base/skeleton"
import { AllMarketsTable } from "components/markets/AllMarketsTable"
import { BorrowPositionCard } from "components/position/BorrowPositionCard"
import { useAllBorrowPositions } from "hooks/markets/useAllBorrowPositions"
import { Check, CircleSlash, MoveUpRight } from "lucide-react"
import { delvChain } from "src/client/rainbowClient"
import { match } from "ts-pattern"
import { getAppConfig } from "utils/getAppConfig"
import { useTestPosition } from "utils/test/createTestPosition"
import { useAccount, useChainId } from "wagmi"
import { SupportedChainId } from "~/constants"

export function HomePage() {
  const { address: account, isConnected } = useAccount()
  const chainId = useChainId()

  const { data: borrowPositions, status: allBorrowPositionsQueryStatus } =
    useAllBorrowPositions(account)

  const { mutate: createTestPosition } = useTestPosition()

  const config = getAppConfig(chainId as SupportedChainId)

  console.log(borrowPositions)

  return (
    <main className="m-auto flex max-w-4xl flex-col gap-y-36 px-4 py-8">
      <div className="m-auto max-w-[766px] space-y-24">
        <div className="flex flex-col items-center gap-4">
          <h1 className="font-chakra text-h2 font-medium text-primary md:text-h1">
            FIX YOUR BORROW
          </h1>

          <p className="max-w-xl text-center text-lg font-light text-foreground/90">
            Keep all the best parts of your borrow position while gaining peace
            of mind with a predictable interest rate.
          </p>

          <div className="flex w-full justify-between gap-2">
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
              if (!borrowPositions || borrowPositions.length === 0) {
                return (
                  <div className="space-y-6 text-center">
                    <h3 className="font-chakra font-light">
                      You don’t have any borrow positions
                    </h3>
                    <p className="text-secondary-foreground">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                      Pellentesque vestibulum, turpis a vehicula condimentum,
                      magna ipsum aliquet nisi, ac consectetur odio urna nec
                      risus.
                    </p>

                    <div className="flex justify-center gap-6">
                      {chainId === delvChain.id ? (
                        <Button
                          className="gap-2 bg-[#2E4DFF] font-light text-foreground hover:bg-[#2E4DFF]/90"
                          onClick={() => createTestPosition()}
                        >
                          <img
                            src="/logos/Morpho-logo-symbol-darkmode.svg"
                            alt="Morpho logo"
                            className="size-3"
                          />
                          Open a Demo Position
                        </Button>
                      ) : (
                        <Button
                          className="gap-2 bg-[#2E4DFF] font-light text-foreground hover:bg-[#2E4DFF]/90"
                          asChild
                        >
                          <a
                            href="https://app.morpho.org"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <img
                              src="/logos/Morpho-logo-symbol-darkmode.svg"
                              alt="Morpho logo"
                              className="size-3"
                            />
                            Open Position on Morpho Blue{" "}
                            <MoveUpRight size={14} />
                          </a>
                        </Button>
                      )}

                      {/* <Button variant="secondary">
                        Learn How Fixed Borrow Works
                      </Button> */}
                    </div>
                  </div>
                )
              }

              return borrowPositions.map((position) => (
                <BorrowPositionCard
                  key={position.market.hyperdrive}
                  {...position}
                />
              ))
            })
            .with("pending", () => {
              if (isConnected) {
                return Array.from({ length: 2 }, (_, index) => (
                  <Skeleton
                    key={index}
                    className="h-[290px] w-full rounded-xl bg-popover"
                  />
                ))
              }

              return (
                <div className="space-y-6 text-center">
                  <h3 className="font-chakra font-light">
                    Connect wallet to view your positions
                  </h3>

                  <div className="flex justify-center gap-6">
                    <ConnectButton />
                  </div>
                </div>
              )
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
          <h1 className="font-chakra text-h3">Available Morpho Markets</h1>

          <p className="text-secondary-foreground">
            Open a supported position on Morpho Blue and fix your rate in one
            transaction with Hyperdrive.
          </p>
        </div>

        <div className="w-full max-w-screen-lg">
          <AllMarketsTable />
        </div>
      </div>
    </main>
  )
}
