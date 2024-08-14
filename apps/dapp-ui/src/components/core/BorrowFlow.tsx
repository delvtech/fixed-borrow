import { fixed } from "@delvtech/fixed-point-wasm"
import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent } from "components/base/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "components/base/collapsible"
import { Separator } from "components/base/separator"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/base/tooltip"
import { useNumericInput } from "hooks/base/useNumericInput"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { ChevronDown, CircleCheck, Info } from "lucide-react"
import { useState } from "react"
import { formatTermLength } from "utils/formatTermLength"
import { useChainId, usePublicClient } from "wagmi"
import { SupportedChainId } from "~/constants"
import { BorrowPosition, Market } from "../../types"

interface BorrowFlowProps {
  market: Market
  position: BorrowPosition
}

function useBorrowRateQuote(market: Market) {
  const chainId = useChainId()
  const client = usePublicClient()

  return useQuery({
    queryKey: ["borrow-rate-quote", chainId],
    queryFn: async () => {
      const reader = new MorphoMarketReader(
        client!,
        chainId as SupportedChainId
      )

      return reader.quoteRate(market)
    },
    enabled: !!chainId && !!client,
  })
}

export function BorrowFlow(props: BorrowFlowProps) {
  const client = usePublicClient()
  const decimals = props.market.loanToken.decimals

  const [isOpen, setIsOpen] = useState(false)

  const { data: rateQuote } = useBorrowRateQuote(props.market)

  const borrowPositionDebt = props.position.totalDebt

  const { amount, amountAsBigInt, setAmount } = useNumericInput({
    decimals,
    defaultValue: props.position.totalDebt,
  })

  const { data: costOfCoverage } = useQuery({
    queryKey: ["cost-coverage", amount, props.market.hyperdrive],
    queryFn: async () => {
      const readHyperdrive = new ReadHyperdrive({
        address: props.market.hyperdrive,
        publicClient: client!,
      })

      const maxShort = await readHyperdrive.getMaxShort()

      if (maxShort.maxBondsOut < amountAsBigInt!)
        console.warn("Not enough liquidity")

      return readHyperdrive.previewOpenShort({
        amountOfBondsToShort: amountAsBigInt!,
        asBase: true,
      })
    },
    enabled: !!client && !!amountAsBigInt,
  })

  const { data: termLength } = useQuery({
    queryKey: ["term-length", props.market.hyperdrive],
    queryFn: async () => {
      const readHyperdrive = new ReadHyperdrive({
        address: props.market.hyperdrive,
        publicClient: client!,
      })

      const poolConfig = await readHyperdrive.getPoolConfig()
      return formatTermLength(poolConfig.positionDuration)
    },
    enabled: !!client,
  })

  const formattedRateQuote = fixed(rateQuote ?? 0n, decimals - 2).format({
    decimals: 2,
  })
  const formatttedNetRate = fixed(
    costOfCoverage?.spotRateAfterOpen ?? 0n,
    16
  ).format({
    decimals: 4,
  })
  // const formattedRateImpact = fixed( costOfCoverage?.spotRateAfterOpen)
  const formattedTotalDebt = fixed(props.position.totalDebt, decimals).format({
    decimals: 2,
  })

  return (
    <div className="flex w-full flex-col items-center gap-16 bg-transparent px-8">
      <div className="max-w-3xl space-y-8 text-center">
        <h3 className="gradient-text font-chakra font-semibold">
          Lock in your rate
        </h3>

        <p className="max-w-4xl text-lg text-secondary-foreground">
          Acquire coverage for your borrow position and get peace of mind and
          predictability. Lock in your current borrow rate for the next 90 days.
          If the rate goes lower, you’ll benefit from that too.
        </p>

        <div className="flex flex-wrap justify-between gap-8 text-left">
          <div className="space-y-1">
            <p className="text-sm text-secondary-foreground">
              Lock in max rate
            </p>

            <p className="flex items-baseline gap-x-1 font-mono text-h3">
              {formattedRateQuote}%
              <span className="text-md font-normal">APY</span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-secondary-foreground">Current Debt</p>

            <p className="flex items-baseline gap-x-1 font-mono text-h3">
              {formattedTotalDebt}
              <span className="text-md font-normal">
                {props.market.loanToken.symbol}
              </span>
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-sm text-secondary-foreground">Coverage period</p>

            <p className="flex items-baseline gap-x-1 font-mono text-h3">
              {termLength?.value}{" "}
              <span className="text-md font-normal">{termLength?.scale}</span>
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-[1fr_1fr_420px] gap-8 rounded border bg-card p-8">
          <div className="col-span-2 hidden md:block">
            <img src="/image.png" className="h-[440px]" />
          </div>

          <div className="col-span-3 flex flex-col gap-y-6 md:col-span-1">
            <div className="space-y-4">
              <div className="space-y-4">
                <p className="text-secondary-foreground">
                  Morpho Debt being covered
                </p>

                <div className="flex h-16 items-center rounded-sm bg-background font-mono text-[24px]">
                  <input
                    className="h-full rounded-sm border-none bg-background p-4 font-mono text-[24px] [appearance:textfield] focus:border-none focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                    placeholder="0"
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                  />

                  <Badge className="m-2 flex h-6 items-center gap-1 border-none bg-card p-2 py-4 font-sans font-medium">
                    <img
                      src={props.market.loanToken.iconUrl}
                      className="size-4"
                    />{" "}
                    {props.market.loanToken.symbol}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex gap-x-2">
                    <Button className="h-min rounded-[4px] bg-accent p-1 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground">
                      25%
                    </Button>
                    <Button className="h-min rounded-[4px] bg-accent p-1 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground">
                      50%
                    </Button>
                    <Button className="h-min rounded-[4px] bg-accent p-1 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground">
                      75%
                    </Button>
                    <Button className="h-min rounded-[4px] bg-accent p-1 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground">
                      MAX
                    </Button>
                  </div>

                  <Badge className="flex items-center gap-1 rounded-[4px] bg-primary/20 font-mono text-xs text-primary">
                    <CircleCheck className="size-3" /> Fully Covered
                  </Badge>
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex justify-between text-sm">
              <p className="text-secondary-foreground">
                Your Projected Max Borrow APY
              </p>
              <div className="space-y-1 text-right">
                <p className="font-mono">{formatttedNetRate}%</p>
                <Badge
                  variant="secondary"
                  className="rounded-[4px] bg-popover font-mono text-xs text-secondary-foreground"
                >
                  Rate Impact 0.0001%{" "}
                </Badge>
              </div>
            </div>

            <div className="flex justify-between text-sm">
              <p className="text-secondary-foreground">You Pay</p>
              <div className="space-y-1 text-right">
                <p className="font-mono">
                  {fixed(
                    costOfCoverage?.traderDeposit ?? 0n,
                    props.market.loanToken.decimals
                  ).format({
                    decimals: 4,
                  })}{" "}
                  USDC{" "}
                </p>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 text-secondary-foreground">
                      <p>What am I paying for?</p>
                      <Info className="text-secondary-foreground" size={14} />
                    </TooltipTrigger>

                    <TooltipContent className="max-w-64 space-y-4">
                      N/A
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Button
                size="lg"
                variant="secondary"
                className="w-full px-4 text-sm font-light"
              >
                Preview Position
              </Button>
              <Button size="lg" className="w-full">
                Pay from wallet
              </Button>
            </div>

            <Separator />

            <Collapsible open={isOpen} onOpenChange={setIsOpen}>
              <CollapsibleTrigger className="-mt-2 flex w-full items-center text-start text-secondary-foreground">
                Details
                <ChevronDown className="ml-auto inline h-4 w-4 text-secondary-foreground" />
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4 space-y-4">
                <div className="flex justify-between text-sm">
                  <p className="text-secondary-foreground">
                    Your Projected Max Borrow APY
                  </p>
                  <p className="font-mono">10.70%</p>
                </div>

                <div className="flex justify-between text-sm">
                  <p className="text-secondary-foreground">Maturity Date</p>
                  <p className="font-mono">31-Aug-2025</p>
                </div>

                <div className="flex justify-between text-sm">
                  <p className="text-secondary-foreground">
                    Projected Max Fixed Debt (365 days)
                  </p>
                  <p className="font-mono">189,987.77 USDC</p>
                </div>

                <div className="flex justify-between text-sm">
                  <p className="text-secondary-foreground">
                    Current Borrow APY (Morpho)
                  </p>
                  <p className="font-mono">9.31%</p>
                </div>

                <div className="flex justify-between text-sm">
                  <p className="text-secondary-foreground">Slippage</p>
                  <p className="font-mono">~0.5%</p>
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
