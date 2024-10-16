import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "components/utils"
import * as React from "react"

type ProgressSegment = {
  value: number
  color?: string
}

type Props = React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> & {
  segments: ProgressSegment[]
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  Props
>(({ className, segments, ...props }, ref) => {
  const sortedSegments = segments.sort((a, b) => a.value - b.value)

  return (
    <ProgressPrimitive.Root
      ref={ref}
      className={cn(
        "relative h-6 w-full overflow-hidden rounded bg-secondary",
        className
      )}
      {...props}
    >
      {sortedSegments.map((segment, index) => (
        <ProgressPrimitive.Indicator
          key={index}
          className={cn(
            "absolute h-full transition-all",
            segment.color ? segment.color : "bg-primary"
          )}
          style={{
            width: `${segment.value}%`,
            zIndex: sortedSegments.length - index,
          }}
        />
      ))}
    </ProgressPrimitive.Root>
  )
})

Progress.displayName = "Progress"

export { Progress }
