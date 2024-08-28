import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { useQuery } from "@tanstack/react-query"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import { Collapsible, CollapsibleContent } from "components/base/collapsible"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/base/table"
import { MarketHeader } from "components/markets/MarketHeader"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { formatAddress } from "utils/base/formatAddress"
import { Address } from "viem"
import { useAccount, useChainId, usePublicClient } from "wagmi"
import { useParams } from "wouter"
import { SupportedChainId } from "~/constants"
import { Market } from "../types"

interface MarketPositionsCardProps {
  market: Market
}

function MarketPositionsCard(props: MarketPositionsCardProps) {
  const [tableOpen, setTableOpen] = useState(false)

  return (
    <Card>
      <CardHeader className="flex flex-row justify-between space-y-0">
        <MarketHeader market={props.market} className="text-h4" />

        <Button className="bg-gradient-to-r from-primary to-skyBlue">
          Add Coverage
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-md text-secondary-foreground">Total Coverage</p>
            <p className="font-mono text-lg">171,624.00</p>
          </div>

          <div className="space-y-1">
            <p className="text-md text-secondary-foreground">Debt Covered</p>
            <p className="font-mono text-lg">90%</p>
          </div>

          <div className="space-y-1">
            <p className="text-md text-secondary-foreground">Next Expiry</p>
            <p className="font-mono text-lg">30 days</p>
          </div>

          <Button variant="ghost" onClick={() => setTableOpen((open) => !open)}>
            <p>Manage</p> <ChevronDown />
          </Button>
        </div>

        <Collapsible open={tableOpen}>
          <CollapsibleContent>
            <Table>
              {/* <TableCaption>A list of your recent invoices.</TableCaption> */}
              <TableHeader>
                <TableRow className="hover:bg-card">
                  <TableHead>Coverage Debt</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Fixed Rate</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-card">
                  <TableCell className="font-medium">10-30-2024</TableCell>
                  <TableCell>133,232</TableCell>
                  <TableCell>10.70%</TableCell>
                  <TableCell>Sep 30, 2024</TableCell>
                  <TableCell>
                    <Button variant="secondary" className="ml-auto">
                      Remove coverage
                    </Button>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  )
}

function useAllBorrowPositions(account?: Address) {
  const chainId = useChainId()
  const client = usePublicClient()

  return useQuery({
    queryKey: ["all-borrow-positions", account, chainId],
    queryFn: async () => {
      const reader = new MorphoMarketReader(
        client!,
        chainId as SupportedChainId
      )
      const borrowPositions = await reader.getBorrowPositions(account!)

      const logs = await Promise.all(
        borrowPositions.map(async (position) => {
          const readHyperdrive = new ReadHyperdrive({
            address: position.market.hyperdrive,
            publicClient: client!,
          })

          readHyperdrive.address.

          return await readHyperdrive.getOpenShorts({
            account: account!,
          })
          // return await client!.getLogs({
          //   address: position.market.hyperdrive,
          //   event:
          // })
        })
      )

      console.log(logs)

      return borrowPositions

      // fetch all shorts
    },
    enabled: !!account && !!client,
  })
}

export function PositionPage() {
  const params = useParams()
  const chainId = useChainId()
  const { address: account } = useAccount()

  // const appConfig = getAppConfig(chainId as SupportedChainId)
  // const hyperdrive = params.hyperdrive

  // const { data: position } = useBorrowPosition(
  //   appConfig.morphoMarkets.find((market) => market.hyperdrive === hyperdrive)
  // )

  const { data: borrowPositions } = useAllBorrowPositions(account)

  return (
    <main className="m-auto my-8 flex max-w-7xl flex-col gap-8 px-4 lg:px-28">
      <h2 className="gradient-text w-fit font-chakra font-medium">
        My Positions
      </h2>

      <div className="flex gap-12">
        {account && (
          <div className="space-y-1">
            <p className="text-lg text-secondary-foreground">Account</p>
            <p className="font-mono text-h4">{formatAddress(account)}</p>
          </div>
        )}

        <div className="space-y-1">
          <p className="text-lg text-secondary-foreground">Total Fixed Debt</p>
          <p className="font-mono text-h4">$170,000</p>
        </div>
      </div>

      {borrowPositions?.map((position) => (
        <MarketPositionsCard market={position.market} />
      ))}
    </main>
  )
}
