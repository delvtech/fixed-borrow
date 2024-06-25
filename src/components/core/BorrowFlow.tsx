import { Button } from "components/base/button"
import { Card, CardContent } from "components/base/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "components/base/collapsible"
import { Input } from "components/base/input"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { match } from "ts-pattern"
import { Market } from "../../types"

interface BorrowFlowProps {
  market: Market
}

type BorrowFlowStep = "review"

export function BorrowFlow(props: BorrowFlowProps) {
  const [step] = useState<BorrowFlowStep>("review")

  console.log(props)

  const [isOpen, setIsOpen] = useState(false)

  return match(step)
    .with("review", () => {
      return (
        <div className="flex w-full flex-col items-center gap-y-16 bg-transparent">
          <div className="space-y-8 text-center">
            <h3 className="gradient-text font-semibold">Lock in your rate</h3>

            <p className="text-lg text-secondary-foreground">
              Acquire coverage for your borrow position and get peace of mind
              and predictability. Lock in <br /> your current borrow rate for
              the next 90 days. If the rate goes lower, you’ll benefit from that
              too.
            </p>

            <div className="flex justify-between text-left">
              <div className="space-y-1">
                <p className="text-sm text-secondary-foreground">
                  Lock in max rate
                </p>
                <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                  10.31% <span className="text-md font-normal">APY</span>
                </h3>
                <p className="text-sm text-secondary-foreground">
                  Current rate: 9.31% APY
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-secondary-foreground">
                  Fixed rate debt 1yr
                </p>
                <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                  188,385.21
                  <span className="text-md font-normal">USDC</span>
                </h3>
                <p className="text-sm text-secondary-foreground">
                  Proj. var debt: 186,521.12 USDC
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-sm text-secondary-foreground">
                  Coverage period
                </p>
                <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                  1 <span className="text-md font-normal">yr</span>
                </h3>
                <p className="text-sm text-secondary-foreground">
                  Coverage ends: 20-May-2025
                </p>
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="grid h-full max-w-5xl grid-cols-3 rounded border bg-card p-6">
              {/* image simulation */}
              <div className="col-span-2">
                <img src="/image.png" className="h-[440px]" />
              </div>

              <div className="flex flex-col gap-y-12">
                <div className="space-y-4">
                  <p className="text-sm text-secondary-foreground">
                    Debt being locked at 10.41%
                  </p>
                  <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                    171,624.00 <span className="text-md font-normal">USDC</span>
                  </h3>

                  <Collapsible
                    open={isOpen}
                    onOpenChange={setIsOpen}
                    className="w-full space-y-2 border-y py-4"
                  >
                    <CollapsibleTrigger className="flex w-full items-center text-start">
                      <p className="inline font-medium text-secondary-foreground">
                        Protect less or more than total debt
                      </p>
                      <ChevronDown className="ml-auto inline h-4 w-4 text-secondary-foreground" />
                    </CollapsibleTrigger>
                    <CollapsibleContent className="space-y-2">
                      <p className="text-base">
                        How much debt would you like to cover?
                      </p>

                      <Input
                        className="rounded-[8px] font-mono placeholder:text-secondary-foreground"
                        placeholder="0.00"
                      />
                      {/* <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                      @radix-ui/colors
                    </div>
                    <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
                      @stitches/react
                    </div> */}
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* collapsible */}

                <div className="space-y-1">
                  <p className="text-secondary-foreground">Cost of Coverage</p>
                  <h3 className="flex items-baseline gap-x-1 font-mono font-medium">
                    13,624.00 <span className="text-md font-normal">USDC</span>
                  </h3>
                  <p className="text-secondary-foreground">
                    What am I paying for?
                  </p>
                </div>

                <div className="space-y-2">
                  <Button
                    variant="secondary"
                    className="w-full px-4 text-sm font-light"
                  >
                    View your future position with covered debt
                  </Button>
                  <Button className="w-full">Pay from wallet</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    })
    .exhaustive()
}
