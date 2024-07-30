import { cn } from "components/utils"
import { ReactNode } from "react"

interface PositionCardStatProps {
  title: string
  value: string | ReactNode
  symbol: string
  secondaryValue?: string | ReactNode
  size?: "lg" | "sm"
}

export function PositionCardStat({
  title,
  value,
  secondaryValue,
  symbol,
  size = "lg",
}: PositionCardStatProps) {
  return (
    <>
      <p className={cn("text-secondary-foreground", { "mb-4": size === "lg" })}>
        {title}
      </p>
      <div className="flex items-end gap-1">
        <p
          className={cn({ "text-h3": size === "lg", "text-h4": size === "sm" })}
        >
          {value}
        </p>
        <p className="text-sm">{symbol}</p>
      </div>
      <p className="text-secondary-foreground">{secondaryValue}</p>
    </>
  )
}
