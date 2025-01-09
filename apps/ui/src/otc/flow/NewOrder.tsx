import { ArrowLeft, Check, HelpCircle } from "lucide-react"

import { fixed, parseFixed } from "@delvtech/fixed-point-wasm"
import Spinner from "components/animations/Spinner"
import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/base/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/base/select"
import { Separator } from "components/base/separator"
import { Tabs, TabsList, TabsTrigger } from "components/base/tabs"
import { Label } from "components/base/ui/label"
import { RadioGroup, RadioGroupItem } from "components/base/ui/radio-group"
import { BigNumberInput } from "components/core/BigNumberInput"
import { MarketHeader } from "components/markets/MarketHeader"
import { useApproval } from "hooks/base/useApproval"
import { useSignOrder } from "hooks/otc/useSignOrder"
import { useState } from "react"
import { otc } from "src/otc/client"
import { Market } from "src/types"
import { dayInMs } from "utils/constants"
import { formatExpiry } from "utils/formatExpiry"
import { maxUint256 } from "viem"
import { Link } from "wouter"
import {
  computeDepositAmount,
  HYPERDRIVE_MATCHING_ENGINE_ADDRESS,
} from "../utils"

// hardcoding the target market for now
const market: Market = {
  hyperdrive: "0xd41225855A5c5Ba1C672CcF4d72D1822a5686d30",
  loanToken: {
    address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
    symbol: "DAI",
    name: "Dai Stablecoin",
    decimals: 18,
    iconUrl:
      "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.svg?v=032",
  },
  collateralToken: {
    address: "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497",
    symbol: "sUSDe",
    name: "Staked USDe",
    decimals: 18,
    iconUrl: "https://cdn.morpho.org/assets/logos/usde.svg",
  },
  lltv: 860000000000000000n,
  duration: 15724800n,
  metadata: {
    id: "0x39d11026eae1c6ec02aa4c0910778664089cdd97c3fd23f68f7cd05e2e95af48",
    oracle: "0x5D916980D5Ae1737a8330Bf24dF812b2911Aae25",
    irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
  },
}
const decimals = market.loanToken.decimals

export function NewOrder() {
  const [view, setView] = useState<"long" | "short">("long")
  const [step, setStep] = useState<"review" | "sign">("review")

  const [amount, setAmount] = useState(0n)
  const [expiryDays, setExpiryDays] = useState(1)
  const [desiredRate, setDesiredRate] = useState<bigint>(0n)
  const depositAmount = computeDepositAmount(
    amount,
    view === "long" ? 0 : 1,
    desiredRate
  )

  const [unlimitedApproval, setUnlimitedApproval] = useState(true)
  const approvalAmount = unlimitedApproval ? maxUint256 : depositAmount
  const { approve, needsApproval, isLoading } = useApproval(
    market.collateralToken.address,
    HYPERDRIVE_MATCHING_ENGINE_ADDRESS,
    approvalAmount
  )

  // The actual expiry timestamp (in seconds) used for the order which is
  // updated when the preview is loaded
  const [expiry, setExpiry] = useState(0)
  function handleReviewOrder() {
    const expiryMs = Date.now() + expiryDays * dayInMs
    setExpiry(Math.ceil(expiryMs / 1000))
    setStep("sign")
  }

  const {
    mutateAsync: signOrderMutation,
    isPending: isOrderSigningPending,
    isSuccess: isOrderIntentSuccess,
  } = useSignOrder(HYPERDRIVE_MATCHING_ENGINE_ADDRESS)
  const handleOrderSigning = async () => {
    const signedOrder = await signOrderMutation({
      hyperdrive: market.hyperdrive,
      bondAmount: amount,
      depositAmount,
      expiry,
      orderType: view === "long" ? 0 : 1,
    })
    if (!signedOrder) return
    const response = await otc.createOrder(signedOrder)
    if ("error" in response) {
      console.error(response.error)
    }
  }

  const inputsDisabled = isLoading

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/otc"
        className="mb-6 inline-flex items-center text-[#B0B4BD] hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        All orders
      </Link>

      <Card className="border-0 bg-[#0E1320]">
        <CardHeader>
          {step === "review" && (
            <CardTitle className="text-xl font-medium text-white">
              New order
            </CardTitle>
          )}
        </CardHeader>

        {step === "review" ? (
          // Form
          <CardContent className="space-y-6">
            <Tabs
              className="w-full"
              value={view}
              onValueChange={(value) => setView(value as "long" | "short")}
            >
              <TabsList className="w-full border-none bg-[#1C1E25] p-1">
                <TabsTrigger
                  value="long"
                  className="w-full data-[state=active]:bg-[#2D313E] data-[state=active]:text-white"
                >
                  Long
                </TabsTrigger>
                <TabsTrigger
                  value="short"
                  className="w-full data-[state=active]:bg-[#2D313E] data-[state=active]:text-white"
                >
                  Short
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <MarketHeader market={market} className="text-[20px]" />
            <div className="space-y-2">
              <Label htmlFor="amount" className="text-secondary-foreground">
                {view === "long" ? "Long size" : "Short size"}
              </Label>
              <div className="flex items-center justify-between rounded-sm bg-[#1A1F2E] font-mono text-[24px] focus-within:outline focus-within:outline-white/20">
                <BigNumberInput
                  disabled={inputsDisabled}
                  className="bg-[#1A1F2E]"
                  id="amount"
                  defaultValue={
                    amount > 0n
                      ? fixed(amount, decimals).format({
                          trailingZeros: false,
                          group: false,
                        })
                      : ""
                  }
                  onChange={(e) => {
                    try {
                      // sanitize input
                      const sanitizedAmount = parseFixed(
                        e.currentTarget.value,
                        decimals
                      )
                      setAmount(sanitizedAmount.bigint)
                    } catch {
                      e.preventDefault()
                    }
                  }}
                />

                <Badge className="m-4 flex h-6 items-center justify-center gap-1 border-none bg-[#1A1F2E] p-2 py-4 font-sans font-medium hover:bg-none">
                  <img src={market.loanToken.iconUrl} className="size-4" />{" "}
                  {market.loanToken.symbol}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-secondary-foreground" htmlFor="max-rate">
                {view === "long" ? "Min rate" : "Max rate"}
              </Label>
              <div className="relative">
                <BigNumberInput
                  disabled={inputsDisabled || amount === 0n}
                  className="bg-[#1A1F2E]"
                  id="max-rate"
                  defaultValue={
                    desiredRate > 0n
                      ? fixed(desiredRate, decimals).mul(100, 0).format({
                          trailingZeros: false,
                          group: false,
                        })
                      : ""
                  }
                  onChange={(e) => {
                    try {
                      // sanitize input
                      const sanitizedAmount = parseFixed(
                        e.currentTarget.value,
                        decimals
                      ).div(100, 0)

                      setDesiredRate(sanitizedAmount.bigint)
                    } catch {
                      e.preventDefault()
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="order-expiry"
                className="text-secondary-foreground"
              >
                Order Expiry
              </Label>
              <Select
                defaultValue={expiryDays.toString()}
                onValueChange={(val) => setExpiryDays(Number(val))}
              >
                <SelectTrigger id="order-expiry" className="bg-[#1A1F2E]">
                  <SelectValue placeholder="Select expiry" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 day</SelectItem>
                  <SelectItem value="3">3 days</SelectItem>
                  <SelectItem value="7">1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col items-center gap-2 border-t border-[#2D313E] pt-4 text-secondary-foreground">
              <span>Your Deposit</span>
              <div className="flex items-center gap-2">
                <img
                  src={market.loanToken.iconUrl}
                  alt="{market.loanToken.symbol}"
                  width={20}
                  height={20}
                  className="h-5 w-5"
                />
                <span className="text-h5 font-medium text-white">
                  {fixed(depositAmount).format({
                    decimals: 4,
                    trailingZeros: false,
                  })}{" "}
                  {market.loanToken.symbol}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span>What am I paying for?</span>
                <HelpCircle className="h-4 w-4" />
              </div>
            </div>

            {needsApproval && amount > 0n ? (
              <>
                <div className="space-y-4 rounded border p-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">
                      Approve {market.loanToken.symbol}
                    </h3>
                  </div>
                  <p className="text-sm text-secondary-foreground">
                    Approve this market to spend your {market.loanToken.symbol}
                  </p>
                  <RadioGroup
                    disabled={inputsDisabled}
                    defaultValue="unlimited"
                    onValueChange={(value) =>
                      setUnlimitedApproval(value === "unlimited")
                    }
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="unlimited" id="unlimited" />
                      <Label htmlFor="unlimited">
                        Unlimited {market.loanToken.symbol}
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="custom" id="custom" />
                      <Label htmlFor="custom">
                        {fixed(depositAmount).format({
                          decimals: 4,
                          trailingZeros: false,
                        })}{" "}
                        {market.loanToken.symbol}
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button
                  disabled={inputsDisabled}
                  className="w-full font-semibold text-black"
                  onClick={() => approve()}
                >
                  {isLoading ? "Approving" : "Approve"}{" "}
                  {market.loanToken.symbol}{" "}
                  {isLoading && (
                    <Spinner firstColor="#000" secondColor="#000" size={16} />
                  )}
                </Button>
              </>
            ) : (
              <Button
                onClick={handleReviewOrder}
                className="w-full font-semibold text-black"
                disabled={amount === 0n}
              >
                Review Order
              </Button>
            )}
          </CardContent>
        ) : (
          // Preview
          <CardContent className="space-y-6">
            <div className="m-auto w-fit text-center">
              <MarketHeader className="text-h5 font-medium" market={market} />
            </div>
            <Separator />

            <div className="grid gap-8">
              <div className="flex items-center justify-between">
                <p className="text-secondary-foreground">
                  {view === "long" ? "Long" : "Short"} Size
                </p>
                <div className="flex items-center gap-2">
                  <img src={market.loanToken.iconUrl} className="size-4" />

                  <p className="font-mono text-lg">
                    {fixed(amount).format({
                      decimals: 4,
                      trailingZeros: false,
                    })}
                  </p>

                  {/* <p className="text-secondary-foreground">
                    {market.loanToken.symbol}
                  </p> */}
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <p className="text-secondary-foreground">Order Expiry</p>

                <div className="space-y-2 text-right font-mono">
                  <p className="text-lg">{formatExpiry(expiry)}</p>
                  <p className="text-secondary-foreground">
                    {new Date(expiry * 1000).toLocaleString()}{" "}
                  </p>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-secondary-foreground">
                  {view === "long" ? "Min" : "Max"} rate
                </p>
                <div>
                  {fixed(desiredRate).format({
                    decimals: 2,
                    percent: true,
                    trailingZeros: false,
                  })}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <p className="text-secondary-foreground">Your Deposit</p>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-2">
                    <img src={market.loanToken.iconUrl} className="size-4" />
                    <span className="font-mono text-h5">
                      {fixed(depositAmount).format({
                        decimals: 4,
                        trailingZeros: false,
                      })}{" "}
                      {market.loanToken.symbol}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-secondary-foreground">
                      What am I paying for?
                    </span>
                    <HelpCircle className="h-4 w-4 text-secondary-foreground" />
                  </div>
                </div>
              </div>

              {isOrderIntentSuccess ? (
                <div className="grid grid-cols-2 grid-rows-2 gap-2">
                  <Button
                    disabled={isOrderSigningPending}
                    className="pointer-events-none col-span-2 mt-8 border-2 hover:bg-transparent"
                    variant="ghost"
                    size="lg"
                    onClick={handleOrderSigning}
                  >
                    <Check className="text-aquamarine" size={18} /> Order
                    Submitted
                  </Button>
                  <Button
                    asChild
                    className="ml-auto w-full bg-[#1B1E26] text-white hover:bg-[#1B1E26]/50"
                  >
                    <Link to="/otc">
                      <ArrowLeft size={18} />
                      All Orders
                    </Link>
                  </Button>
                  <Button
                    className="ml-auto w-full bg-[#1B1E26] text-red-400 hover:bg-[#1B1E26]/50"
                    onClick={() => {}}
                  >
                    Cancel order
                  </Button>
                </div>
              ) : (
                <div className="mt-8 grid grid-cols-2 gap-2">
                  <Button
                    className="ml-auto w-full bg-[#1B1E26] text-white hover:bg-[#1B1E26]/50"
                    size="lg"
                    onClick={() => setStep("review")}
                  >
                    <ArrowLeft size={18} />
                    Edit
                  </Button>
                  <Button
                    disabled={isOrderSigningPending}
                    size="lg"
                    onClick={handleOrderSigning}
                  >
                    Sign & Submit
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  )
}
