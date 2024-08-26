import { useState } from "react"
import { formatUnits, parseUnits } from "viem"

interface UseNumericInputResult {
  amount: string | undefined
  amountAsBigInt: bigint | undefined
  setAmount: (newAmount: string) => void
}

interface UseNumericInputProps {
  decimals: number
  defaultValue?: bigint
}

export function useNumericInput({
  decimals,
  defaultValue,
}: UseNumericInputProps): UseNumericInputResult {
  const [amount, setAmount] = useState<string>(
    defaultValue !== undefined ? formatUnits(defaultValue, decimals) : ""
  )
  const amountAsBigInt = amount
    ? parseUnits(amount as `${number}`, decimals)
    : undefined

  return {
    amount,
    amountAsBigInt,
    setAmount: setAmount,
  }
}
