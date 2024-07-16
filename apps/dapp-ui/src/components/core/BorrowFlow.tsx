import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { useQuery } from "@tanstack/react-query"
import { Button } from "components/base/button"
import { Card, CardContent } from "components/base/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "components/base/collapsible"
import { Input } from "components/base/input"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/base/tooltip"
import * as dn from "dnum"
import { useNumericInput } from "hooks/base/useNumericInput"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { ChevronDown, Info } from "lucide-react"
import { useState } from "react"
import { match } from "ts-pattern"
import { formatTermLength } from "utils/formatTermLength"
import { useChainId, usePublicClient } from "wagmi"
import { SupportedChainId } from "~/constants"
import { BorrowPosition, Market } from "../../types"

interface BorrowFlowProps {
  market: Market
  position: BorrowPosition
}

type BorrowFlowStep = "review"

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

  const [step] = useState<BorrowFlowStep>("review")

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

  const { amount, amountAsBigInt, setAmount } = useNumericInput({
    decimals: props.market.loanToken.decimals,
    defaultValue: props.position.totalDebt,
  })

  const { data: costOfCoverage } = useQuery({
    queryKey: ["cost-coverage", amount, props.market.hyperdrive],
    queryFn: async () => {
      const readHyperdrive = new ReadHyperdrive({
        address: props.market.hyperdrive,
        publicClient: client!,
      })

      return readHyperdrive.previewOpenShort({
        amountOfBondsToShort: amountAsBigInt ?? 0n,
        asBase: true,
      })
    },
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
  })

  return match(step)
    .with("review", () => {
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

          <Card>
            <CardContent className="grid h-full max-w-5xl grid-cols-3 rounded border bg-card p-6">
              <div className="col-span-2 hidden md:block">
                <img src="/image.png" className="h-[440px]" />
              </div>

              <div className="col-span-3 flex flex-col gap-y-12 md:col-span-1">
                <div className="space-y-4">
                  <p className="text-sm text-secondary-foreground">
                    Debt being locked at{" "}
                    {rateQuote
                      ? dn.format([rateQuote, 16], {
                          digits: 2,
                        })
                      : "N/A"}
                    %
                  </p>
                  <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                    {dn.format(
                      [amountAsBigInt ?? 0n, props.market.loanToken.decimals],
                      2
                    )}{" "}
                    <span className="text-md font-normal">
                      {props.market.loanToken.symbol}
                    </span>
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
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                      />
                      {/* <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                      @radix-ui/colors
                    </div>
                    <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                      @stitches/react
                    </div> */}
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* collapsible */}

                <div className="space-y-1">
                  <p className="text-secondary-foreground">Cost of Coverage</p>
                  <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                    {dn.format(
                      [
                        costOfCoverage?.traderDeposit ?? 0n,
                        props.market.loanToken.decimals,
                      ],
                      2
                    )}{" "}
                    <span className="text-md font-normal">
                      {props.market.loanToken.symbol}
                    </span>
                  </h3>

                  <div className="flex items-center gap-x-1">
                    <p className="text-secondary-foreground">
                      What am I paying for?
                    </p>

                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <Info
                            className="text-secondary-foreground"
                            size={14}
                          />
                        </TooltipTrigger>

                        {/* TODO  */}
                        <TooltipContent className="max-w-64 space-y-4">
                          <p>
                            Your variable borrow costs on Morpho will be offset
                            by the variable interest earned on Hyperdrive,
                            resulting in a borrow rate with a fixed upper bound.
                          </p>
                          <p>Upfront payment on Hyperdrive: 12,734.50 USDC</p>
                          <p>
                            Max net variable interest incurred after 1 Yr:
                            5,629.27 USDC Result of the full variable borrow
                            interest payable on Morpho less the variable
                            interest earned on Hyperdrive.
                          </p>

                          <p>
                            Max total interest paid at the end of the coverage
                            period: 12,734.50 USDC + 5,629.27 USDC = 18,363.77
                            USDC (10.70%)
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full px-4 text-sm font-light"
                  >
                    Preview Position
                  </Button>
                  <Button className="w-full">Pay from wallet</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    })
    .exhaustive()
}
