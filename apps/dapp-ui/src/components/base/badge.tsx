import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "components/utils"

{
  /* <Badge className="flex items-center gap-1 rounded-[4px] border-none bg-popover px-2 py-1 font-mono text-xs text-secondary-foreground"> */
}

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-[4px] border py-[4px] px-[8px] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default whitespace-nowrap",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-popover text-foreground border-border-secondary",
        secondary:
          "border-transparent bg-popover text-secondary-foreground hover:bg-popover/80",
        destructive:
          "border-transparent bg-destructive/25 text-destructive-foreground hover:bg-destructive/10",
        outline: "text-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
