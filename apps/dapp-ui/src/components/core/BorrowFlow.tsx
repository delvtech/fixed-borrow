import { useQuery } from "@tanstack/react-query"
import { Button } from "components/base/button"
import { Card, CardContent } from "components/base/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "components/base/collapsible"
import { Input } from "components/base/input"
import { Separator } from "components/base/separator"
import * as dn from "dnum"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { ChevronDown, Clock, Fuel, ShieldCheck } from "lucide-react"
import { useState } from "react"
import { match } from "ts-pattern"
import { useChainId, usePublicClient } from "wagmi"
import { SupportedChainId } from "~/constants"
import { BorrowPosition, Market } from "../../types"

interface BorrowFlowProps {
  market: Market
  position: BorrowPosition
}

type BorrowFlowStep = "review" | "cover"

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
  const [step] = useState<BorrowFlowStep>("review")
  const client = usePublicClient()
  const loanDecimals = props.market.loanToken.decimals

  const [isOpen, setIsOpen] = useState(false)

  const { data: rateQuote } = useBorrowRateQuote(props.market)

  const borrowPositionDebt = props.position.totalDebt
  const projectedFixRateDebt = dn.mul(
    [borrowPositionDebt, 18],
    dn.add(dn.from(1, 18), [rateQuote ?? 0n, 18])
  )
  const projectedVarRateDebt = dn.mul(
    [borrowPositionDebt, 18],
    dn.add(dn.from(1, 18), [props.position.currentRate, 18])
  )

  console.log(props.market.termLength)

  return match(step)
    .with("review", () => {
      return (
        <div className="flex w-full flex-col items-center gap-y-16 bg-transparent">
          <div className="space-y-8 text-center">
            <h3 className="gradient-text font-semibold">Lock in your rate</h3>

            <p className="text-lg text-secondary-foreground">
              Acquire coverage for your borrow position and get peace of mind
              and predictability. Lock in <br /> your current borrow rate for
              the next 90 days. If the rate goes lower, you’ll benefit from that
              too.
            </p>

            <div className="flex justify-between text-left">
              <div className="space-y-1">
                <p className="text-sm text-secondary-foreground">
                  Lock in max rate
                </p>
                <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                  {rateQuote
                    ? dn.format([rateQuote, 16], {
                        digits: 2,
                      })
                    : "N/A"}
                  % <span className="text-md font-normal">APY</span>
                </h3>
                <p className="text-sm text-secondary-foreground">
                  Current rate:{" "}
                  {dn.format(dn.from([props.position.currentRate, 16]), {
                    digits: 2,
                  })}
                  % APY
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-secondary-foreground">
                  Fixed rate debt 1yr
                </p>
                <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                  {dn.format(projectedFixRateDebt, {
                    digits: 2,
                  })}
                  <span className="text-md font-normal">USDC</span>
                </h3>
                <p className="text-sm text-secondary-foreground">
                  Proj. var debt:{" "}
                  {dn.format(projectedVarRateDebt, {
                    digits: 2,
                  })}{" "}
                  USDC
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-secondary-foreground">
                  Coverage period
                </p>
                <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                  1 <span className="text-md font-normal">yr</span>
                </h3>
                <p className="text-sm text-secondary-foreground">
                  Coverage ends: 20-May-2025
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="grid h-full max-w-5xl grid-cols-3 rounded border bg-card p-6">
              {/* image simulation */}
              <div className="col-span-2">
                <img src="/image.png" className="h-[440px]" />
              </div>

              <div className="flex flex-col gap-y-12">
                <div className="space-y-4">
                  <p className="text-sm text-secondary-foreground">
                    Debt being locked at 10.41%
                  </p>
                  <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                    171,624.00 <span className="text-md font-normal">USDC</span>
                  </h3>

                  <Collapsible
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    className="w-full space-y-2 border-y py-4"
                  >
                    <CollapsibleTrigger className="flex w-full items-center text-start">
                      <p className="inline font-medium text-secondary-foreground">
                        Protect less or more than total debt
                      </p>
                      <ChevronDown className="ml-auto inline h-4 w-4 text-secondary-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2">
                      <p className="text-base">
                        How much debt would you like to cover?
                      </p>

                      <Input
                        className="rounded-[8px] font-mono placeholder:text-secondary-foreground"
                        placeholder="0.00"
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                <div className="space-y-1">
                  <p className="text-secondary-foreground">Cost of Coverage</p>
                  <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                    13,624.00 <span className="text-md font-normal">USDC</span>
                  </h3>
                  <p className="text-secondary-foreground">
                    What am I paying for?
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full px-4 text-sm font-light"
                  >
                    View your future position with covered debt
                  </Button>
                  <Button className="w-full" onClick={() => setStep("cover")}>
                    Pay from wallet
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    })
    .with("cover", () => {
      return (
        <div className="flex w-full flex-col items-center gap-y-16 bg-transparent px-8">
          <div className="space-y-8 text-center">
            <h3 className="gradient-text font-chakra font-semibold">
              Lock in your rate
            </h3>

            <p className="text-lg text-secondary-foreground">
              Acquire coverage for your borrow position and get peace of mind
              and predictability. Lock in <br /> your current borrow rate for
              the next 90 days. If the rate goes lower, you’ll benefit from that
              too.
            </p>

            <div className="flex flex-wrap justify-between gap-8 text-left">
              <div className="space-y-1">
                <p className="text-sm text-secondary-foreground">
                  Lock in max rate
                </p>

                <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                  {rateQuote
                    ? dn.format([rateQuote, 16], {
                        digits: 2,
                      })
                    : "N/A"}
                  % <span className="text-md font-normal">APY</span>
                </h3>

                <p className="text-sm text-secondary-foreground">
                  Current rate:{" "}
                  {dn.format(dn.from([props.position.currentRate, 16]), {
                    digits: 2,
                  })}
                  % APY
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-secondary-foreground">
                  Fixed rate debt 1yr
                </p>

                <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                  {dn.format(projectedFixRateDebt, {
                    digits: 2,
                  })}
                  <span className="text-md font-normal">
                    {props.market.loanToken.symbol}
                  </span>
                </h3>

                <p className="text-sm text-secondary-foreground">
                  Proj. var debt:{" "}
                  {dn.format(projectedVarRateDebt, {
                    digits: 2,
                  })}{" "}
                  {props.market.loanToken.symbol}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-secondary-foreground">
                  Coverage period
                </p>

                <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                  {termLength?.value}{" "}
                  <span className="text-md font-normal">
                    {termLength?.scale}
                  </span>
                </h3>

                {/* TODO */}
                <p className="text-sm text-secondary-foreground">
                  Coverage ends: 20-May-2025
                </p>
              </div>
            </div>
          </div>

          <Card className="w-full sm:max-w-[500px]">
            <CardContent className="flex w-full flex-col gap-8 p-6">
              <div className="m-auto w-min rounded bg-accent p-2">
                <ShieldCheck className="text-secondary-foreground" />
              </div>

              <div className="flex flex-col items-center gap-4">
                <p className="text-sm text-secondary-foreground">
                  Cost of coverage
                </p>
                <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                  {dn.format(
                    [costOfCoverage?.traderDeposit ?? 0n, loanDecimals],
                    2
                  )}{" "}
                  <span className="text-md">
                    {props.market.loanToken.symbol}
                  </span>
                </h3>
              </div>

              <div className="space-y-6">
                <div className="space-y-4">
                  <p>Pay from wallet</p>
                  <Input
                    className="rounded-sm border-primary font-mono"
                    value={"12,734.50"}
                  />
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
                    <p className="font-mono text-xs text-secondary-foreground">
                      Balance 800,888 USDC
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-6 text-sm">
                  <div className="flex justify-between">
                    <p className="text-secondary-foreground">
                      Total debt protected
                    </p>
                    <p className="font-mono">171,624.00 USDC</p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-secondary-foreground">
                      Projected Max Borrow APY
                    </p>
                    <p className="font-mono">10.70%</p>
                  </div>

                  <div className="flex justify-between">
                    <p className="text-secondary-foreground">Protection Cost</p>
                    <p className="font-mono">12,734.50 USDC</p>
                  </div>
                </div>

                <Collapsible className="w-full border-t py-4">
                  <CollapsibleTrigger className="flex w-full items-center text-start">
                    <p className="text-sm font-medium text-secondary-foreground">
                      More Details
                    </p>
                    <ChevronDown className="ml-auto inline h-4 w-4 text-secondary-foreground" />
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-6 space-y-2">
                    <div className="space-y-6 text-sm">
                      <div className="flex justify-between">
                        <p className="text-secondary-foreground">
                          Current Borrow APY
                        </p>
                        <p className="font-mono">9.31%</p>
                      </div>

                      <div className="flex justify-between">
                        <p className="text-secondary-foreground">Slippage</p>
                        <p className="font-mono">~0.5%</p>
                      </div>
                    </div>
                  </CollapsibleContent>
                </Collapsible>

                <div className="grid grid-cols-2 rounded border p-4">
                  <div className="space-y-2">
                    <Clock size={16} className="text-secondary-foreground" />

                    <p className="text-sm text-secondary-foreground">
                      Coverage ends
                    </p>

                    <p className="font-mono text-lg font-medium">
                      June 02, 2024
                    </p>

                    <Button className="h-min rounded-[4px] bg-accent p-1 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground">
                      180 days
                    </Button>
                  </div>

                  <div className="space-y-2">
                    <Fuel size={16} className="text-secondary-foreground" />

                    <p className="text-sm text-secondary-foreground">
                      Est. Gas Cost
                    </p>

                    <p className="font-mono text-lg font-medium">~5 USD</p>

                    <Button className="h-min rounded-[4px] bg-accent p-1 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground">
                      0.0001 ETH
                    </Button>
                  </div>
                </div>

                <Button size="lg" className="w-full">
                  Approve USDC 1/2
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    })
    .exhaustive()
}
