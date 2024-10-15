import { cn } from "components/utils"

export function BigNumberInput(
  props: React.InputHTMLAttributes<HTMLInputElement>
) {
  return (
    <input
      {...props}
      className={cn(
        "h-full w-full grow rounded-sm border-none bg-secondary p-4 font-mono text-[24px] [appearance:textfield] focus:border-none focus:outline-none focus:ring-0 [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
        props.className
      )}
      placeholder="0"
      type="number"
      //   id="bondAmountInput"
      //   disabled={isNil(allowance)}
      //   value={fixed(state.bondAmount, decimals).format({
      //     group: false,
      //     trailingZeros: false,
      //   })}
      step="any"
      min={0}
      /** Prevents scrolling from changing the input  */
      onWheel={(e) => e.currentTarget.blur()}
      /** Prevents any malformed pasted values from changing the input */
      onPaste={(e) => {
        const clipboardData = e.clipboardData
        const pastedData = parseFloat(clipboardData.getData("text"))

        try {
          if (pastedData < 0) throw new Error()

          //   fixed(pastedData, decimals)
        } catch {
          e.preventDefault()
        }
      }}
      onKeyDown={(e) => {
        if (e.key === "-" || e.key === "+") {
          e.preventDefault()
        }
      }}
      //   onChange={(e) => {
      //     try {
      //       // sanitize input
      //       const value = parseFixed(e.currentTarget.value, decimals)
      //       dispatch({
      //         type: "bondAmountInput",
      //         payload: {
      //           amount: e.target.value ?? "0",
      //         },
      //       })

      //       const totalShortedBonds =
      //         props.activePosition.totalCoverage + value.bigint
      //       const percent = fixed(totalShortedBonds, decimals).div(
      //         props.position.totalDebt,
      //         decimals
      //       )

      //       setSliderValue(Math.floor(percent.toNumber() * 100))
      //     } catch {
      //       e.preventDefault()
      //     }
      //   }}
    />
  )
}
