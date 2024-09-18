import { Button } from "components/base/button"
import { Card, CardContent } from "components/base/card"
import { Skeleton } from "components/base/skeleton"
import { MarketPositionsCard } from "components/position/MarketPositionCard"
import { useAllPositions } from "hooks/positions/useAllPositions"
import { formatAddress } from "utils/base/formatAddress"
import { useAccount } from "wagmi"
import { Link } from "wouter"

import { useHashLocation } from "wouter/use-hash-location"

export function PositionPage() {
  const [hyperdriveHash] = useHashLocation()

  const { address } = useAccount()
  const { data: borrowPositions, isLoading: queryLoading } = useAllPositions()

  const loading = !borrowPositions && queryLoading

  const positions = borrowPositions
    ?.filter(Boolean)
    .filter((position) => position.totalCoverage > 0n)
    .sort((a, b) => (b.totalCoverage > a.totalCoverage ? 0 : -1))

  console.log(positions)

  // const totalCoverage = borrowPositions?.reduce(
  //   (prev, curr) => prev + curr.totalCoverage,
  //   0n
  // )

  return (
    <main className="relative m-auto my-8 flex max-w-6xl flex-col gap-8 px-8 pb-8 lg:px-28">
      <h1 className="gradient-text w-fit font-chakra text-h3">My Positions</h1>

      <div className="flex gap-12">
        <div className="space-y-1">
          <p className="text-secondary-foreground">Account</p>
          {address ? (
            <p className="font-mono text-h5">{formatAddress(address)}</p>
          ) : (
            <Skeleton className="h-[28px] w-[132px] rounded-xl bg-popover" />
          )}
        </div>

        {/* TODO */}
        {/* <div className="space-y-1">
          <p className="text-secondary-foreground">Total Fixed Debt</p>
          <p className="font-mono text-h5">$170,000</p>
        </div> */}
      </div>

      {loading ? (
        Array.from({ length: 3 }, (_, index) => (
          <Skeleton
            key={index}
            className="h-[204px] w-full rounded-xl bg-popover"
          />
        ))
      ) : positions && positions.length > 0 ? (
        positions.map((position) => (
          <div id={position.market.hyperdrive} key={position.market.hyperdrive}>
            <MarketPositionsCard
              market={position.market}
              totalCoverage={position.totalCoverage}
              debtCovered={position.debtCovered.bigint}
              shorts={position.shorts}
              startOpened={
                hyperdriveHash.slice(1) === position.market.hyperdrive
              }
            />
          </div>
        ))
      ) : (
        <Card className="h-[204px] w-full border-primary/50">
          <CardContent className="space-y-4 pt-4 text-center">
            <p className="text-h5 font-light">No active positions</p>

            <Link href="/" className="block">
              <Button className="m-auto" variant="gradient">
                Create Position
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </main>
  )
}
