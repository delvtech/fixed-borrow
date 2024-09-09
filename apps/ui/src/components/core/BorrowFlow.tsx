import { fixed, FixedPoint, parseFixed } from "@delvtech/fixed-point-wasm"
import { ReadHyperdrive, ReadWriteHyperdrive } from "@delvtech/hyperdrive-viem"
import { useMutation, useQuery } from "@tanstack/react-query"
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
import SlippageSettings, {
  defaultSlippageAmount,
} from "components/forms/SlippageSettings"
import { MarketHeader } from "components/markets/MarketHeader"
import { cn } from "components/utils"
import { useApproval } from "hooks/base/useApproval"
import { MorphoMarketReader } from "lib/markets/MorphoMarketReader"
import { isNil } from "lodash-es"
import { ChevronDown, ExternalLink, Info } from "lucide-react"
import { useReducer, useState } from "react"
import { match } from "ts-pattern"
import { formatTermLength } from "utils/formatTermLength"
import { Address, maxUint256 } from "viem"
import { useAccount, useChainId, usePublicClient, useWalletClient } from "wagmi"
import { Link } from "wouter"
import { SupportedChainId } from "~/constants"
import { BorrowPosition, Market } from "../../types"

const quickTokenAmountWeights = [0.25, 0.5, 0.75, 1] as const

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
}

function useBorrowFlowData(market: Market, bondAmount: bigint) {
  const client = usePublicClient()
  const chainId = useChainId()

  const shouldEnable = () => {
    return !!client && !isNil(bondAmount)
  }

  return useQuery({
    queryKey: [
      "fixed-borrowing-cost",
      bondAmount.toString(),
      market.hyperdrive,
      chainId,
    ],
    enabled: shouldEnable(),

    queryFn: async () => {
      const readHyperdrive = new ReadHyperdrive({
        address: market.hyperdrive,
        publicClient: client!,
      })

      const reader = new MorphoMarketReader(
        client!,
        chainId as SupportedChainId
      )

      const maxShort = await readHyperdrive.getMaxShort()
      let rateQuote = fixed(await reader.quoteRate(market))
      let rateImpact = fixed(0)
      let traderDeposit = fixed(0)
      let error: string | null = null

      if (bondAmount > 0n) {
        try {
          const previewShortResult = await readHyperdrive.previewOpenShort({
            amountOfBondsToShort: bondAmount!,
            asBase: true,
          })

          traderDeposit = fixed(previewShortResult.traderDeposit)

          const rateQuoteAfterOpen = await reader.quoteRate(
            market,
            previewShortResult.spotRateAfterOpen
          )

          rateImpact = fixed(rateQuoteAfterOpen).sub(rateQuote)

          rateQuote = fixed(
            await reader.quoteRate(market, previewShortResult.spotRateAfterOpen)
          )
        } catch (e) {
          if (e instanceof Error) {
            if (e.message.includes("MinimumTransactionAmount")) {
              error = "Amount too small"
            }

            const maxBaseIn = maxShort.maxBaseIn

            if (maxBaseIn < bondAmount) {
              error = "Not Enough Liquidity"
            }
          } else {
            // Placeholder for unidentified error
            error = "Error"
          }
        }
      }

      return {
        rateQuote,
        rateImpact,
        traderDeposit,
        error,
      }
    },
  })
}

function useOpenShort() {
  const client = usePublicClient()
  const { address: account } = useAccount()
  const { data: walletClient } = useWalletClient()

  return useMutation({
    mutationFn: async (vars: { bondAmount: bigint; hyperdrive: Address }) => {
      // early termination
      if (isNil(vars.bondAmount) || isNil(walletClient) || isNil(client)) return
      if (vars.bondAmount <= 0n) return
      if (!account) return

      const writeHyperdrive = new ReadWriteHyperdrive({
        address: vars.hyperdrive,
        publicClient: client,
        walletClient,
      })

      return await writeHyperdrive.openShort({
        args: {
          destination: account,
          minVaultSharePrice: 0n,
          maxDeposit: maxUint256,
          asBase: true,
          bondAmount: vars.bondAmount,
          extraData: "0x",
        },
      })
    },
  })
}

export function BorrowFlow(props: BorrowFlowProps) {
  const decimals = props.market.loanToken.decimals

  const client = usePublicClient()

  const [state, dispatch] = useReducer(reducer, {
    step: "buy",
    bondAmount: 0n,
    decimals: props.market.loanToken.decimals,
    slippage: defaultSlippageAmount,
  })
  const [isOpen, setIsOpen] = useState(false)

  const { data: borrowFlowData, isLoading: borrowFlowDataLoading } =
    useBorrowFlowData(props.market, state.bondAmount)

  const { needsApproval, approve, allowance } = useApproval(
    props.market.loanToken.address,
    props.market.hyperdrive,
    borrowFlowData?.traderDeposit.bigint
  )

  const { mutateAsync: openShort } = useOpenShort()
  const handleOpenShort = async () => {
    if (state.bondAmount <= 0 || !client) return

    const hash = await openShort({
      bondAmount: state.bondAmount,
      hyperdrive: props.market.hyperdrive,
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

  const { value: durationValue, scale: durationScale } = formatTermLength(
    props.market.duration
  )
  const formattedDuration = durationValue + " " + durationScale
  const formattedMaturityDate = new Date(
    Date.now() + Number(props.market.duration) * 1000
  )

  // const formattedCurrentBorrowRate = fixed(props.position.currentRate).format({
  //   decimals: 2,
  //   percent: true,
  // })

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
    : undefined

  const formattedRateImpact = borrowFlowData
    ? borrowFlowData.rateImpact.format({
        decimals: 2,
        percent: true,
      })
    : undefined

  const formattedProjectedMaxDebt = borrowFlowData
    ? fixed(state.bondAmount)
        .mul(FixedPoint.one().add(borrowFlowData.rateQuote))
        .format({
          decimals: 4,
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

  const quickAmountValues = quickTokenAmountWeights.map((weight) => {
    const amount = fixed(props.position.totalDebt).mul(parseFixed(weight))

    return {
      weight,
      amount,
    }
  })

  const positionDetails = (
    <>
      {" "}
      <div className="flex justify-between text-sm">
        <p className="text-secondary-foreground">Fixed Borrow Rate</p>
        {!isNil(formattedRateQuote) ? (
          <p className="w-fit font-mono">{formattedRateQuote}</p>
        ) : (
          <Skeleton className="h-[18px] w-[70px] rounded-sm bg-white/10" />
        )}
      </div>
      {/* <div className="flex justify-between text-sm">
  <p className="text-secondary-foreground">
    Current Borrow APY (Morpho)
  </p>
  <p className="font-mono">{formattedCurrentBorrowRate}</p>
</div> */}
      <div className="flex justify-between text-sm">
        <p className="text-secondary-foreground">Maturity Date</p>
        {!isNil(formattedMaturityDate) ? (
          <p className="font-mono">
            {formattedMaturityDate.toLocaleDateString()}
          </p>
        ) : (
          <Skeleton className="h-[18px] w-[70px] rounded-sm bg-white/10" />
        )}
      </div>
      <div className="flex justify-between text-sm">
        <p className="text-secondary-foreground">
          Projected Max Fixed Debt ({formattedDuration})
        </p>
        <p className="font-mono">
          {!isNil(formattedProjectedMaxDebt) ? (
            <p>
              {formattedProjectedMaxDebt} {props.market.loanToken.symbol}
            </p>
          ) : (
            <Skeleton className="h-[18px] w-[70px] rounded-sm bg-white/10" />
          )}
        </p>
      </div>
    </>
  )

  return (
    <div className="m-auto flex w-full max-w-xl flex-col gap-8 bg-transparent">
      <MarketHeader market={props.market} />

      <Card>
        {state.step === "buy" && (
          <CardHeader>
            <p className="gradient-text w-fit font-chakra text-h4 font-semibold">
              Buy Coverage
            </p>
          </CardHeader>
        )}

        {match(state.step)
          .with("buy", () => (
            <CardContent className="grid gap-8 rounded-xl bg-card">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary-foreground">Amount</p>
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
                          key={`quick-action-${quickAction.weight}`}
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

              {!borrowFlowData?.error && (
                <div className="grid grid-cols-2">
                  <div className="flex flex-col gap-2 text-sm">
                    <p className="text-secondary-foreground">Your Fixed Rate</p>
                    <div className="space-y-1">
                      {!isNil(formattedRateQuote) ? (
                        <p className="w-fit font-mono text-h4">
                          {formattedRateQuote}
                        </p>
                      ) : (
                        <Skeleton className="h-[30px] w-[70px] rounded-sm bg-white/10" />
                      )}
                      {formattedRateImpact ? (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="flex items-center gap-1 text-xs text-secondary-foreground">
                              <p className="font-mono text-xs text-secondary-foreground">
                                Rate Impact {formattedRateImpact}
                              </p>
                              <Info
                                className="text-secondary-foreground"
                                size={14}
                              />
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
                            <Info
                              className="text-secondary-foreground"
                              size={14}
                            />
                          </TooltipTrigger>

                          <TooltipContent className="max-w-64 space-y-4">
                            N/A
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              )}

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
                ) : borrowFlowData?.error ? (
                  <Button
                    size="lg"
                    className="h-12 w-full text-lg"
                    disabled
                    onClick={handleOpenShort}
                  >
                    {borrowFlowData.error}
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
            <CardContent className="grid gap-8 rounded-xl bg-card pt-6">
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
                        <stop
                          offset="1"
                          stopColor="#14D0F9"
                          stopOpacity="0.4"
                        />
                      </radialGradient>
                    </defs>
                  </svg>
                </div>

                <h5 className="font-chakra font-medium">
                  Transaction Pending...
                </h5>

                <a
                  href="https://www.etherscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className="flex items-center gap-1 text-sm text-skyBlue hover:underline">
                    View on Explorer <ExternalLink size={14} />
                  </p>
                </a>
              </div>

              <p className="font-medium">Summary</p>

              {positionDetails}
            </CardContent>
          ))
          .with("receipt", () => (
            <CardContent className="grid gap-8 rounded-xl bg-card pt-6">
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

                <a
                  href="https://www.etherscan.com"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <p className="flex items-center gap-1 text-sm text-skyBlue hover:underline">
                    View on Explorer <ExternalLink size={14} />
                  </p>
                </a>
              </div>
              <p className="font-medium">Summary</p>

              {positionDetails}

              <div className="w-full space-y-2">
                <Link href="/positions" asChild>
                  <Button className="w-full">View My Position</Button>
                </Link>

                <Link href="/" asChild>
                  <Button variant="secondary" className="w-full">
                    Close Receipt
                  </Button>
                </Link>
              </div>
            </CardContent>
          ))
          .exhaustive()}
      </Card>
    </div>
  )
}
