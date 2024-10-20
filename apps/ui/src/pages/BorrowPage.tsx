import { Button } from "components/base/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/base/card"
import { Skeleton } from "components/base/skeleton"
import { BorrowFlow } from "components/core/BorrowFlow"
import { cn } from "components/utils"
import { useBorrowPosition } from "hooks/borrow/useBorrowPosition"
import { useActivePosition } from "hooks/positions/useActivePosition"
import { Book, ChevronsLeft, ChevronsRight, MoveLeft } from "lucide-react"
import { useMemo, useState } from "react"
import { getAppConfig } from "utils/getAppConfig"
import { useChainId } from "wagmi"
import { Link, useParams } from "wouter"
import { navigate } from "wouter/use-browser-location"
import { SupportedChainId } from "~/constants"

export function BorrowPage() {
  const params = useParams()
  const chainId = useChainId()
  const appConfig = getAppConfig(chainId as SupportedChainId)
  const hyperdrive = params.hyperdrive

  const market = useMemo(
    () =>
      appConfig.morphoMarkets.find(
        (market) => market.hyperdrive === hyperdrive
      ),
    [appConfig]
  )

  const { data: activePosition } = useActivePosition(market)
  const { data: position } = useBorrowPosition(market)

  const [showSteps, setShowSteps] = useState(false)

  // Force push to the root page if a market is not found. Ideally this
  // should not happen, but can if the connected chain changes.
  if (!market) {
    // TODO show a toast
    navigate("/")
  }

  const queriesReady = market && position && activePosition

  return (
    <main className="relative z-10 my-2 flex flex-col gap-y-2 px-4">
      <div>
        <Link href="/" asChild>
          <Button
            variant="ghost"
            className="flex gap-2 text-primary hover:text-primary"
          >
            <MoveLeft size={16} /> Back
          </Button>
        </Link>
      </div>

      <div className="flex justify-center gap-2">
        {queriesReady ? (
          <BorrowFlow
            market={market}
            position={position}
            activePosition={activePosition}
          />
        ) : (
          <Skeleton className="m-auto h-[647px] w-[576px] max-w-xl bg-accent" />
        )}

        {showSteps ? (
          <Button variant="ghost" onClick={() => setShowSteps(false)}>
            <ChevronsLeft className="text-ice opacity-75" />
          </Button>
        ) : (
          <Button
            variant="ghost"
            onClick={() => setShowSteps(true)}
            className={cn({
              hidden: !queriesReady,
            })}
          >
            <span className="text-ice/75">Show Steps</span>{" "}
            <ChevronsRight className="text-ice opacity-75" />
          </Button>
        )}

        {showSteps && (
          <Card className="max-h-min max-w-sm">
            <CardHeader>
              <CardTitle>Steps</CardTitle>
            </CardHeader>

            <CardContent className="grid gap-8">
              <div className="flex gap-4">
                <p className="font-chakra text-ice">1</p>
                <p>
                  Enter the proportion of your current loan you want to receive
                  a fixed rate.
                </p>
              </div>

              <div className="flex gap-4">
                <p className="font-chakra text-ice">2</p>
                <p>
                  Pay a deposit for the fixed rate. You will receive this back.
                </p>
              </div>

              <div className="flex gap-4">
                <p className="font-chakra text-ice">3</p>
                <p>
                  Monitor your borrow position to ensure it’s healthy. Once the
                  fixed rate expires, use the proceeds to pay off any accrued
                  interest.
                </p>
              </div>

              <Button
                className="bg-primary/20 text-primary hover:bg-primary/40"
                asChild
              >
                <a
                  href="https://docs.hyperdrive.box"
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  Read the Docs <Book size={14} />
                </a>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </main>
  )
}
