import { Button } from "components/base/button"
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

  return match(step)
    .with("review", () => {
      return (
        <div className="flex w-full flex-col items-center gap-y-4 bg-transparent">
          <div className="space-y-6 text-center">
            <h2 className="gradient-text text-3xl font-semibold">
              Lock in your rate
            </h2>
            <p className="text-center text-lg text-[#8A92A3]">
              Acquire coverage for your borrow position and get peace of mind
              and predictability. Lock in <br /> your current borrow rate for
              the next 90 days. If the rate goes lower, you’ll benefit from that
              too.
            </p>
            <div className="flex justify-between text-left">
              <div className="space-y-1">
                <div className="text-[#8A92A3]">Lock in max rate</div>
                <div className="font-mono text-3xl font-medium">10.31%</div>
                <div className="text-[#8A92A3]">Current rate: 9.31% APY</div>
              </div>

              <div className="space-y-1">
                <div className="text-[#8A92A3]">Fixed rate debt 1yr</div>
                <div className="font-mono text-3xl font-medium">188,385.21</div>
                <div className="text-[#8A92A3]">
                  Proj. var debt: 186,521.12 USDC
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-[#8A92A3]">Coverage period</div>
                <div className="font-mono text-3xl font-medium">1 yr</div>
                <div className="text-[#8A92A3]">Coverage ends: 20-May-2025</div>
              </div>
            </div>
          </div>

          <div className="grid h-full grid-cols-3 rounded border bg-card">
            {/* image simulation */}
            <div className="col-span-2">
              <img src="/image.png" className="h-[600px]" />
            </div>

            <div>
              <div>
                <div className="text-[#8A92A3]">
                  Debt being locked at 10.41%
                </div>
                <div className="font-mono text-3xl font-medium">
                  171,624.00 USDC
                </div>
              </div>

              {/* collapsible */}

              <div className="space-y-1">
                <div className="text-[#8A92A3]">Cost of Coverage</div>
                <div className="font-mono text-3xl font-medium">
                  13,792.92 USDC
                </div>
                <div className="text-[#8A92A3]">What am I paying for?</div>
              </div>

              <div>
                <Button variant="secondary">
                  View your future position with covered debt
                </Button>
                <Button>Pay from wallet</Button>
              </div>
            </div>
          </div>
        </div>
      )
    })
    .exhaustive()
}
