import { ArrowLeft, HelpCircle } from "lucide-react"

import { fixed, parseFixed } from "@delvtech/fixed-point-wasm"
import { useQuery } from "@tanstack/react-query"
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
import { useSignOrder } from "hooks/otc/useSignOrder"
import { OrderIntent, OrderKey, OtcClient, parseOrderKey } from "otc-api"
import { useMemo, useState } from "react"
import { Market } from "src/types"
import { match } from "ts-pattern"
import { OTC_API_URL } from "utils/constants"
import { maxUint256 } from "viem"
import { useAccount, useChainId, usePublicClient } from "wagmi"
import { Link, useParams } from "wouter"
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

function useOrder(orderKey?: OrderKey) {
  return useQuery({
    queryKey: ["order", orderKey],
    enabled: !!orderKey,
    queryFn: async () => {
      console.log("orderKey", orderKey)
      if (!orderKey!.endsWith(".json")) {
        orderKey = orderKey! + ".json"
      }

      const client = new OtcClient(OTC_API_URL)
      const response = await client.getOrder(orderKey as OrderKey)

      if (response.success) {
        return response
      } else {
        throw new Error(response.error)
      }
    },
  })
}

function useSimulateMatch(longOrder?: OrderIntent, shortOrder?: OrderIntent) {
  const publicClient = usePublicClient()
  const chainId = useChainId()
  const { address: account } = useAccount()
  const enabled = !!publicClient && !!account && !!longOrder && !!shortOrder

  return useQuery({
    queryKey: [
      "simulateMatch",
      longOrder?.signature,
      shortOrder?.signature,
      chainId,
    ],
    enabled,
    queryFn: enabled
      ? async () => {
          console.log("simluating match")

          const r = await publicClient.verifyTypedData({
            address: account,
            domain: {
              name: "HyperdriveMatchingEngine",
              version: "1",
              chainId,
              verifyingContract: HYPERDRIVE_MATCHING_ENGINE_ADDRESS,
            },
            types: {
              Order: [
                { name: "trader", type: "address" },
                { name: "hyperdrive", type: "address" },
                { name: "amount", type: "uint256" },
                { name: "slippageGuard", type: "uint256" },
                { name: "minVaultSharePrice", type: "uint256" },
                { name: "options", type: "Options" },
                // enum as uint8
                { name: "orderType", type: "uint8" },
                { name: "expiry", type: "uint256" },
                { name: "salt", type: "bytes32" },
              ],
              Options: [
                { name: "destination", type: "address" },
                { name: "asBase", type: "bool" },
              ],
            },
            message: {
              ...shortOrder,
              expiry: BigInt(shortOrder.expiry),
            },
            signature: shortOrder.signature,
            primaryType: "Order",
          })

          return
          // try {
          //   const result = await publicClient.simulateContract({
          //     address: HYPERDRIVE_MATCHING_ENGINE_ADDRESS,
          //     abi: HyperdriveMatchingEngineAbi,
          //     functionName: "matchOrders",
          //     args: [
          //       {
          //         ...longOrder,
          //         expiry: BigInt(longOrder.expiry),
          //       },
          //       {
          //         ...shortOrder,
          //         expiry: BigInt(shortOrder.expiry),
          //       },
          //       0n,
          //       {
          //         destination: account,
          //         asBase: true,
          //         extraData: "0x",
          //       },
          //       {
          //         destination: account,
          //         asBase: true,
          //         extraData: "0x",
          //       },
          //       account, // Fee recipient
          //       true, // Long first
          //     ],
          //   })

          //   return result
          // } catch (e) {
          //   console.error(e)
          // }
        }
      : undefined,
  })
}

export function FillOrder() {
  const params = useParams()

  const orderKey = decodeURIComponent(
    params.orderKey as string
  ) as OrderKey<"pending">
  const orderParams = parseOrderKey(decodeURIComponent(orderKey) as OrderKey)
  /* Inverse the order type from parameters for the match */
  const orderType = Number(!orderParams.orderType)

  const [localOrderKey, setLocalOrderKey] = useState<OrderKey>()

  const { data: orderData } = useOrder(orderKey)
  const { data: localOrder } = useOrder(localOrderKey)

  const [step, setStep] = useState<"review" | "sign" | "liquidity" | "match">(
    "review"
  )

  const [amount, setAmount] = useState<bigint>(0n)
  const [expiry, setExpiry] = useState<bigint>(1n) // days
  const [desiredRate, setDesiredRate] = useState<bigint>(0n)
  const depositAmount = computeDepositAmount(amount, orderType, desiredRate)

  const [unlimitedApproval, setUnlimitedApproval] = useState(true)

  const approvalAmount = unlimitedApproval ? maxUint256 : depositAmount
  const { approve, needsApproval, isLoading } = useApproval(
    market.collateralToken.address,
    HYPERDRIVE_MATCHING_ENGINE_ADDRESS,
    approvalAmount
  )

  const { data: matchResult } = useSimulateMatch(
    orderData?.data as OrderIntent,
    localOrder?.data as OrderIntent
  )

  const handleOnExpiryChange = (value: string) => {
    try {
      const valueNum = BigInt(value)
      setExpiry(valueNum * 86400n)
    } catch (error) {
      console.error(error)
    }
  }

  const {
    mutateAsync: signOrderMutation,
    isPending: isOrderSigningPending,
    isSuccess: isOrderIntentSuccess,
  } = useSignOrder(HYPERDRIVE_MATCHING_ENGINE_ADDRESS)
  const handleOrderSigning = async () => {
    const orderIntent = await signOrderMutation({
      hyperdrive: market.hyperdrive,
      amount: amount,
      slippageGuard: depositAmount,
      expiry: expiry * 86400n,
      orderType: BigInt(orderType),
    })

    const otcClient = new OtcClient(OTC_API_URL)

    const response = await otcClient.createOrder({
      ...orderIntent,
      expiry: orderIntent.expiry,
    })

    if ("error" in response) {
      console.error(response.error)
    } else {
      setLocalOrderKey(response.key)
      setStep("match")
    }
  }

  const inputsDisabled = isLoading

  const orderReceipt = useMemo(() => {
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

            {/* <p className="text-secondary-foreground">
                    {market.loanToken.symbol}
                  </p> */}
          </div>
        </div>

        <Separator />

        <div className="flex items-center justify-between">
          <p className="text-secondary-foreground">Order Expiry</p>

          <div className="space-y-2 text-right font-mono">
            <p className="text-lg">1 week </p>
            <p className="text-secondary-foreground">12/02/2024 1:44 PM </p>
          </div>
        </div>
        <Separator />
        <div className="flex items-center justify-between">
          <p className="text-secondary-foreground">
            {orderType === 0 ? "Min" : "Max"} rate
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
      </div>
    )
  }, [orderType, market, depositAmount, desiredRate, expiry])

  return (
    <div className="mx-auto max-w-5xl">
      <Link
        href="/otc"
        className="mb-6 inline-flex items-center text-[#B0B4BD] hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        All orders
      </Link>

      <div className="grid grid-cols-2 grid-rows-[128px_1fr] gap-8">
        <div className="col-span-2 flex items-center justify-center">
          <MarketHeader market={market} />
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
                  {new Date().toLocaleDateString()}
                </span>
              </div>
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <p className="text-secondary-foreground">Fixed APR</p>
              <div className="flex items-center gap-1">
                <span className="font-mono">7%</span>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 bg-[#0E1320]">
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
                          ).div(parseFixed(100, 18))

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
                    Review Order
                  </Button>
                )}
              </CardContent>
            ))
            .with("sign", () => (
              <CardContent className="space-y-6">
                {orderReceipt}

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
                    onClick={handleOrderSigning}
                    className="w-full font-semibold text-black"
                    disabled={amount === 0n || desiredRate === 0n}
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
                          ).div(parseFixed(100, 18))

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
              <CardContent className="space-y-6">
                {orderReceipt}

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
                    // onClick={() => setStep("sign")}
                    className="w-full font-semibold text-black"
                    disabled={!matchResult}
                  >
                    Match Order
                  </Button>
                )}
              </CardContent>
            ))
            .exhaustive()}
        </Card>
      </div>
    </div>
  )
}
