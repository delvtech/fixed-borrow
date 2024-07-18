import { Badge } from "components/base/badge"
import { Button } from "components/base/button"
import { Card, CardContent, CardHeader } from "components/base/card"
import { useState } from "react"
import { getAppConfig } from "utils/getAppConfig"
import { useChainId } from "wagmi"
import { useParams } from "wouter"
import { SupportedChainId } from "~/constants"
import { Market } from "../types"
import { useBorrowPosition } from "./BorrowPage"

export function PositionPage() {
  const params = useParams()
  const chainId = useChainId()
  const appConfig = getAppConfig(chainId as SupportedChainId)
  const hyperdrive = params.hyperdrive

  const [market] = useState<Market | undefined>(() => {
    return appConfig.morphoMarkets.find(
      (market) => market.hyperdrive === hyperdrive
    )
  })

  const { data: position } = useBorrowPosition(market)
  console.log(position, "position")
  return (
    <main className="my-8 flex flex-col gap-8 px-28">
      <Card className="">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <Badge className="bg-ring p-2">
            <img src={market?.loanToken.iconUrl} className="size-14" />
          </Badge>
          <div className="flex flex-row items-center gap-2">
            <Button variant={"secondary"} size={"lg"}>
              Remove Coverage
            </Button>
            <Button variant={"secondary"} size={"lg"}>
              Add Coverage
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-evenly gap-6 lg:flex-row">
          <Card className="flex-1">
            <CardHeader className="font-chakra text-h5">Your Debt</CardHeader>
            <CardContent>
              <p className="mb-4 text-secondary-foreground">Total Debt</p>
              <div className="flex items-end gap-1">
                <p className="text-h3">171,624.00</p>
                <p className="text-sm">{market?.loanToken.symbol}</p>
              </div>
              <p className="text-secondary-foreground">$171,635.00</p>
              <div className="mt-8 flex">
                <div className="flex flex-1 flex-col">
                  <p className="text-secondary-foreground">Covered Debt</p>
                  <div className="flex items-end gap-1">
                    <p className="text-h4">171,624.00</p>
                    <p className="text-sm">{market?.loanToken.symbol}</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-secondary-foreground">Outstanding Debt</p>
                  <div className="flex items-end gap-1">
                    <p className="text-h4">0</p>
                    <p className="text-sm">{market?.loanToken.symbol}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader className="font-chakra text-h5">Your Debt</CardHeader>
            <CardContent>
              <p className="mb-4 text-secondary-foreground">Total Debt</p>
              <div className="flex items-end gap-1">
                <p className="text-h3">171,624.00</p>
                <p className="text-sm">{market?.loanToken.symbol}</p>
              </div>
              <p className="text-secondary-foreground">$171,635.00</p>
              <div className="mt-8 flex">
                <div className="flex flex-1 flex-col">
                  <p className="text-secondary-foreground">Covered Debt</p>
                  <div className="flex items-end gap-1">
                    <p className="text-h4">171,624.00</p>
                    <p className="text-sm">{market?.loanToken.symbol}</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-secondary-foreground">Outstanding Debt</p>
                  <div className="flex items-end gap-1">
                    <p className="text-h4">0</p>
                    <p className="text-sm">{market?.loanToken.symbol}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
      <Card className="">
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <Badge className="bg-ring p-2">
            <img src={market?.collateralToken.iconUrl} className="size-14" />
          </Badge>
          <div className="flex flex-row items-center gap-2">
            <Button
              // TODO: Keep a mapping of brand colors (ie. Morpho Blue). Or decide on a different color for this button.
              className="bg-[#2E4DFF]"
              variant={"secondary"}
              size={"lg"}
            >
              Manage Loan
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-evenly gap-6 lg:flex-row">
          <Card className="flex-1">
            <CardHeader className="font-chakra text-h5">
              Your Collateral
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-secondary-foreground">Total Collateral</p>
              <div className="flex items-end gap-1">
                <p className="text-h3">171,624.00</p>
                <p className="text-sm">{market?.collateralToken.symbol}</p>
              </div>
              <p className="text-secondary-foreground">$171,635.00</p>
              <div className="mt-8 flex">
                <div className="flex flex-1 flex-col">
                  <p className="text-secondary-foreground">
                    Available to Withdraw
                  </p>
                  <div className="flex items-end gap-1">
                    <p className="text-h4">171,624.00</p>
                    <p className="text-sm">{market?.collateralToken.symbol}</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-secondary-foreground">
                    Available to Borrow
                  </p>
                  <div className="flex items-end gap-1">
                    <p className="text-h4">0</p>
                    <p className="text-sm">{market?.collateralToken.symbol}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="flex-1">
            <CardHeader className="font-chakra text-h5">Your Risk</CardHeader>
            <CardContent>
              <p className="mb-4 text-secondary-foreground">
                Liquidation Price
              </p>
              <div className="flex items-end gap-1">
                <p className="text-h3">171,624.00</p>
                <p className="text-sm">{market?.collateralToken.symbol}</p>
              </div>
              <p className="text-secondary-foreground">
                Current Price: 4,000.58 USDC/wstETH
              </p>
              <div className="mt-8 flex">
                <div className="flex flex-1 flex-col">
                  <p className="text-secondary-foreground">Current LTV</p>
                  <div className="flex items-end gap-1">
                    <p className="text-h4">171,624.00</p>
                    <p className="text-sm">{market?.collateralToken.symbol}</p>
                  </div>
                </div>
                <div className="flex flex-1 flex-col">
                  <p className="text-secondary-foreground">Max LTV</p>
                  <div className="flex items-end gap-1">
                    <p className="text-h4">0</p>
                    <p className="text-sm">{market?.collateralToken.symbol}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </main>
  )
}
