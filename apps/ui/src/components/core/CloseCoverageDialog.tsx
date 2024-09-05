import { fixed, FixedPoint, parseFixed } from "@delvtech/fixed-point-wasm"
import { OpenShort, ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { DialogProps } from "@radix-ui/react-dialog"
import { useQuery } from "@tanstack/react-query"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "components/base/collapsible"
import { Dialog, DialogContent, DialogTitle } from "components/base/dialog"
import { Progress } from "components/base/progress"
import SlippageSettings, {
  defaultSlippageAmount,
} from "components/forms/SlippageSettings"
import { MarketHeader } from "components/markets/MarketHeader"
import { cn } from "components/utils"
import { useCloseShort } from "hooks/hyperdrive/useCloseShort"
import { isNil } from "lodash-es"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Market } from "src/types"
import { formatTermLength } from "utils/formatTermLength"
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

export function CloseCoverageDialog(props: CloseCoverageDialogProps) {
  const { address: account } = useAccount()

  const symbol = props.market.loanToken.symbol
  const decimals = props.market.loanToken.decimals

  const totalShortAmount = fixed(props.short.bondAmount)
  const [shortAmountInput, setShortAmountInput] = useState<bigint>()

  const [slippage, setSlippage] = useState(defaultSlippageAmount)

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
    if (isNil(shortAmountInput) || !account) return

    await closeShort({
      hyperdrive: props.market.hyperdrive,
      shortOptions: {
        maturityTime: props.short.maturity,
        bondAmountIn: shortAmountInput,
        // TODO implement slippage controls
        minAmountOut: 0n,
        destination: account,
      },
    })
  }

  const quickAmountValues = quickTokenAmountWeights.map((weight) => {
    // const amount = fixed(props.position.totalDebt).mul(parseFixed(weight))
    const amount = fixed(totalShortAmount).mul(parseFixed(weight))

    return {
      weight,
      amount,
    }
  })

  const [isDetailsOpen, setIsDetailsOpen] = useState(false)

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
      <DialogContent aria-describedby={undefined}>
        <DialogTitle asChild>
          <h4 className="gradient-text w-fit font-chakra !text-h4 font-semibold">
            Close Coverage
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
                <p className="text-sm text-secondary-foreground">Duration</p>
                <p className="font-chakra text-lg font-medium">
                  {formattedDuration}
                </p>
              </div>

              {/* TODO */}
              <div className="flex flex-col gap-1 whitespace-nowrap">
                <p className="text-sm text-secondary-foreground">Fixed Rate</p>
                <p className="font-chakra text-lg font-medium">10.70%</p>
              </div>

              <div className="flex flex-col gap-1 whitespace-nowrap">
                <p className="text-sm text-secondary-foreground">Amount</p>
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
              <Progress value={percentMatured} className="h-1 bg-accent" />
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm text-secondary-foreground">Amount</p>
                <SlippageSettings amount={slippage} onChange={setSlippage} />
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
                            shortAmountInput === quickAction.amount.bigint,
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
              <p className="text-secondary-foreground">Rebate to Receive</p>
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
              Execute
            </Button>
            <Collapsible open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
              <CollapsibleTrigger className="flex w-full items-center text-start text-sm text-secondary-foreground">
                Details
                <ChevronDown className="ml-auto inline h-4 w-4 text-secondary-foreground" />
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-4 space-y-4">
                {/* {positionDetails} */}
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
