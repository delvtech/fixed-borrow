import { ArrowLeft, HelpCircle } from "lucide-react"

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
import { Label } from "components/base/ui/label"
import { RadioGroup, RadioGroupItem } from "components/base/ui/radio-group"
import { BigNumberInput } from "components/core/BigNumberInput"
import { MarketHeader } from "components/markets/MarketHeader"
import { useApproval } from "hooks/base/useApproval"
import { useOrder } from "hooks/otc/useOrder"
import { useSignOrder } from "hooks/otc/useSignOrder"
import { useSimulateMatch } from "hooks/otc/useSimulateMatch"
import { OrderIntent, OrderKey, OtcClient, parseOrderKey } from "otc-api"
import { useMemo, useState } from "react"
import { match } from "ts-pattern"
import { maxUint256 } from "viem"
import { Link, useParams } from "wouter"
import {
  computeDepositAmount,
  HYPERDRIVE_MATCHING_ENGINE_ADDRESS,
  OTC_API_URL,
  TARGET_OTC_MARKET,
} from "../utils"

const decimals = TARGET_OTC_MARKET.loanToken.decimals
const market = TARGET_OTC_MARKET

export function FillOrder() {
  /* Fetch order key from the URL */
  const params = useParams()
  const orderKey = decodeURIComponent(
    params.orderKey as string
  ) as OrderKey<"pending">
  const orderParams = parseOrderKey(orderKey)

  /* Inverse the order type from parameters for the match */
  const orderType = Number(!orderParams.orderType)

  const [localOrderKey, setLocalOrderKey] = useState<OrderKey>()

  const { data: orderData } = useOrder(orderKey)
  const { data: localOrder } = useOrder(localOrderKey)

  const { data: matchResult } = useSimulateMatch(
    orderData?.data as OrderIntent,
    localOrder?.data as OrderIntent
  )

  /* Step in the fill order flow */
  const [step, setStep] = useState<"review" | "sign" | "liquidity" | "match">(
    "review"
  )

  /* Order parameters */
  const [amount, setAmount] = useState(0n)
  const [expiry, setExpiry] = useState(1n) // days
  const [desiredRate, setDesiredRate] = useState(0n)
  const depositAmount = computeDepositAmount(amount, orderType, desiredRate)

  /* Approval parameters */
  const [unlimitedApproval, setUnlimitedApproval] = useState(true)
  const approvalAmount = unlimitedApproval ? maxUint256 : depositAmount
  const { approve, needsApproval, isLoading } = useApproval(
    market.collateralToken.address,
    HYPERDRIVE_MATCHING_ENGINE_ADDRESS,
    approvalAmount
  )

  const handleOnExpiryChange = (value: string) => {
    try {
      const valueNum = BigInt(value)
      setExpiry(valueNum * 86400n)
    } catch (error) {
      console.error(error)
    }
  }

  const { mutateAsync: signOrderMutation, isPending: isOrderSigningPending } =
    useSignOrder(HYPERDRIVE_MATCHING_ENGINE_ADDRESS)
  const handleOrderSigning = async () => {
    const orderIntent = await signOrderMutation({
      hyperdrive: market.hyperdrive,
      amount: amount,
      slippageGuard: depositAmount,
      expiry: expiry * 86400n,
      orderType: BigInt(orderType),
    })

    if (!orderIntent) return

    const otcClient = new OtcClient(OTC_API_URL)
    const response = await otcClient.createOrder(orderIntent)

    if (response.success) {
      setLocalOrderKey(response.key)
      setStep("match")
    } else {
      console.error(response.error)
    }
  }

  const inputsDisabled = isLoading

  const orderReceipt = useMemo(() => {
    const currentTime = Date.now()
    const expiryMs = Number(expiry * 86400n * 1000n)
    const formattedExpiryDate = new Date(
      currentTime + expiryMs
    ).toLocaleString()

    return (
      <div className="grid gap-8">
        <div className="flex items-center justify-between">
          <p className="text-secondary-foreground">
            {orderType === 0 ? "Long" : "Short"} Size
          </p>

          <div className="flex items-center gap-2">
            <img src={market.loanToken.iconUrl} className="size-4" />

            <p className="font-mono text-lg">
              {fixed(depositAmount).format({
                decimals: 4,
                trailingZeros: false,
              })}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between">
          <p className="text-secondary-foreground">Order Expiry</p>

          <div className="space-y-2 text-right font-mono">
            <p className="text-lg">1 day</p>
            <p className="text-sm text-secondary-foreground">
              {formattedExpiryDate}
            </p>
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-secondary-foreground">
            {orderType ? "Min" : "Max"} rate
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

        <div className="flex justify-between">
          <p className="text-secondary-foreground">Your Deposit</p>
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-2">
              <img src={market.loanToken.iconUrl} className="size-4" />

              <span className="font-mono text-h5">
                {fixed(depositAmount).format({
                  decimals: 4,
                  trailingZeros: false,
                })}
              </span>
            </div>

            <div className="flex items-center gap-1">
              <span className="text-sm text-secondary-foreground">
                What am I paying for?
              </span>

              <HelpCircle className="size-4 text-secondary-foreground" />
            </div>
          </div>
        </div>
      </div>
    )
  }, [orderType, market, depositAmount, desiredRate, expiry])

  const formattedExpiryDate = useMemo(() => {
    if (!orderData) return

    const expiryMs = orderData.data.expiry * 1000
    return new Date(expiryMs).toLocaleString()
  }, [orderData])

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/otc"
        className="absolute mb-6 inline-flex items-center text-[#B0B4BD] hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        All orders
      </Link>

      <div className="grid grid-cols-2 grid-rows-[96px_1fr] gap-4">
        <div className="col-span-2 flex items-center justify-center">
          <MarketHeader market={market} className="ml-auto" />
        </div>

        <Card className="bg-transparent">
          <CardHeader>
            <CardTitle className="text-white">Order to Fill</CardTitle>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <p className="text-secondary-foreground">
                {orderParams.orderType === 0 ? "Long Amount" : "Short Amount"}
              </p>

              <div className="flex items-center gap-1">
                <img src={market.loanToken.iconUrl} className="size-4" />

                <span className="font-mono">
                  {fixed(orderData?.data.amount ?? 0n, decimals).format({
                    decimals: 2,
                    trailingZeros: false,
                  })}
                </span>

                <span className="text-sm text-secondary-foreground">
                  {market.loanToken.symbol}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              {/*  TODO */}
              <p className="text-secondary-foreground">Liquidity</p>

              <div className="flex items-center gap-1">
                <img src={market.loanToken.iconUrl} className="size-4" />

                <span className="font-mono">50,000</span>
                <span className="text-sm text-secondary-foreground">
                  {market.loanToken.symbol}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-secondary-foreground">Order expiry</p>

              <div className="flex flex-col items-end gap-1">
                <span className="font-mono">1 week</span>
                <span className="font-mono text-sm text-secondary-foreground">
                  {formattedExpiryDate}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-secondary-foreground">Fixed APR</p>

              <span className="font-mono">7%</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-[#0E1320]">
          <CardHeader>
            <CardTitle className="text-xl font-medium text-white">
              New Fill Order
            </CardTitle>
          </CardHeader>

          {match(step)
            .with("review", () => (
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-secondary-foreground">
                    {orderType === 0 ? "Long size" : "Short size"}
                  </Label>

                  <div className="flex items-center justify-between rounded-sm bg-[#1A1F2E] font-mono text-[24px] focus-within:outline focus-within:outline-white/20">
                    <BigNumberInput
                      disabled={inputsDisabled}
                      className="bg-[#1A1F2E]"
                      id="amount"
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
                  <Label
                    className="text-secondary-foreground"
                    htmlFor="max-rate"
                  >
                    {orderType === 0 ? "Min rate" : "Max rate"}
                  </Label>

                  <BigNumberInput
                    disabled={inputsDisabled || amount === 0n}
                    className="bg-[#1A1F2E]"
                    id="max-rate"
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

                <div className="flex flex-col items-center gap-2 border-t border-[#2D313E] pt-4 text-secondary-foreground">
                  <span>Your Deposit</span>
                  <div className="flex items-center gap-2">
                    <img
                      src={market.loanToken.iconUrl}
                      alt={market.loanToken.symbol}
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
                    <HelpCircle className="size-4" />
                  </div>
                </div>

                <Button
                  onClick={() => setStep("sign")}
                  className="w-full font-semibold text-black"
                  disabled={amount === 0n || desiredRate === 0n}
                >
                  Review Order
                </Button>
              </CardContent>
            ))
            .with("sign", () => (
              <CardContent className="space-y-10">
                {orderReceipt}

                {needsApproval && amount > 0n ? (
                  <>
                    <div className="space-y-4 rounded border p-4">
                      <h3 className="text-lg font-medium text-white">
                        Approve {market.loanToken.symbol}
                      </h3>

                      <p className="text-sm text-secondary-foreground">
                        Approve this market to spend your{" "}
                        {market.loanToken.symbol}
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
                            <span className="text-secondary-foreground">
                              {market.loanToken.symbol}
                            </span>
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
                        <Spinner
                          firstColor="#000"
                          secondColor="#000"
                          size={16}
                        />
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleOrderSigning}
                    className="w-full font-semibold text-black"
                    disabled={
                      amount === 0n ||
                      desiredRate === 0n ||
                      isOrderSigningPending
                    }
                  >
                    Sign Order
                  </Button>
                )}
              </CardContent>
            ))
            .with("liquidity", () => (
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-secondary-foreground">
                    {orderType === 0 ? "Long size" : "Short size"}
                  </Label>
                  <div className="flex items-center justify-between rounded-sm bg-[#1A1F2E] font-mono text-[24px] focus-within:outline focus-within:outline-white/20">
                    <BigNumberInput
                      disabled={inputsDisabled}
                      className="bg-[#1A1F2E]"
                      id="amount"
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
                  <Label
                    className="text-secondary-foreground"
                    htmlFor="max-rate"
                  >
                    {orderType === 0 ? "Min rate" : "Max rate"}
                  </Label>
                  <div className="relative">
                    <BigNumberInput
                      disabled={inputsDisabled || amount === 0n}
                      className="bg-[#1A1F2E]"
                      id="max-rate"
                      onChange={(e) => {
                        try {
                          // sanitize input
                          const sanitizedAmount = parseFixed(
                            e.currentTarget.value,
                            decimals
                          ).div(parseFixed(100, 0))

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
                  <Select defaultValue="1" onValueChange={handleOnExpiryChange}>
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
                      <span className="text-secondary-foreground">
                        {market.loanToken.symbol}
                      </span>
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
                        Approve this market to spend your{" "}
                        {market.loanToken.symbol}
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
                        <Spinner
                          firstColor="#000"
                          secondColor="#000"
                          size={16}
                        />
                      )}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={() => setStep("sign")}
                    className="w-full font-semibold text-black"
                    disabled={amount === 0n || desiredRate === 0n}
                  >
                    Confirm Liquidity
                  </Button>
                )}
              </CardContent>
            ))
            .with("match", () => (
              <CardContent className="space-y-10">
                {orderReceipt}

                <Button
                  className="w-full font-semibold text-black"
                  disabled={!matchResult}
                >
                  Match Order
                </Button>
              </CardContent>
            ))
            .exhaustive()}
        </Card>
      </div>
    </div>
  )
}
