import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/base/select"
import { Skeleton } from "components/base/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "components/base/tabs"
import { AllMarketsTable } from "components/markets/AllMarketsTable"
import { ActivePositionCard } from "components/position/ActivePositionCard"
import { BorrowPositionCard } from "components/position/BorrowPositionCard"
import { useAllBorrowPositions } from "hooks/markets/useAllBorrowPositions"
import { useActivePositions } from "hooks/positions/useActivePositions"
import { ArrowDown, Check, CircleSlash } from "lucide-react"
import { useMemo, useState } from "react"
import { MorphoLogo } from "static/images/MorphoLogo"
import { match } from "ts-pattern"
import { useAccount } from "wagmi"

type Protocol = ["Morpho"][number]
type SortingKey = ["Loan Size", "Fixed Rate"][number]

type View = "new" | "active"

export function HomePage() {
  const { address: account, isConnected } = useAccount()

  const [view, setView] = useState<View>("new")

  const { data: borrowPositions, status: allBorrowPositionsQueryStatus } =
    useAllBorrowPositions(account)

  const { data: activePositions } = useActivePositions({
    enabled: view === "active",
  })

  const noPositions = borrowPositions && borrowPositions.length === 0

  const [sorting] = useState<SortingKey>("Loan Size")
  const [protocolFilter] = useState<Protocol | undefined>(undefined)

  const newPositons = useMemo(() => {
    // TODO implement protocol filtering
    const filteredPositions = borrowPositions

    const sortedPositions = filteredPositions?.sort((a, b) => {
      switch (sorting) {
        case "Loan Size":
          return a.totalDebt > b.totalDebt ? 1 : 0
        case "Fixed Rate":
          return a.fixedRate > b.fixedRate ? 1 : 0
      }
    })

    return match(allBorrowPositionsQueryStatus)
      .with("success", () => {
        return sortedPositions?.map((position) => (
          <BorrowPositionCard key={position.market.hyperdrive} {...position} />
        ))
      })
      .with("pending", () => {
        if (isConnected) {
          return Array.from({ length: 2 }, (_, index) => (
            <Skeleton
              key={index}
              className="h-[266px] w-full rounded-xl bg-popover"
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
      .exhaustive()
  }, [borrowPositions, allBorrowPositionsQueryStatus, sorting, protocolFilter])

  return (
    <main className="relative m-auto flex max-w-3xl animate-fadeFast flex-col gap-y-12 p-4 sm:gap-y-20">
      <div className="m-auto max-w-3xl space-y-16">
        <div className="grid animate-fade justify-items-center gap-4">
          <svg
            className="size-10 sm:size-12"
            viewBox="0 0 224 213"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="fill-primary"
              d="M87.6376 154.782L140.287 72.2258C142.726 68.3801 146.988 66.0502 151.529 66.0502C158.903 66.0502 164.874 72.0293 164.874 79.4118V213L212.618 193.435C219.514 190.6 224 183.891 224 176.452V79.8049C224 69.6714 215.786 61.4467 205.665 61.4467H151.529C145.39 61.4467 139.671 64.5906 136.362 69.7555L83.7127 152.311C81.2736 156.157 77.0123 158.487 72.4706 158.487C65.0974 158.487 59.1259 152.508 59.1259 145.125V0L11.3822 19.5652C4.4856 22.4004 0 29.1093 0 36.548V144.732C0 154.866 8.21429 163.09 18.3349 163.09H72.4706C78.6103 163.09 84.3294 159.947 87.6376 154.782Z"
            />
          </svg>

          <h1 className="text-center font-chakra text-h3 font-medium text-primary sm:text-h2">
            Fix Your Borrow Rate. Anytime.
          </h1>

          <p className="text-center text-md font-light text-secondary-foreground sm:text-lg">
            Gain peace of mind with a predictable interest rate.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2">
            <Badge className="hidden bg-secondary text-xs font-light sm:flex sm:text-sm">
              <Check size={16} className="mr-1 stroke-aquamarine" /> Protect
              against high future rates
            </Badge>

            <Badge className="hidden bg-secondary text-xs font-light sm:flex sm:text-sm">
              <Check size={16} className="mr-1 stroke-aquamarine" /> Revert to
              variable at any time
            </Badge>

            <Badge className="hidden bg-secondary text-xs font-light sm:flex sm:text-sm">
              <Check size={16} className="mr-1 stroke-aquamarine" />
              Automations remain unaffected
            </Badge>
          </div>
        </div>
      </div>

      {noPositions ? (
        <div className="space-y-6 text-center">
          <h3 className="font-chakra text-h4 font-light">
            You don’t have any supported borrow positions on Morpho
          </h3>

          <div className="flex justify-center gap-6">
            <Button
              className="gap-2 bg-[#2E4DFF]/75 font-light text-foreground hover:bg-[#2E4DFF]"
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
                Explore supported markets below <ArrowDown size={14} />
              </a>
            </Button>
          </div>
        </div>
      ) : (
        <Tabs
          value={view}
          onValueChange={(value) => setView(value as View)}
          defaultValue="new"
          className="grid justify-items-center gap-2"
        >
          <TabsList className="mb-5 w-fit">
            <TabsTrigger value="new" className="w-40">
              Fix Your Borrow
            </TabsTrigger>
            <TabsTrigger value="active" className="w-40">
              Active Fixed Borrows
            </TabsTrigger>
          </TabsList>

          <div className="flex w-full justify-between">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Protocols" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">All Protocols</SelectItem>
                <SelectItem value="morpho">
                  <div className="flex items-center gap-2">
                    <MorphoLogo />
                    Morpho
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort By: Loan Size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="apple">Loan Size</SelectItem>
                <SelectItem value="banana">Fixed Rate</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="new" asChild>
            <div className="flex w-full flex-col items-center gap-y-12">
              {newPositons}
            </div>
          </TabsContent>

          <TabsContent
            value="active"
            className="flex w-full flex-col items-center gap-y-12"
          >
            {activePositions
              ? activePositions.map((position) => (
                  <div
                    className="w-full"
                    id={position.market.hyperdrive}
                    key={position.market.hyperdrive}
                  >
                    <ActivePositionCard
                      market={position.market}
                      totalCoverage={position.totalCoverage}
                      debtCovered={position.debtCovered.bigint}
                      shorts={position.shorts}
                      // startOpened={
                      //   hyperdriveHash.slice(1) === position.market.hyperdrive
                      // }
                    />
                  </div>
                ))
              : Array.from({ length: 2 }, (_, index) => (
                  <Skeleton
                    key={index}
                    className="h-[204px] w-full rounded-xl bg-popover"
                  />
                ))}
          </TabsContent>
        </Tabs>
      )}

      <div className="flex flex-col items-center gap-y-8">
        <div className="space-y-4 text-center">
          <img
            className="m-auto size-12 rounded p-2"
            src="logos/morpho-logo-dark.svg"
            alt="Morpho logo"
          />
          <h1 className="font-chakra text-h3">Start with a Morpho Position</h1>

          <p className="text-secondary-foreground">
            Open a supported borrow position on Morpho and return to DELV Fixed
            Borrow to fix your rate.
          </p>
        </div>

        <div className="w-full max-w-screen-lg">
          <AllMarketsTable />
        </div>
      </div>
    </main>
  )
}
