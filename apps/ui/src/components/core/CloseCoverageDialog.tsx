import { fixed, FixedPoint, parseFixed } from "@delvtech/fixed-point-wasm"
import { OpenShort, ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { DialogProps } from "@radix-ui/react-dialog"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import Spinner from "components/animations/Spinner"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Dialog, DialogContent, DialogTitle } from "components/base/dialog"
import { Progress } from "components/base/progress"
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
import { useEtherscan } from "hooks/base/useEtherscan"
import { useCloseShort } from "hooks/hyperdrive/useCloseShort"
import { isNil } from "lodash-es"
import { ExternalLink, Info } from "lucide-react"
import { useReducer, useState } from "react"
import { Market, OpenShortPlusQuote } from "src/types"
import { MorphoLogo } from "static/images/MorphoLogo"
import { match } from "ts-pattern"
import { formatTermLength } from "utils/formatTermLength"
import { Address, Chain } from "viem"
import { useAccount, useChainId, usePublicClient } from "wagmi"
import { BigNumberInput } from "./BigNumberInput"

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

type State = {
  step: "close" | "pending" | "receipt"
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

const reducer = (state: State, action: Action): State => {
  const { type, payload } = action

  switch (type) {
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

    default: {
      return state
    }
  }
}

interface CloseCoverageDialogProps extends DialogProps {
  market: Market
  short: OpenShortPlusQuote
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

  // Computed values
  const isMatured = new Date() > new Date(Number(props.short.maturity) * 1000)
  const formattedRateQuote = closeCoverageData
    ? fixed(props.short.rateQuote, 6).format({
        percent: true,
        decimals: 2,
      })
    : undefined
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

  const { mutateAsync: closeShort, isPending } = useCloseShort()
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

  const { url: transactionUrl } = useEtherscan(state.hash, "tx")

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

  const executeButtonDisabled =
    shortAmountInput === 0n || isNil(shortAmountInput) || !closeCoverageData

  return (
    <Dialog {...props}>
      {match(state.step)
        .with("close", () => {
          return (
            <DialogContent
              aria-describedby={undefined}
              className="animate-fade"
            >
              <DialogTitle>
                {isMatured ? "Close Position" : "Revert to Variable"}
              </DialogTitle>

              <div className="grid gap-6">
                <div className="space-y-4 rounded-lg bg-accent p-4">
                  <MarketHeader
                    market={props.market}
                    className="text-h5"
                    variant="secondary"
                  />

                  <div className="flex justify-between">
                    <div className="flex flex-col gap-1 whitespace-nowrap">
                      <p className="text-sm text-secondary-foreground">
                        Duration
                      </p>
                      <p className="font-mono">{formattedDuration}</p>
                    </div>

                    {/* TODO */}
                    <div className="flex flex-col gap-1 whitespace-nowrap">
                      <p className="text-sm text-secondary-foreground">
                        Fixed Rate
                      </p>
                      <p className="font-mono">{formattedRateQuote}</p>
                    </div>

                    <div className="flex flex-col gap-1 whitespace-nowrap">
                      <p className="text-sm text-secondary-foreground">
                        Amount
                      </p>
                      <p className="font-mono">
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
                      segments={[
                        {
                          value: percentMatured,
                        },
                      ]}
                      className="h-1"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-secondary-foreground">
                        Amount to Revert
                      </p>

                      <div className="flex items-center gap-2">
                        <Button
                          className="h-5 w-fit p-2 text-secondary-foreground hover:bg-primary hover:text-background"
                          variant="outline"
                          onClick={() => {
                            setShortAmountInput(props.short.bondAmount)
                            const inputElement = document.getElementById(
                              "shortAmountInput"
                            ) as HTMLInputElement
                            inputElement.value = fixed(
                              props.short.bondAmount
                            ).format({
                              group: false,
                              trailingZeros: false,
                            })
                          }}
                        >
                          Max
                        </Button>

                        <SlippageSettings
                          amount={slippage}
                          onChange={setSlippage}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between rounded-sm bg-popover font-mono text-[24px] focus-within:outline focus-within:outline-white/20">
                      <BigNumberInput
                        className="bg-accent"
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
                  </div>
                </div>

                <div className="grid grid-cols-2">
                  <div className="flex flex-col gap-1 text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1">
                          <p className="text-secondary-foreground">
                            Closing Fee
                          </p>

                          <Info
                            className="text-secondary-foreground"
                            size={14}
                          />
                        </TooltipTrigger>

                        <TooltipContent className="grid max-w-64 gap-4 border border-secondary p-4">
                          <p>
                            Fee paid to liquidity providers for closing the
                            underlying Hyperdrive short position.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {closeCoverageData ? (
                      <p className="w-fit animate-fadeFast font-mono text-h5">
                        {formattedFees} {symbol}
                      </p>
                    ) : (
                      <Skeleton className="h-7 w-24" />
                    )}
                  </div>

                  <div className="flex flex-col items-end gap-1 text-sm">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger className="flex items-center gap-1">
                          <p className="text-secondary-foreground">
                            Interest Proceeds
                          </p>

                          <Info
                            className="text-secondary-foreground"
                            size={14}
                          />
                        </TooltipTrigger>

                        <TooltipContent className="grid max-w-64 gap-4 border border-secondary p-4">
                          <p>
                            This is the interest rebate you receive after
                            closing your position. Use the proceeds to repay
                            interest accrued on your Morpho loan.
                          </p>
                          <p>Learn more in the docs.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>

                    {closeCoverageData ? (
                      <p className="w-fit animate-fadeFast font-mono text-h5">
                        {formattedAmountOut} {symbol}
                      </p>
                    ) : (
                      <Skeleton className="h-7 w-24" />
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <Button
                    size="lg"
                    className={cn("h-12 w-full text-md", {
                      "animate-pulse": isPending,
                    })}
                    disabled={executeButtonDisabled}
                    onClick={handleCloseShort}
                  >
                    {isPending
                      ? "Sign Transaction..."
                      : isMatured
                        ? "Close Position"
                        : "Revert to Variable"}
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
            <DialogContent
              aria-describedby={undefined}
              className="animate-fade"
            >
              <div className="flex flex-col items-center space-y-2">
                <div className="w-min rounded-full bg-accent p-4">
                  <Spinner />
                </div>

                <h5 className="font-chakra font-medium">
                  Transaction Pending...
                </h5>

                <a
                  href={transactionUrl}
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
            <DialogContent
              aria-describedby={undefined}
              className="animate-fade"
            >
              <div className="grid gap-8">
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
                    href={transactionUrl}
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
                  <a
                    href={getMorphoMarketAppURL(
                      props.market.metadata.id,
                      client?.chain
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full">
                      Pay back debt on Morpho <MorphoLogo />
                    </Button>
                  </a>

                  <p className="text-center text-sm text-secondary-foreground">
                    Head to the Morpho App to pay off your accrued debt with
                    these proceeds.
                  </p>
                </div>
              </div>
            </DialogContent>
          )
        })
        .exhaustive()}
    </Dialog>
  )
}

function getMorphoMarketAppURL(id: Address, chain?: Chain) {
  if (!chain) return undefined

  return `https://app.morpho.org/market?id=${id}&network=${chain.name.toLowerCase()}`
}
