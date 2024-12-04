"use client"

import { ArrowLeft, HelpCircle, Info } from "lucide-react"

import { Button } from "components/base/button"
import { Card, CardContent, CardHeader, CardTitle } from "components/base/card"
// import { Label } from "components/base/label"
import { parseFixed } from "@delvtech/fixed-point-wasm"
import { Badge } from "components/base/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "components/base/select"
import { Tabs, TabsList, TabsTrigger } from "components/base/tabs"
import { Label } from "components/base/ui/label"
import { RadioGroup, RadioGroupItem } from "components/base/ui/radio-group"
import { BigNumberInput } from "components/core/BigNumberInput"
import { MarketHeader } from "components/markets/MarketHeader"
import { useApproval } from "hooks/base/useApproval"
import { useEffect, useState } from "react"
import { Market } from "src/types"
import { Address } from "viem"
import { Link } from "wouter"

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
const hyperdriveMatchingAddress: Address =
  "0x6662B6e771FACD61E33cCAfDc23BE16B4eAd0666"
export function NewOrder() {
  const [amount, setAmount] = useState<bigint>(0n)
  const [longSize, setLongSize] = useState<bigint>(0n)
  const [expiry, setExpiry] = useState<bigint>(0n)
  const [view, setView] = useState<"long" | "short">("long")

  const { approve, needsApproval } = useApproval(
    market.collateralToken.address,
    hyperdriveMatchingAddress,
    amount
  )

  // effect for on view change to reset values
  useEffect(() => {
    setAmount(0n)
    // select amount input and set value to zero
    const input = document.getElementById("amount") as HTMLInputElement
    input.value = "0"
  }, [view])

  const handleOnExpiryChange = (value: string) => {
    try {
      const valueNum = BigInt(value)
      setExpiry(valueNum * 86400n)
    } catch (error) {
      console.error(error)
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <Link
        href="/otc"
        className="mb-6 inline-flex items-center text-[#B0B4BD] hover:text-white"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        All orders
      </Link>

      <Card className="border-0 bg-[#13151C]">
        <CardHeader>
          <CardTitle className="text-xl font-medium">New order</CardTitle>
        </CardHeader>
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

          <MarketHeader market={market} />
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-secondary-foreground">
              {view === "long" ? "Long size" : "Short size"}
            </Label>
            <div className="flex items-center justify-between rounded-sm bg-secondary font-mono text-[24px] focus-within:outline focus-within:outline-white/20">
              <BigNumberInput
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

              <Badge className="m-4 flex h-6 items-center justify-center gap-1 border-none bg-secondary p-2 py-4 font-sans font-medium hover:bg-none">
                <img src={market.loanToken.iconUrl} className="size-4" />{" "}
                {market.loanToken.symbol}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="order-expiry">Order expiry</Label>
            <Select defaultValue="1" onValueChange={handleOnExpiryChange}>
              <SelectTrigger id="order-expiry">
                <SelectValue placeholder="Select expiry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 week</SelectItem>
                <SelectItem value="2">2 weeks</SelectItem>
                <SelectItem value="3">1 month</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-secondary-foreground" htmlFor="max-rate">
              {view === "long" ? "Min rate" : "Max rate"}
            </Label>
            <div className="relative">
              <BigNumberInput id="max-rate" />
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 border-t border-[#2D313E] pt-4 text-secondary-foreground">
            <span>Your Deposit</span>
            <div className="flex items-center gap-2">
              <img
                src={market.loanToken.iconUrl}
                alt="USDC"
                width={20}
                height={20}
                className="h-5 w-5"
              />
              <span className="text-h5 font-medium text-white">47.20 USDC</span>
            </div>
            <div className="flex items-center gap-1">
              <span>What am I paying for?</span>
              <HelpCircle className="h-4 w-4" />
            </div>
          </div>

          {needsApproval ? (
            <>
              <div className="space-y-4 rounded border p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-white">
                    Approve USDC
                  </h3>
                  <Info className="h-4 w-4 text-[#B0B4BD]" />
                </div>
                <p className="text-sm text-[#B0B4BD]">
                  Approve this market to spend your USDC
                </p>
                <RadioGroup defaultValue="500">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="unlimited" id="unlimited" />
                    <Label htmlFor="unlimited">Unlimited USDC</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="500" id="500" />
                    <Label htmlFor="500">500 USDC</Label>
                  </div>
                </RadioGroup>
              </div>

              <Button className="w-full font-semibold text-black">
                Approve USDC
              </Button>
            </>
          ) : (
            <Button className="w-full font-semibold text-black">
              Place Order
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
