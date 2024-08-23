import { fixed, FixedPoint, parseFixed } from "@delvtech/fixed-point-wasm"
import { ReadHyperdrive, ReadWriteHyperdrive } from "@delvtech/hyperdrive-viem"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "components/base/collapsible"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/base/select"
import { Separator } from "components/base/separator"
import { Skeleton } from "components/base/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/base/tooltip"
import { MarketHeader } from "components/markets/MarketHeader"
import { cn } from "components/utils"
import { useApproval } from "hooks/base/useApproval"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { isNil } from "lodash-es"
import { ChevronDown, Info, Settings } from "lucide-react"
import { useReducer, useState } from "react"
import { formatTermLength } from "utils/formatTermLength"
import { maxUint256 } from "viem"
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi"
import { SupportedChainId } from "~/constants"
import { BorrowPosition, Market } from "../../types"

const quickTokenAmountWeights = [0.25, 0.5, 0.75, 1] as const

type State = {
  step: "buy" | "reciept"
  decimals: number
  bondAmount: bigint
}

type Action = {
  type: "bondAmountInput"
  payload: {
    amount: string
    // allowance: bigint
  }
}

const reducer = (state: State, action: Action): State => {
  const { type, payload } = action

  switch (type) {
    case "bondAmountInput": {
      const parsedAmount = parseFixed(payload.amount, state.decimals).bigint

      return {
        ...state,
        bondAmount: parsedAmount,
      }
    }
    default: {
      return state
    }
  }
}

interface BorrowFlowProps {
  market: Market
  position: BorrowPosition
}

function useBorrowFlowData(market: Market, bondAmount: bigint) {
  const client = usePublicClient()
  const chainId = useChainId()

  return useQuery({
    queryKey: [
      "fixed-borrowing-cost",
      bondAmount.toString(),
      market.hyperdrive,
      chainId,
    ],
    enabled: !!client && !isNil(bondAmount),

    queryFn: async () => {
      const readHyperdrive = new ReadHyperdrive({
        address: market.hyperdrive,
        publicClient: client!,
      })

      const reader = new MorphoMarketReader(
        client!,
        chainId as SupportedChainId
      )

      // const maxShort = await readHyperdrive.getMaxShort()

      let rateQuote = fixed(await reader.quoteRate(market))
      let rateImpact = fixed(0)
      let traderDeposit = fixed(0)

      if (bondAmount > 0n) {
        const previewShortResult = await readHyperdrive.previewOpenShort({
          amountOfBondsToShort: bondAmount!,
          asBase: true,
        })

        traderDeposit = fixed(previewShortResult.traderDeposit)

        rateImpact = fixed(previewShortResult.spotRateAfterOpen).sub(rateQuote)

        rateQuote = fixed(
          await reader.quoteRate(market, previewShortResult.spotRateAfterOpen)
        )
      }

      return {
        rateQuote,
        rateImpact,
        traderDeposit,
      }
    },
  })
}

export function BorrowFlow(props: BorrowFlowProps) {
  const decimals = props.market.loanToken.decimals

  const client = usePublicClient()
  const { address: account } = useAccount()
  const { data: walletClient } = useWalletClient()

  const [state, dispatch] = useReducer(reducer, {
    step: "buy",
    bondAmount: 0n,
    decimals: props.market.loanToken.decimals,
  })
  const [isOpen, setIsOpen] = useState(false)

  const { data: borrowFlowData, isLoading: borrowFlowDataLoading } =
    useBorrowFlowData(props.market, state.bondAmount)

  const { needsApproval, approve, allowance } = useApproval(
    props.market.loanToken.address,
    props.market.hyperdrive,
    borrowFlowData?.traderDeposit.bigint
  )

  const { value: durationValue, scale: durationScale } = formatTermLength(
    props.market.duration
  )
  const formattedDuration = durationValue + " " + durationScale

  const formattedRateQuote = borrowFlowData?.rateQuote
    ? borrowFlowData.rateQuote.format({
        decimals: 2,
        percent: true,
      })
    : undefined

  const formattedTotalDebt = fixed(props.position.totalDebt, decimals).format({
    decimals: 2,
  })

  const formattedCostOfCoverage = borrowFlowData?.traderDeposit
    ? fixed(
        borrowFlowData.traderDeposit,
        props.market.loanToken.decimals
      ).format({
        decimals: 2,
      }) +
      " " +
      props.market.loanToken.symbol
    : "0 " + props.market.loanToken.symbol

  const formattedRateImpact = borrowFlowData
    ? borrowFlowData.rateImpact.format({
        decimals: 2,
        percent: true,
      })
    : undefined

  const handleQuickAmountAction = (amount: FixedPoint) => {
    const input = document.getElementById("bondAmountInput") as HTMLInputElement
    input.value = amount.toString()

    dispatch({
      type: "bondAmountInput",
      payload: {
        amount: amount.toString(),
      },
    })
  }

  const transactionButtonDisabled = state.bondAmount === 0n

  const handleOpenShort = async () => {
    // early termination
    if (isNil(state.bondAmount) || isNil(walletClient) || isNil(client)) return
    if (state.bondAmount <= 0n) return
    if (!account) return

    const writeHyperdrive = new ReadWriteHyperdrive({
      address: props.market.hyperdrive,
      publicClient: client,
      walletClient,
    })

    await writeHyperdrive.openShort({
      args: {
        destination: account,
        minVaultSharePrice: 0n,
        maxDeposit: maxUint256,
        asBase: true,
        bondAmount: state.bondAmount,
        extraData: "0x",
      },
    })
  }

  const quickAmountValues = quickTokenAmountWeights.map((weight) => {
    const amount = fixed(props.position.totalDebt).mul(parseFixed(weight))

    return {
      weight,
      amount,
    }
  })

  return (
    <div className="m-auto flex w-full max-w-xl flex-col gap-8 bg-transparent">
      <MarketHeader market={props.market} />

      <Card>
        <CardHeader>
          <p className="gradient-text w-fit font-chakra text-h4 font-semibold">
            Buy Coverage
          </p>
        </CardHeader>
        <CardContent className="grid gap-8 rounded-xl bg-card">
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-secondary-foreground">Amount</p>
                <Button
                  variant="ghost"
                  className="h-min rounded-[4px] p-1 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground"
                >
                  <Settings size={16} />
                </Button>
              </div>

              <div className="flex items-center justify-between rounded-sm bg-popover font-mono text-[24px] focus-within:outline focus-within:outline-white/20">
                <input
                  className="h-full w-full grow rounded-sm border-none bg-popover p-4 font-mono text-[24px] [appearance:textfield] focus:border-none focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                  placeholder="0"
                  type="number"
                  id="bondAmountInput"
                  disabled={isNil(allowance)}
                  onChange={(e) => {
                    dispatch({
                      type: "bondAmountInput",
                      payload: {
                        amount: e.target.value ?? "0",
                      },
                    })
                  }}
                />

                <Badge className="m-2 flex h-6 items-center justify-center gap-1 border-none bg-accent p-2 py-4 font-sans font-medium hover:bg-none">
                  <img
                    src={props.market.loanToken.iconUrl}
                    className="size-4"
                  />{" "}
                  {props.market.loanToken.symbol}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-x-2">
                  {quickAmountValues.map((quickAction) => (
                    <Button
                      onClick={() =>
                        handleQuickAmountAction(quickAction.amount)
                      }
                      className={cn(
                        "h-min rounded-[4px] bg-accent p-1 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground",
                        {
                          "text-foreground/75 hover:text-foreground/75":
                            state.bondAmount === quickAction.amount.bigint,
                        }
                      )}
                    >
                      {quickAction.weight === 1
                        ? "Max"
                        : `${quickAction.weight * 100}%`}
                    </Button>
                  ))}
                </div>

                <p className="text-right text-sm text-secondary-foreground">
                  Total Debt: {formattedTotalDebt}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-secondary-foreground">Duration</p>
            <Select defaultValue={formattedDuration} disabled>
              <SelectTrigger className="h-12 w-full rounded-sm bg-accent text-lg">
                <SelectValue placeholder="Select term duration..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={formattedDuration}>
                  {formattedDuration}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2">
            <div className="flex flex-col gap-2 text-sm">
              <p className="text-secondary-foreground">Your Fixed Rate</p>
              <div className="space-y-1">
                {!!formattedRateQuote ? (
                  <p className="w-fit font-mono text-h4">
                    {formattedRateQuote}
                  </p>
                ) : (
                  <Skeleton className="h-[30px] w-[70px] rounded-sm bg-white/10" />
                )}
                {!!formattedRateImpact ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 text-xs text-secondary-foreground">
                        <p className="font-mono text-xs text-secondary-foreground">
                          Rate Impact {formattedRateImpact}
                        </p>
                        <Info className="text-secondary-foreground" size={14} />
                      </TooltipTrigger>

                      <TooltipContent className="max-w-64 space-y-4">
                        N/A
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                ) : (
                  <Skeleton className="h-[14px] rounded-sm bg-white/10" />
                )}
              </div>
            </div>

            <div className="flex flex-col items-end gap-2 text-sm">
              <p className="text-secondary-foreground">You Pay</p>
              <div className="space-y-1">
                {!borrowFlowDataLoading ? (
                  <p className="text-right font-mono text-h4">
                    {formattedCostOfCoverage}
                  </p>
                ) : (
                  <Skeleton className="h-[30px] rounded-sm bg-white/10" />
                )}
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center gap-1 text-xs text-secondary-foreground">
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
          </div>

          <div className="space-y-2">
            {needsApproval ? (
              <Button
                size="lg"
                className="h-12 w-full text-lg"
                disabled={transactionButtonDisabled}
                onClick={approve}
              >
                Approve {props.market.loanToken.symbol}
              </Button>
            ) : (
              <Button
                size="lg"
                className="h-12 w-full text-lg"
                disabled={transactionButtonDisabled}
                onClick={handleOpenShort}
              >
                Lock in your rate
              </Button>
            )}
          </div>

          <Separator />

          <Collapsible open={isOpen} onOpenChange={setIsOpen}>
            <CollapsibleTrigger className="-mt-2 flex w-full items-center text-start text-sm text-secondary-foreground">
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
        </CardContent>
      </Card>
    </div>
  )
}
