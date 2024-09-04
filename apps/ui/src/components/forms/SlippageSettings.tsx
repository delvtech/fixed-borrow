import { fixed, parseFixed } from "@delvtech/fixed-point-wasm"
import { Button } from "components/base/button"
import { Input } from "components/base/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "components/base/popover"
import { cn } from "components/utils"
import { Settings } from "lucide-react"
import { useState } from "react"

const quickSlippageAmounts = [
  BigInt(0.001e18), // 0.1%
  BigInt(0.005e18), // 0.5%
  BigInt(0.01e18), // 1%
] as const
export const defaultSlippageAmount = quickSlippageAmounts[1]

export interface SlippageSettingsProps {
  onChange: (amount: bigint) => void
  amount?: bigint
}

function SlippageSettings({
  onChange,
  amount = defaultSlippageAmount,
}: SlippageSettingsProps) {
  const [inputValue, setInputValue] = useState(
    fixed(amount).mul(100, 0).format({
      trailingZeros: false,
    })
  )

  function handleChange(amount: string | bigint) {
    let amountString: string
    let amountInt: bigint

    switch (typeof amount) {
      case "string": {
        // Truncate to 16 decimal places (the max precision after division).
        const [int, fraction] = amount.split(".")
        amountString = `${int}${fraction !== undefined ? `.${fraction.slice(0, 16)}` : ""}`
        amountInt = parseFixed(amountString).div(100, 0).bigint
        break
      }

      case "bigint": {
        amountString = fixed(amount).mul(100, 0).format({
          trailingZeros: false,
        })
        amountInt = amount
        break
      }
    }

    setInputValue(amountString)
    onChange(amountInt)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          className="h-min rounded-[4px] p-1 px-2 text-xs text-secondary-foreground hover:bg-accent/80 hover:text-secondary-foreground"
        >
          Slippage:{" "}
          <span className="font-mono">
            {fixed(amount).format({
              decimals: 18,
              percent: true,
              trailingZeros: false,
            })}
          </span>
          <Settings size={16} />
        </Button>
      </PopoverTrigger>

      <PopoverContent
        className="w-64 border border-border-secondary shadow"
        align="end"
      >
        <div className="grid gap-4">
          <h3 className="text-lg font-medium leading-none">Max. slippage</h3>

          {/* Quick slippage amount buttons */}
          <div className="flex items-center justify-center gap-2">
            {quickSlippageAmounts.map((quickAmount) => (
              <Button
                key={`quick-slippage-${quickAmount}`}
                variant="secondary"
                onClick={() => handleChange(quickAmount)}
                className={cn(
                  "px-auto h-7 grow rounded-[4px] border border-border-secondary bg-muted/20 text-xs text-foreground/75 hover:text-foreground",
                  {
                    "bg-muted text-foreground": amount === quickAmount,
                  }
                )}
              >
                {fixed(quickAmount).format({
                  decimals: 2,
                  percent: true,
                  trailingZeros: false,
                })}
              </Button>
            ))}
          </div>

          {/* Custom slippage input */}
          <label className="flex items-center gap-2 pl-1 text-sm">
            Custom
            <Input
              type="number"
              min={0}
              step={0.1}
              value={inputValue}
              onKeyDown={(e) => {
                if (["-", "e", "E"].includes(e.key)) {
                  e.preventDefault()
                }
              }}
              onChange={({ target }) => handleChange(target.value)}
              className="h-8 grow"
            />
          </label>
        </div>
      </PopoverContent>
    </Popover>
  )
}

export default SlippageSettings
