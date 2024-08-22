import { fixed, parseFixed } from "@delvtech/fixed-point-wasm"
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
import { useApproval } from "hooks/base/useApproval"
import { useBorrowRateQuote } from "hooks/borrow/useBorrowRateQuote"
import { isNil } from "lodash-es"
import { ChevronDown, Info, Settings } from "lucide-react"
import { useReducer, useState } from "react"
import { formatTermLength } from "utils/formatTermLength"
import { maxUint256 } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"
import { BorrowPosition, Market } from "../../types"

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

  const { data: rateQuote } = useBorrowRateQuote(props.market)

  const { data: costOfCoverage, isLoading: costOfCoverageLoading } = useQuery({
    queryKey: [
      "cost-coverage",
      state.bondAmount.toString(),
      props.market.hyperdrive,
    ],
    queryFn: async () => {
      const readHyperdrive = new ReadHyperdrive({
        address: props.market.hyperdrive,
        publicClient: client!,
      })

      const maxShort = await readHyperdrive.getMaxShort()

      if (maxShort.maxBondsOut < state.bondAmount!)
        console.warn("Not enough liquidity")

      return readHyperdrive.previewOpenShort({
        amountOfBondsToShort: state.bondAmount!,
        asBase: true,
      })
    },
    enabled: !!client && !!state.bondAmount,
  })
  const { data: rateQuoteAfterOpen } = useBorrowRateQuote(
    props.market,
    costOfCoverage?.spotRateAfterOpen
  )

  const { needsApproval, approve, allowance } = useApproval(
    props.market.loanToken.address,
    props.market.hyperdrive,
    costOfCoverage?.traderDeposit
  )

  const { value: durationValue, scale: durationScale } = formatTermLength(
    props.market.duration
  )
  const formattedDuration = durationValue + " " + durationScale

  const pickRateQuoteValue = () => {
    if (state.bondAmount === 0n) {
      // return the spot rate
      return rateQuote
    } else {
      return rateQuoteAfterOpen
    }
  }
  const pickedRateQuote = pickRateQuoteValue()
  const formattedNetRate = pickedRateQuote
    ? fixed(pickedRateQuote, 16).format({
        decimals: 2,
      }) + "%"
    : undefined

  const formattedTotalDebt = fixed(props.position.totalDebt, decimals).format({
    decimals: 2,
  })

  const formattedCostOfCoverage = costOfCoverage?.traderDeposit
    ? fixed(
        costOfCoverage.traderDeposit,
        props.market.loanToken.decimals
      ).format({
        decimals: 2,
      }) +
      " " +
      props.market.loanToken.symbol
    : "0 " + props.market.loanToken.symbol

  const computeRateImpact = () => {
    if (state.bondAmount === 0n) {
      return "0.00%"
    }

    if (rateQuote && rateQuoteAfterOpen && rateQuoteAfterOpen > rateQuote) {
      return (
        "+" +
        fixed(rateQuoteAfterOpen)
          .sub(fixed(rateQuote))
          .mul(parseFixed(100))
          .format({
            decimals: 2,
          }) +
        "%"
      )
    }
  }
  const rateImpact = computeRateImpact()

  // TODO
  const handleQuickTokenInput: React.MouseEventHandler<
    HTMLButtonElement
  > = () => {
    // const weight = Number(event.currentTarget.value)
    // const totalDebt = fixed(borrowPositionDebt).mul(parseFixed(weight))
    // // setAmount(totalDebt.toString())
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

                <Badge className="m-2 flex h-6 items-center gap-1 border-none bg-accent p-2 py-4 font-sans font-medium hover:bg-none">
                  <img
                    src={props.market.loanToken.iconUrl}
                    className="size-4"
                  />{" "}
                  {props.market.loanToken.symbol}
                </Badge>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex gap-x-2">
                  <Button
                    value={0.25}
                    onClick={handleQuickTokenInput}
                    className="h-min rounded-[4px] bg-accent p-1 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground"
                  >
                    25%
                  </Button>
                  <Button
                    value={0.5}
                    onClick={handleQuickTokenInput}
                    className="h-min rounded-[4px] bg-accent p-1 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground"
                  >
                    50%
                  </Button>
                  <Button
                    value={0.75}
                    onClick={handleQuickTokenInput}
                    className="h-min rounded-[4px] bg-accent p-1 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground"
                  >
                    75%
                  </Button>
                  <Button
                    value={1}
                    onClick={handleQuickTokenInput}
                    className="h-min rounded-[4px] bg-accent p-1 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground"
                  >
                    MAX
                  </Button>
                </div>

                <p className="text-sm text-secondary-foreground">
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
                {!!formattedNetRate ? (
                  <p className="w-fit font-mono text-h4">{formattedNetRate}</p>
                ) : (
                  <Skeleton className="h-[30px] w-[70px] rounded-sm bg-white/10" />
                )}
                {!!rateImpact ? (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger className="flex items-center gap-1 text-xs text-secondary-foreground">
                        <p className="font-mono text-xs text-secondary-foreground">
                          Rate Impact {rateImpact}
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
                {!costOfCoverageLoading ? (
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
                className="h-12 w-full text-lg font-normal"
                disabled={transactionButtonDisabled}
                onClick={approve}
              >
                Approve {props.market.loanToken.symbol}
              </Button>
            ) : (
              <Button
                size="lg"
                className="h-12 w-full text-lg font-normal"
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
