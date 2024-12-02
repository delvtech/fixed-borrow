import { useQuery } from "@tanstack/react-query"
import { Button } from "components/base/button"
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "components/base/table"
import { SupportedChainId } from "dfb-config"
import { ArrowRight } from "lucide-react"
import { useMemo } from "react"
import { OrderIntent, OrderType } from "src/otc/utils"
import { getAppConfig } from "utils/getAppConfig"
import { useChainId } from "wagmi"
import { useParams } from "wouter"

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
      extraData: "0x1234",
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
      extraData: "0x5678",
    },
    orderType: OrderType.OpenShort,
    signature:
      "0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef",
    expiry: BigInt(Math.floor(Date.now() / 1000) + 7200), // Current timestamp + 2 hours
    salt: "0xedcba98765432109fedcba98765432109fedcba98765432109fedcba9876543210",
  },
  {
    trader: "0x3456789012345678901234567890123456789012",
    hyperdrive: "0xd41225855A5c5Ba1C672CcF4d72D1822a5686d30",
    amount: BigInt("2000000000000000000"), // 2 ETH in wei
    slippageGuard: BigInt("100000000000000000"), // 0.1 ETH in wei
    minVaultSharePrice: BigInt("1010000000000000000"), // 1.01 in 18 decimal precision
    options: {
      asBase: true,
      destination: "0xb098765432109876543210987654321098765432",
      extraData: "0x9abc",
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
      extraData: "0xdef0",
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
export function OTCPage() {
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

  if (!market) return <div>Market not found</div>

  const decimals = market?.loanToken.decimals
  const symbol = market?.loanToken.symbol

  console.log(market)

  return (
    <div className="m-auto flex max-w-3xl flex-col gap-6">
      <h1 className="font-chakra text-h2 text-primary">Hyperdrive OTC</h1>

      <p className="text-secondary-foreground">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent
        lobortis magna suscipit laoreet pulvinar. Donec vel varius leo. Nulla
        finibus id velit quis auctor.
      </p>
      <div className="flex items-center justify-between">
        <h2 className="font-chakra text-h3">Pending Orders</h2>
        <Button>
          New Order <ArrowRight size={14} />
        </Button>
      </div>

      <Table className="animate-fadeFast">
        <TableHeader className="[&_tr]:border-b-0">
          <TableRow className="hover:bg-card">
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
          {/* {props.shorts.map((short) => {
            const openedDate = new Date(Number(short.openedTimestamp) * 1000)
            const maturity = new Date(Number(short.maturity) * 1000)

            const isMatured = new Date() > maturity

            return (
              <TableRow
                key={short.assetId.toString()}
                className="hover:bg-card"
              >
                <TableCell className="font-mono">
                  {openedDate.toLocaleDateString()}
                </TableCell>
                <TableCell className="font-mono">
                  {fixed(short.bondAmount, decimals).format({
                    decimals: 2,
                    trailingZeros: false,
                  })}{" "}
                  {symbol}
                </TableCell>
                <TableCell className="font-mono">
                  {fixed(short.rateQuote, 6).format({
                    percent: true,
                    decimals: 2,
                  })}
                </TableCell>
                <TableCell className="font-mono">
                  {maturity.toLocaleDateString()}
                </TableCell>

                <TableCell>
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
                </TableCell>
              </TableRow>
            )
          })} */}
        </TableBody>
      </Table>
    </div>
  )
}
