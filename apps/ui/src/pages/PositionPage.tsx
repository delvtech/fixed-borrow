import { Skeleton } from "components/base/skeleton"
import { MarketPositionsCard } from "components/position/MarketPositionCard"
import { useAllPositions } from "hooks/positions/useAllPositions"
import { formatAddress } from "utils/base/formatAddress"
import { useAccount } from "wagmi"

export function PositionPage() {
  const { address } = useAccount()
  const { data: borrowPositions, isLoading: queryLoading } = useAllPositions()

  const loading = !borrowPositions && queryLoading

  const positions = borrowPositions
    ?.filter(Boolean)
    .sort((a, b) => (b.totalCoverage > a.totalCoverage ? 0 : -1))

  // const totalCoverage = borrowPositions?.reduce(
  //   (prev, curr) => prev + curr.totalCoverage,
  //   0n
  // )

  return (
    <main className="m-auto my-8 flex max-w-7xl flex-col gap-8 px-8 pb-8 lg:px-28">
      <h2 className="gradient-text w-fit font-chakra font-medium">
        My Positions
      </h2>

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
        <div className="space-y-1">
          <p className="text-secondary-foreground">Total Fixed Debt</p>
          <p className="font-mono text-h5">$170,000</p>
        </div>
      </div>

      {loading
        ? Array.from({ length: 3 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-[204px] w-full rounded-xl bg-popover"
            />
          ))
        : positions?.map((position) => (
            <MarketPositionsCard
              key={position.market.hyperdrive}
              market={position.market}
              totalCoverage={position.totalCoverage}
              debtCovered={position.debtCovered.bigint}
              shorts={position.shorts}
            />
          ))}
    </main>
  )
}
