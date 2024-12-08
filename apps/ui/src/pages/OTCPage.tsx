import { fixed } from "@delvtech/fixed-point-wasm"
import { useQuery } from "@tanstack/react-query"
import { Button } from "components/base/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "components/base/table"
import { MarketHeader } from "components/markets/MarketHeader"
import { SupportedChainId } from "dfb-config"
import { ArrowRight } from "lucide-react"
import { OrderIntent, OrderType } from "src/otc/utils"
import { getAppConfig } from "utils/getAppConfig"
import { useAccount, useChainId } from "wagmi"
import { Link, useParams } from "wouter"

const mockOrderIntents: OrderIntent[] = [
  {
    trader: "0x1234567890123456789012345678901234567890",
    hyperdrive: "0xd41225855A5c5Ba1C672CcF4d72D1822a5686d30",
    amount: BigInt("1000000000000000000"), // 1 ETH in wei
    slippageGuard: BigInt("50000000000000000"), // 0.05 ETH in wei
    minVaultSharePrice: BigInt("1000000000000000000"), // 1 in 18 decimal precision
    options: {
      asBase: true,
      destination: "0x9876543210987654321098765432109876543210",
      extraData: "0x",
    },
    orderType: OrderType.OpenLong,
    signature:
      "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    expiry: BigInt(Math.floor(Date.now() / 1000) + 3600), // Current timestamp + 1 hour
    salt: "0xfedcba9876543210fedcba9876543210fedcba9876543210fedcba9876543210",
  },
  {
    trader: "0x2345678901234567890123456789012345678901",
    hyperdrive: "0xd41225855A5c5Ba1C672CcF4d72D1822a5686d30",
    amount: BigInt("500000000000000000"), // 0.5 ETH in wei
    slippageGuard: BigInt("25000000000000000"), // 0.025 ETH in wei
    minVaultSharePrice: BigInt("990000000000000000"), // 0.99 in 18 decimal precision
    options: {
      asBase: false,
      destination: "0xa987654321098765432109876543210987654321",
      extraData: "0x",
    },
    orderType: OrderType.OpenShort,
    signature:
      "0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef",
    expiry: BigInt(Math.floor(Date.now() / 1000) + 7200), // Current timestamp + 2 hours
    salt: "0xedcba98765432109fedcba98765432109fedcba98765432109fedcba9876543210",
  },
  {
    trader: "0xaA5CBCBd7f85F03BdD7D64C7186c16C0A19217c9",
    hyperdrive: "0xd41225855A5c5Ba1C672CcF4d72D1822a5686d30",
    amount: BigInt("2000000000000000000"), // 2 ETH in wei
    slippageGuard: BigInt("100000000000000000"), // 0.1 ETH in wei
    minVaultSharePrice: BigInt("1010000000000000000"), // 1.01 in 18 decimal precision
    options: {
      asBase: true,
      destination: "0xb098765432109876543210987654321098765432",
      extraData: "0x",
    },
    orderType: OrderType.OpenLong,
    signature:
      "0x3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef3456789012abcdef",
    expiry: BigInt(Math.floor(Date.now() / 1000) + 10800), // Current timestamp + 3 hours
    salt: "0xdcba987654321098edcba987654321098edcba987654321098edcba98765432109",
  },
  {
    trader: "0x4567890123456789012345678901234567890123",
    hyperdrive: "0xd41225855A5c5Ba1C672CcF4d72D1822a5686d30",
    amount: BigInt("750000000000000000"), // 0.75 ETH in wei
    slippageGuard: BigInt("37500000000000000"), // 0.0375 ETH in wei
    minVaultSharePrice: BigInt("995000000000000000"), // 0.995 in 18 decimal precision
    options: {
      asBase: false,
      destination: "0xc109876543210987654321098765432109876543",
      extraData: "0x",
    },
    orderType: OrderType.OpenShort,
    signature:
      "0x4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef4567890123abcdef",
    expiry: BigInt(Math.floor(Date.now() / 1000) + 14400), // Current timestamp + 4 hours
    salt: "0xcba9876543210987dcba9876543210987dcba9876543210987dcba987654321098",
  },
]

async function getPendingOrderIntents(chainId: SupportedChainId) {
  const data: Promise<OrderIntent[]> = new Promise(async (resolve) => {
    resolve(mockOrderIntents)
  })
  return data
}

// create a react hook using react-query to fetch the pending order intents mock
export function usePendingOrderIntents() {
  const chainId = useChainId()
  return useQuery({
    queryKey: ["pendingOrderIntents", chainId],
    queryFn: () => getPendingOrderIntents(chainId as SupportedChainId),
  })
}

function Orders() {
  const { address: account } = useAccount()
  const params = useParams()
  const chainId = useChainId()
  const appConfig = getAppConfig(chainId as SupportedChainId)
  const hyperdrive = params.hyperdrive

  const { data: orderIntents } = usePendingOrderIntents()
  // const market = useMemo(
  //   () =>
  //     appConfig.morphoMarkets.find(
  //       (market) => market.hyperdrive === hyperdrive
  //     ),
  //   [appConfig]
  // )
  // console.log(hyperdrive)
  // if (!market) return <div>Market not found</div>

  // const decimals = market?.loanToken.decimals
  // const symbol = market?.loanToken.symbol

  // console.log(market)
  return (
    <div className="relative m-auto flex max-w-6xl flex-col gap-8 px-8">
      <div className="flex items-center justify-between gap-4">
        <div className="max-w-lg space-y-2">
          <h1 className="font-chakra text-h3 font-medium text-primary">
            Hyperdrive OTC
          </h1>

          <p className="text-secondary-foreground">
            Hyperdrive OTC enables you to view and create over-the-counter
            orders for Hyperdrive markets.
          </p>
        </div>
        <Link href="/otc/new">
          <Button>
            New Order <ArrowRight size={14} />
          </Button>
        </Link>
      </div>
      <div className="grid gap-4">
        <div className="flex items-center justify-between">
          <h2 className="font-chakra text-h4 text-white">Pending Orders</h2>
        </div>
        <div className="rounded-lg border">
          <Table className="w-full animate-fade bg-[#0E1320]">
            <TableHeader className="rounded-tl-lg [&_tr]:border-b-0">
              <TableRow className="bg-[#0E1320] hover:bg-[#0E1320]">
                <TableHead className="font-normal text-secondary-foreground">
                  Market
                </TableHead>
                <TableHead className="font-normal text-secondary-foreground">
                  Amount
                </TableHead>
                <TableHead className="font-normal text-secondary-foreground">
                  Active Until
                </TableHead>
                <TableHead className="font-normal text-secondary-foreground">
                  Target Rate
                </TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orderIntents?.map((intent) => {
                const market = appConfig.morphoMarkets.find(
                  (market) => market.hyperdrive === intent.hyperdrive
                )

                if (!market) return <div>Market not found</div>
                const decimals = market.loanToken.decimals
                const symbol = market.loanToken.symbol

                return (
                  <TableRow
                    key={intent.signature}
                    className="bg-[#0E1320] hover:bg-[#0E1320]"
                  >
                    <TableCell className="p-6 font-mono">
                      <MarketHeader
                        market={market}
                        className="text-h5"
                        size={16}
                      />
                    </TableCell>
                    <TableCell className="font-mono">
                      {fixed(intent.amount, decimals).format({
                        decimals: 2,
                        trailingZeros: false,
                      })}{" "}
                      {symbol}
                    </TableCell>
                    <TableCell className="font-mono">
                      {new Date(
                        Number(intent.expiry) * 1000
                      ).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="font-mono">
                      {fixed(intent.slippageGuard, decimals).format({
                        decimals: 2,
                        percent: true,
                        trailingZeros: false,
                      })}
                    </TableCell>

                    <TableCell>
                      {account === intent.trader ? (
                        <Button
                          className="ml-auto bg-[#1B1E26] text-red-400 hover:bg-[#1B1E26]/50"
                          onClick={() => {}}
                        >
                          Cancel
                        </Button>
                      ) : (
                        <Button className="ml-auto" onClick={() => {}}>
                          Fill order
                        </Button>
                      )}
                    </TableCell>

                    {/* <TableCell>
              {isMatured ? (
                <Button
                  className="ml-auto"
                  onClick={() => {
                    // setSelectedOpenShort(short)
                    // setCloseCoverageModalOpen(true)
                  }}
                >
                  Close Position
                </Button>
              ) : (
                <Button
                  variant="secondary"
                  className="ml-auto"
                  onClick={() => {
                    // setSelectedOpenShort(short)
                    // setCloseCoverageModalOpen(true)
                  }}
                >
                  Revert to Variable
                </Button>
              )}
            </TableCell> */}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>{" "}
        </div>
      </div>
    </div>
  )
}

export function OTCPage() {
  return <Orders />
}
