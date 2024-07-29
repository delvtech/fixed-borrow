import { Skeleton } from "components/base/skeleton"
import { cn } from "components/utils"

interface PositionCardStatProps {
  title: string
  value: string | JSX.Element
  secondaryValue?: string | JSX.Element
  symbol?: string
  size?: "lg" | "sm"
  dataLoading?: boolean
}

export function PositionCardStat({
  title,
  value,
  secondaryValue,
  symbol,
  size = "lg",
  dataLoading = false,
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
          {dataLoading ? (
            value
          ) : (
            <Skeleton className="h-8 w-[250px] rounded-sm bg-muted" />
          )}
        </p>
        <p className="text-sm">{symbol}</p>
      </div>
      <p className="text-secondary-foreground">
        {dataLoading ? (
          secondaryValue
        ) : (
          <Skeleton className="mt-1 h-8 w-[150px] rounded-sm bg-muted" />
        )}
      </p>
    </>
  )
}
