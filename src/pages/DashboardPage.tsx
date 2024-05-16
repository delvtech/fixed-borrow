import { useQuery } from "@tanstack/react-query"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "components/ui/card"
import { MorphoMarketReader } from "lib/markets/MarketsReader"
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

interface MarketCardProps {
  marketTitle: string
  marketDescription?: string
}

function MarketCard(props: MarketCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{props.marketTitle}</CardTitle>
        <CardDescription>{props.marketDescription}</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="flex flex-col">
          <span className="font-semibold font-display">Total Col.</span>
          <span>100,000</span>
        </div>
      </CardContent>
    </Card>
  )
}

export function DashboardPage() {
  const { data: borrowPositions = [] } = useAllBorrowPositions(
    "0x9e990c8dc9768f959b5abf7910f5fd3b965ccf24"
  )

  return (
    <main className="h-40 w-full h-min-screen mt-8">
      {borrowPositions.map((position) => {
        return (
          <MarketCard
            marketTitle={position.market?.loanAsset?.symbol}
            marketDescription={`${position.market.loanAsset.name}`}
          />
        )
      })}
      {/* <Card>
        <CardHeader>
          <CardTitle>Your Positions</CardTitle>
          <CardDescription>Open borrow positions on Morpho.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableCaption>A list of your Morpho borrow positions.</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Loan</TableHead>
                <TableHead>Borrow</TableHead>
                <TableHead>Collateral</TableHead>
                <TableHead>Borrow Apy</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrowPositions.map((position) => (
                <TableRow key={position.market.uniqueKey}>
                  <TableCell className="font-medium">
                    {position.market.collateralAsset?.symbol} /{" "}
                    {position.market.loanAsset.symbol}
                  </TableCell>
                  <TableCell>
                    ${dn.format(dn.from(position.borrowAssetsUsd ?? 0), 2)}
                  </TableCell>
                  <TableCell>
                    ${dn.format(dn.from(position.collateralUsd ?? 0), 2)}
                  </TableCell>
                  <TableCell>
                    {dn.format(
                      dn.from((position.market.state?.borrowApy ?? 0) * 100),
                      {
                        digits: 2,
                        trailingZeros: true,
                      }
                    )}
                    %
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card> */}
    </main>
  )
}
