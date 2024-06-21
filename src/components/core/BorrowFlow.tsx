import { useState } from "react"
import { match } from "ts-pattern"
import { Market } from "../../types"

interface BorrowFlowProps {
  market: Market
}

type BorrowFlowStep = "review"

export function BorrowFlow(props: BorrowFlowProps) {
  const [step, setStep] = useState<BorrowFlowStep>("review")

  return match(step)
    .with("review", () => {
      return <div>{props.market.hyperdrive}</div>
    })
    .exhaustive()
}
