import { fixed, FixedPoint, parseFixed } from "@delvtech/fixed-point-wasm"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "components/base/collapsible"
import { Separator } from "components/base/separator"
import { Skeleton } from "components/base/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "components/base/tooltip"
import { Slider } from "components/base/ui/slider"
import SlippageSettings, {
  defaultSlippageAmount,
} from "components/forms/SlippageSettings"
import { cn } from "components/utils"
import { useApproval } from "hooks/base/useApproval"
import { useEtherscan } from "hooks/base/useEtherscan"
import { useBorrowRateQuote } from "hooks/borrow/useBorrowRateQuote"
import { useOpenShort } from "hooks/hyperdrive/useOpenShort"
import { isNil } from "lodash-es"
import { ArrowRight, ChevronDown, ExternalLink, Info } from "lucide-react"
import { useReducer, useState } from "react"
import { MorphoLogo } from "static/images/MorphoLogo"
import { match } from "ts-pattern"
import { formatTermLength } from "utils/formatTermLength"
import { Address } from "viem"
import { usePublicClient } from "wagmi"
import { Link } from "wouter"
import { BorrowPosition, Market, Position } from "../../types"

/**
 * Borrow flow local state
 *
 * @typedef {State}
 */
type State = {
  step: "buy" | "loading" | "receipt"
  decimals: number
  bondAmount: bigint
  slippage: bigint
  hash?: Address
}

type Action =
  | {
      type: "bondAmountInput"
      payload: {
        amount: string
      }
    }
  | {
      type: "transactionSent"
      payload: {
        hash: Address
      }
    }
  | {
      type: "transactionComplete"
      payload?: undefined
    }
  | {
      type: "slippageAmountChange"
      payload: {
        amount: bigint
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

    case "transactionSent": {
      return {
        ...state,
        step: "loading",
        hash: payload.hash,
      }
    }

    case "transactionComplete": {
      return {
        ...state,
        step: "receipt",
      }
    }

    case "slippageAmountChange": {
      return {
        ...state,
        slippage: payload.amount,
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
  activePosition: Position
}

export function BorrowFlow(props: BorrowFlowProps) {
  const client = usePublicClient()
  const decimals = props.market.loanToken.decimals

  const [state, dispatch] = useReducer(reducer, {
    step: "buy",
    bondAmount: 0n,
    decimals: props.market.loanToken.decimals,
    slippage: defaultSlippageAmount,
  })

  const { data: rateQuoteData } = useBorrowRateQuote(
    props.market,
    state.bondAmount
  )

  const {
    needsApproval,
    approve,
    allowance,
    isLoading: isApprovalLoading,
  } = useApproval(
    props.market.loanToken.address,
    props.market.hyperdrive,
    rateQuoteData ? rateQuoteData.traderDeposit.bigint : undefined,
    rateQuoteData
      ? rateQuoteData.traderDeposit.mul(parseFixed(0.05, decimals)).bigint
      : undefined
  )

  const { url } = useEtherscan(state.hash, "tx")

  // Slider state
  const percentCovered =
    fixed(props.activePosition.totalCoverage)
      .div(props.position.totalDebt)
      .toNumber() * 100
  const [sliderValue, setSliderValue] = useState(percentCovered)

  // Open short logic
  const { mutateAsync: openShort } = useOpenShort()
  const handleOpenShort = async () => {
    if (state.bondAmount <= 0 || !client || !rateQuoteData) return

    const hash = await openShort({
      bondAmount: state.bondAmount,
      hyperdrive: props.market.hyperdrive,
      rateQuote: rateQuoteData.quote.bigint,
    })

    if (hash) {
      dispatch({
        type: "transactionSent",
        payload: {
          hash,
        },
      })

      await client.waitForTransactionReceipt({
        hash,
      })

      dispatch({
        type: "transactionComplete",
      })
    }
  }

  // Computed values

  const { value: durationValue, scale: durationScale } = formatTermLength(
    props.market.duration
  )
  const formattedDuration = durationValue + " " + durationScale
  const formattedMaturityDate = new Date(
    Date.now() + Number(props.market.duration) * 1000
  )
  const formattedTotalDebt = fixed(props.position.totalDebt, decimals).format({
    decimals: 2,
  })
  const formattedRateQuote = rateQuoteData?.quote
    ? rateQuoteData.quote.format({
        decimals: 2,
        percent: true,
      })
    : undefined
  const formattedCostOfCoverage = rateQuoteData?.traderDeposit
    ? fixed(
        rateQuoteData.traderDeposit,
        props.market.loanToken.decimals
      ).format({
        decimals: 2,
      }) +
      " " +
      props.market.loanToken.symbol
    : undefined
  const formattedRateImpact = rateQuoteData
    ? rateQuoteData.quote.format({
        decimals: 2,
        percent: true,
      })
    : undefined
  const formattedProjectedMaxDebt = rateQuoteData
    ? fixed(state.bondAmount)
        .mul(FixedPoint.one().add(rateQuoteData.quote))
        .format({
          decimals: 4,
        })
    : undefined
  const transactionButtonDisabled = state.bondAmount === 0n

  const positionDetails = (
    <ul className="space-y-2">
      <li className="flex justify-between text-sm">
        <p className="text-secondary-foreground">Fixed Borrow Rate</p>

        {!isNil(formattedRateQuote) ? (
          <p className="w-fit font-mono">{formattedRateQuote}</p>
        ) : (
          <Skeleton className="h-[18px] w-[70px] rounded-sm bg-white/10" />
        )}
      </li>

      <li className="flex justify-between text-sm">
        <p className="text-secondary-foreground">Maturity Date</p>

        {!isNil(formattedMaturityDate) ? (
          <p className="font-mono">
            {formattedMaturityDate.toLocaleDateString()}
          </p>
        ) : (
          <Skeleton className="h-[18px] w-[70px] rounded-sm bg-white/10" />
        )}
      </li>

      <li className="flex justify-between text-sm">
        <p className="text-secondary-foreground">
          Projected Max Fixed Debt ({formattedDuration})
        </p>

        {!isNil(formattedProjectedMaxDebt) ? (
          <p className="font-mono">
            {formattedProjectedMaxDebt} {props.market.loanToken.symbol}
          </p>
        ) : (
          <Skeleton className="h-[18px] w-[70px] rounded-sm bg-white/10" />
        )}
      </li>
    </ul>
  )

  return (
    <Card className="animate-fade m-auto w-full max-w-lg">
      {state.step === "buy" && (
        <CardHeader>
          <p className="gradient-text text-ice w-fit font-chakra text-h4 font-semibold">
            Convert to Fixed Rate
          </p>
        </CardHeader>
      )}

      {match(state.step)
        .with("buy", () => (
          <CardContent className="grid gap-8 rounded-xl bg-card">
            {/* Form */}
            <div className="space-y-4">
              <div className="grid gap-6 rounded-lg bg-accent p-6">
                <div className="flex justify-between">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        <img
                          src={props.market.collateralToken.iconUrl}
                          height={24}
                          width={24}
                          alt={`${props.market.collateralToken.symbol} token symbol`}
                        />
                        <img
                          src={props.market.loanToken.iconUrl}
                          className="-ml-2"
                          height={24}
                          width={24}
                          alt={`${props.market.loanToken.symbol} token symbol`}
                        />
                      </div>

                      <h2 className="font-chakra text-h4 font-medium">
                        {props.market.collateralToken.symbol} /{" "}
                        {props.market.loanToken.symbol}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge
                        variant="secondary"
                        className="bg-secondary font-mono text-xs"
                      >
                        <MorphoLogo />
                        Morpho
                      </Badge>

                      <Badge
                        variant="secondary"
                        className="bg-secondary font-mono text-xs"
                      >
                        LTV: 86%
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <p className="text-sm text-secondary-foreground">
                      Current Loan
                    </p>
                    <p className="font-mono">
                      {formattedTotalDebt} {props.market.loanToken.symbol}
                    </p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary-foreground">
                      Loan Amount to Fix
                    </p>
                    <SlippageSettings
                      amount={state.slippage}
                      onChange={(slippage) =>
                        dispatch({
                          type: "slippageAmountChange",
                          payload: {
                            amount: slippage,
                          },
                        })
                      }
                    />
                  </div>

                  <div className="flex items-center justify-between rounded-sm bg-secondary font-mono text-[24px] focus-within:outline focus-within:outline-white/20">
                    <input
                      className="h-full w-full grow rounded-sm border-none bg-secondary p-4 font-mono text-[24px] [appearance:textfield] focus:border-none focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                      placeholder="0"
                      type="number"
                      id="bondAmountInput"
                      disabled={isNil(allowance)}
                      value={fixed(state.bondAmount, decimals).format({
                        group: false,
                        trailingZeros: false,
                      })}
                      step="any"
                      min={0}
                      /** Prevents scrolling from changing the input  */
                      onWheel={(e) => e.currentTarget.blur()}
                      onPaste={(e) => {
                        const clipboardData = e.clipboardData
                        const pastedData = parseFloat(
                          clipboardData.getData("text")
                        )

                        try {
                          if (pastedData < 0) throw new Error()

                          fixed(pastedData, decimals)
                        } catch {
                          e.preventDefault()
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "-" || e.key === "+") {
                          e.preventDefault()
                        }
                      }}
                      onChange={(e) => {
                        try {
                          // sanitize input
                          const value = parseFixed(
                            e.currentTarget.value,
                            decimals
                          )
                          dispatch({
                            type: "bondAmountInput",
                            payload: {
                              amount: e.target.value ?? "0",
                            },
                          })

                          const totalShortedBonds =
                            props.activePosition.totalCoverage + value.bigint
                          const percent = fixed(
                            totalShortedBonds,
                            decimals
                          ).div(props.position.totalDebt, decimals)

                          setSliderValue(Math.floor(percent.toNumber() * 100))
                        } catch {
                          e.preventDefault()
                        }
                      }}
                    />

                    <Badge className="m-4 flex h-6 items-center justify-center gap-1 border-none bg-secondary p-2 py-4 font-sans font-medium hover:bg-none">
                      <img
                        src={props.market.loanToken.iconUrl}
                        className="size-4"
                      />{" "}
                      {props.market.loanToken.symbol}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <p className="text-sm text-secondary-foreground">
                      Percent of Loan to Fix
                    </p>
                    <p className="text-sm">{Math.floor(sliderValue)}%</p>
                  </div>

                  <Slider
                    onValueCommit={([value]) => {
                      const valueFP = parseFixed(
                        value / 100,
                        props.market.loanToken.decimals
                      )
                      const shortsToAdd = fixed(valueFP)
                        .mul(props.position.totalDebt, decimals)
                        .toString()

                      dispatch({
                        type: "bondAmountInput",
                        payload: {
                          amount: shortsToAdd,
                        },
                      })
                    }}
                    value={[Math.floor(sliderValue)]}
                    onValueChange={([value]) => {
                      if (value <= Math.floor(percentCovered)) return
                      setSliderValue(value)
                    }}
                    className="h-0.5"
                    max={100}
                    min={0}
                    step={1}
                  />
                </div>
              </div>
            </div>

            {/* Stats row */}
            {!rateQuoteData?.error && (
              <div className="grid grid-cols-3">
                <div className="grid gap-1 text-sm">
                  <p className="text-secondary-foreground">Your Deposit</p>
                  <div className="space-y-1">
                    {formattedCostOfCoverage ? (
                      <p className="animate-fadeFast font-mono text-h4">
                        {formattedCostOfCoverage}
                      </p>
                    ) : (
                      <Skeleton className="h-[30px] rounded-sm bg-white/10" />
                    )}
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1 text-xs text-secondary-foreground">
                          <p>What am I paying for?</p>
                          <Info
                            className="text-secondary-foreground"
                            size={14}
                          />
                        </TooltipTrigger>

                        <TooltipContent className="grid max-w-64 grid-rows-2 gap-4 border border-secondary p-4">
                          <p>
                            Part of the fixed interest is paid upfront. This
                            payment is factored into your fixed rate quote.
                          </p>

                          <p>
                            Learn more about converting your loan from a
                            variable rate to a fixed rate, in the docs.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                </div>

                <ArrowRight className="text-ice m-auto" />

                <div className="grid justify-items-end gap-1 text-sm">
                  <p className="text-secondary-foreground">
                    Locks in Fixed Rate
                  </p>

                  {formattedRateQuote ? (
                    <p className="animate-fadeFast font-mono text-h4">
                      {formattedRateQuote}
                    </p>
                  ) : (
                    <Skeleton className="h-[30px] w-[70px] rounded-sm bg-white/10" />
                  )}

                  {formattedRateImpact ? (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="animate-fadeFast flex items-center gap-1 text-xs text-secondary-foreground">
                          <p className="font-mono text-xs text-secondary-foreground">
                            Rate Impact {formattedRateImpact}
                          </p>
                          <Info
                            className="text-secondary-foreground"
                            size={14}
                          />
                        </TooltipTrigger>

                        <TooltipContent className="border border-secondary p-4">
                          <p>
                            The impact your position will have on this market’s
                            fixed rate.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  ) : (
                    <Skeleton className="h-[14px] w-[130px] rounded-sm bg-white/10" />
                  )}
                </div>
              </div>
            )}

            {/* Button */}
            <div className="space-y-2">
              {state.bondAmount === 0n ? (
                <Button size="lg" className="h-12 w-full text-lg" disabled>
                  Enter an amount
                </Button>
              ) : sliderValue > 100 ? (
                <Button
                  size="lg"
                  className="h-12 w-full text-lg"
                  disabled
                  // TODO reset to 100%
                  // onClick={handleOpenShort}
                >
                  Input exceeds total debt
                </Button>
              ) : needsApproval ? (
                <Button
                  size="lg"
                  className={cn("h-12 w-full text-lg disabled:opacity-100", {
                    "animate-pulse": isApprovalLoading,
                  })}
                  disabled={isApprovalLoading}
                  onClick={() => approve()}
                >
                  {isApprovalLoading ? "Approving" : "Approve"}{" "}
                  {props.market.loanToken.symbol} {isApprovalLoading && "..."}
                </Button>
              ) : rateQuoteData?.error ? (
                <Button
                  size="lg"
                  className="h-12 w-full text-lg"
                  disabled
                  onClick={handleOpenShort}
                >
                  {rateQuoteData.error}
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

            <Collapsible defaultOpen={false}>
              <CollapsibleTrigger className="-mt-2 flex w-full items-center text-start text-sm font-semibold text-secondary-foreground">
                Details
                <ChevronDown className="ml-auto inline h-4 w-4 text-secondary-foreground" />
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4 space-y-4">
                {positionDetails}
              </CollapsibleContent>
            </Collapsible>
          </CardContent>
        ))
        .with("loading", () => (
          <CardContent className="animate-fade grid gap-8 rounded-xl bg-card pt-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-min rounded-full bg-accent p-4">
                <svg
                  className="animate-spin"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 1.43099e-07C18.6274 2.2213e-07 24 5.37258 24 12C24 18.6274 18.6274 24 12 24C5.37258 24 6.40674e-08 18.6274 1.43099e-07 12C2.2213e-07 5.37258 5.37258 6.40674e-08 12 1.43099e-07ZM12 20.04C16.4404 20.04 20.04 16.4404 20.04 12C20.04 7.55963 16.4404 3.96 12 3.96C7.55963 3.96 3.96 7.55963 3.96 12C3.96 16.4404 7.55963 20.04 12 20.04Z"
                    fill="url(#paint0_angular_153_1604)"
                  />

                  <defs>
                    <radialGradient
                      id="paint0_angular_153_1604"
                      cx="0"
                      cy="0"
                      r="1.25"
                      gradientUnits="userSpaceOnUse"
                      gradientTransform="translate(36 36) scale(36)"
                    >
                      <stop stopColor="#15ffab" />
                      <stop offset="1" stopColor="#14D0F9" stopOpacity="0.4" />
                    </radialGradient>
                  </defs>
                </svg>
              </div>

              <h5 className="font-chakra font-medium">
                Transaction Pending...
              </h5>

              <a href={url} target="_blank" rel="noopener noreferrer">
                <p className="flex items-center gap-1 text-sm text-skyBlue hover:underline">
                  View on Explorer <ExternalLink size={14} />
                </p>
              </a>
            </div>

            <Separator />

            <div className="space-y-2">
              <p className="font-medium">Summary</p>

              {positionDetails}
            </div>
          </CardContent>
        ))
        .with("receipt", () => (
          <CardContent className="animate-fade grid gap-8 rounded-xl bg-card pt-6">
            <div className="flex flex-col items-center space-y-2">
              <div className="w-min rounded-full bg-accent p-4">
                <svg
                  width="26"
                  height="24"
                  viewBox="0 0 26 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    clipRule="evenodd"
                    d="M24.5908 4.79934L9.78382 19.5307L1.40967 11.1993L2.54685 10.068L9.78382 17.268L23.4537 3.66797L24.5908 4.79934Z"
                    fill="#36D399"
                  />
                </svg>
              </div>

              <h5 className="font-chakra font-medium">
                Transaction confirmed...
              </h5>

              <a href={url} target="_blank" rel="noopener noreferrer">
                <p className="flex items-center gap-1 text-sm text-skyBlue hover:underline">
                  View on Explorer <ExternalLink size={14} />
                </p>
              </a>
            </div>
            <div className="space-y-2">
              <p className="font-medium">Summary</p>

              {positionDetails}
            </div>

            <div className="w-full space-y-2">
              <Button className="w-full" asChild>
                <Link href={`/`}>View Position</Link>
              </Button>

              <Button variant="secondary" className="w-full" asChild>
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </CardContent>
        ))
        .exhaustive()}
    </Card>
  )
}
