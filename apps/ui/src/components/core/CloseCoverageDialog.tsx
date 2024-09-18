import { fixed, FixedPoint, parseFixed } from "@delvtech/fixed-point-wasm"
import { OpenShort, ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { DialogProps } from "@radix-ui/react-dialog"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
} from "components/base/dialog"
import { Progress } from "components/base/progress"
import SlippageSettings, {
  defaultSlippageAmount,
} from "components/forms/SlippageSettings"
import { MarketHeader } from "components/markets/MarketHeader"
import { cn } from "components/utils"
import { useCloseShort } from "hooks/hyperdrive/useCloseShort"
import { isNil } from "lodash-es"
import { ExternalLink } from "lucide-react"
import { useReducer, useState } from "react"
import { Market } from "src/types"
import { match } from "ts-pattern"
import { formatTermLength } from "utils/formatTermLength"
import { Address } from "viem"
import { useAccount, useChainId, usePublicClient } from "wagmi"

const quickTokenAmountWeights = [0.25, 0.5, 0.75, 1] as const

function useCloseCoverageData(
  market: Market,
  short: OpenShort,
  shortAmount?: bigint
) {
  const client = usePublicClient()
  const chainId = useChainId()

  return useQuery({
    queryKey: [
      "close-coverage-data",
      short?.assetId.toString(),
      shortAmount?.toString(),
      market.hyperdrive,
      chainId,
    ],
    enabled: !!client,
    queryFn: async () => {
      const readHyperdrive = new ReadHyperdrive({
        address: market.hyperdrive,
        publicClient: client!,
      })

      let error: string | null = null

      let amountOut = 0n
      let flatPlusCurveFee = 0n

      if (isNil(shortAmount)) return { amountOut, flatPlusCurveFee, error }

      if (shortAmount > 0n) {
        try {
          const closeShortData = await readHyperdrive.previewCloseShort({
            maturityTime: short.maturity,
            shortAmountIn: shortAmount,
            asBase: true,
          })

          amountOut = closeShortData.amountOut
          flatPlusCurveFee = closeShortData.flatPlusCurveFee
        } catch (e) {
          if (e instanceof Error) {
            if (e.message.includes("MinimumTransactionAmount")) {
              error = "Amount too small"
            } else if (
              e.message.includes("InsufficientLiquidity: Negative Interest")
            ) {
              error = "Not Enough Liquidity"
            }
          }
        }
      }

      return { amountOut, flatPlusCurveFee, error }
    },
  })
}

interface CloseCoverageDialogProps extends DialogProps {
  market: Market
  short: OpenShort
}

type State = {
  step: "close" | "pending" | "receipt"
  // decimals: number
  // bondAmount: bigint
  // slippage: bigint
  hash?: Address
}

type Action =
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
      type: "reset"
      payload?: undefined
    }
//   | {
//       type: "slippageAmountChange"
//       payload: {
//         amount: bigint
//       }
//     }

const reducer = (state: State, action: Action): State => {
  const { type, payload } = action

  switch (type) {
    //   case "bondAmountInput": {
    //     const parsedAmount = parseFixed(payload.amount, state.decimals).bigint

    //     return {
    //       ...state,
    //       bondAmount: parsedAmount,
    //     }
    //   }

    case "transactionSent": {
      return {
        ...state,
        step: "pending",
        hash: payload.hash,
      }
    }

    case "transactionComplete": {
      return {
        ...state,
        step: "receipt",
      }
    }

    case "reset": {
      return {
        step: "close",
      }
    }

    //   case "slippageAmountChange": {
    //     return {
    //       ...state,
    //       slippage: payload.amount,
    //     }
    //   }

    default: {
      return state
    }
  }
}

export function CloseCoverageDialog(props: CloseCoverageDialogProps) {
  const { address: account } = useAccount()
  const client = usePublicClient()
  const queryClient = useQueryClient()

  const symbol = props.market.loanToken.symbol
  const decimals = props.market.loanToken.decimals

  const totalShortAmount = fixed(props.short.bondAmount)
  const [shortAmountInput, setShortAmountInput] = useState<bigint>()

  const [slippage, setSlippage] = useState(defaultSlippageAmount)

  const [state, dispatch] = useReducer(reducer, {
    step: "close",
  })

  const { data: closeCoverageData } = useCloseCoverageData(
    props.market,
    props.short,
    shortAmountInput
  )
  const formattedAmountOut = closeCoverageData
    ? fixed(closeCoverageData.amountOut, decimals).format({
        decimals: 2,
        trailingZeros: false,
      })
    : undefined
  const formattedFees = closeCoverageData
    ? fixed(closeCoverageData.flatPlusCurveFee, decimals).format({
        decimals: 2,
        trailingZeros: false,
      })
    : undefined

  const { mutateAsync: closeShort } = useCloseShort()
  const handleCloseShort = async () => {
    if (isNil(shortAmountInput) || !account || !client || !closeCoverageData)
      return

    const hash = await closeShort({
      hyperdrive: props.market.hyperdrive,
      shortOptions: {
        maturityTime: props.short.maturity,
        bondAmountIn: shortAmountInput,
        // TODO implement slippage controls
        minAmountOut: fixed(closeCoverageData?.amountOut).mulDown(
          FixedPoint.one().sub(slippage)
        ).bigint,
        destination: account,
      },
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

      await queryClient.invalidateQueries()
    }
  }

  const quickAmountValues = quickTokenAmountWeights.map((weight) => {
    // const amount = fixed(props.position.totalDebt).mul(parseFixed(weight))
    const amount = fixed(totalShortAmount).mul(parseFixed(weight))

    return {
      weight,
      amount,
    }
  })

  // const [isDetailsOpen, setIsDetailsOpen] = useState(false)

  const { formatted: formattedDuration } = formatTermLength(
    props.market.duration
  )

  const currentTimeSeconds = BigInt(Math.round(Date.now() / 1000))

  const timeLeftSeconds = props.short.maturity - currentTimeSeconds
  const { formatted: formattedTimeLeft } = formatTermLength(timeLeftSeconds)
  /** Represented as a number from zero to one hundred */
  const percentMatured =
    (Number(currentTimeSeconds - props.short.openedTimestamp) /
      Number(props.market.duration)) *
    100

  const formattedBondAmount = fixed(props.short.bondAmount).format({
    decimals: 2,
    trailingZeros: false,
  })

  const handleShortAmountInput = (amount: string) => {
    const parsed = parseFixed(amount, decimals)

    setShortAmountInput(parsed.bigint)
  }

  const handleQuickAmountAction = (amount: FixedPoint) => {
    const input = document.getElementById(
      "shortAmountInput"
    ) as HTMLInputElement
    input.value = amount.format({
      trailingZeros: false,
      group: false,
    })

    handleShortAmountInput(input.value)
  }

  const executeButtonDisabled =
    shortAmountInput === 0n || isNil(shortAmountInput) || !closeCoverageData

  return (
    <Dialog {...props}>
      {match(state.step)
        .with("close", () => {
          return (
            <DialogContent aria-describedby={undefined}>
              <DialogTitle asChild>
                <h4 className="gradient-text w-fit font-chakra !text-h4 font-semibold">
                  Remove Coverage
                </h4>
              </DialogTitle>

              <div className="space-y-8">
                <div className="space-y-6 rounded-lg bg-gradient-to-b from-background to-[#010713] p-4">
                  <MarketHeader
                    market={props.market}
                    className="text-h5 font-normal"
                  />

                  <div className="flex justify-between">
                    <div className="flex flex-col gap-1 whitespace-nowrap">
                      <p className="text-sm text-secondary-foreground">
                        Duration
                      </p>
                      <p className="font-chakra text-lg font-medium">
                        {formattedDuration}
                      </p>
                    </div>

                    {/* TODO */}
                    <div className="flex flex-col gap-1 whitespace-nowrap">
                      <p className="text-sm text-secondary-foreground">
                        Fixed Rate
                      </p>
                      <p className="font-chakra text-lg font-medium">10.70%</p>
                    </div>

                    <div className="flex flex-col gap-1 whitespace-nowrap">
                      <p className="text-sm text-secondary-foreground">
                        Amount
                      </p>
                      <p className="font-chakra text-lg font-medium">
                        {formattedBondAmount} {symbol}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-sm text-secondary-foreground">
                      <p className="text-secondary-foreground">Matures</p>
                      <p className="font-chakra font-medium text-foreground">
                        {formattedTimeLeft} left
                      </p>
                    </div>
                    <Progress
                      value={percentMatured}
                      className="h-1 bg-accent"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-secondary-foreground">
                        Amount
                      </p>
                      <SlippageSettings
                        amount={slippage}
                        onChange={setSlippage}
                      />
                    </div>

                    <div className="flex items-center justify-between rounded-sm bg-popover font-mono text-[24px] focus-within:outline focus-within:outline-white/20">
                      <input
                        className="h-full w-full grow rounded-sm border-none bg-popover p-4 font-mono text-[24px] [appearance:textfield] focus:border-none focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
                        placeholder="0"
                        type="number"
                        min={0}
                        step={1}
                        id="shortAmountInput"
                        onChange={({ target }) =>
                          handleShortAmountInput(target.value)
                        }
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
                                  shortAmountInput ===
                                  quickAction.amount.bigint,
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
                        Max:{" "}
                        {totalShortAmount.format({
                          decimals: 2,
                          trailingZeros: false,
                        })}{" "}
                        {symbol}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="flex flex-col gap-2 text-sm">
                    <p className="text-secondary-foreground">Closing Fee</p>
                    <div className="space-y-1">
                      <p className="w-fit font-mono text-h4">
                        {formattedFees} {symbol}
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-2 text-sm">
                    <p className="text-secondary-foreground">
                      Rebate to Receive
                    </p>
                    <div className="space-y-1">
                      <p className="w-fit font-mono text-h4">
                        {formattedAmountOut} {symbol}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    className="w-full"
                    disabled={executeButtonDisabled}
                    onClick={handleCloseShort}
                  >
                    Remove
                  </Button>

                  {/* <Collapsible
                    open={isDetailsOpen}
                    onOpenChange={setIsDetailsOpen}
                  >
                    <CollapsibleTrigger className="flex w-full items-center text-start text-sm text-secondary-foreground">
                      Details
                      <ChevronDown className="ml-auto inline h-4 w-4 text-secondary-foreground" />
                    </CollapsibleTrigger>

                    <CollapsibleContent className="mt-4 space-y-4">
                      {positionDetails}
                    </CollapsibleContent>
                  </Collapsible> */}
                </div>
              </div>
            </DialogContent>
          )
        })
        .with("pending", () => {
          return (
            <DialogContent aria-describedby={undefined}>
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
              {/* <p className="font-medium">Summary</p>{" "} */}
            </DialogContent>
          )
        })
        .with("receipt", () => {
          return (
            <DialogContent aria-describedby={undefined}>
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
              {/* <p className="font-medium">Summary</p> */}

              {/* {positionDetails} */}

              <div className="w-full space-y-2">
                <DialogClose asChild>
                  <Button variant="secondary" className="w-full">
                    Close Receipt
                  </Button>
                </DialogClose>
              </div>
            </DialogContent>
          )
        })
        .exhaustive()}
    </Dialog>
  )
}
