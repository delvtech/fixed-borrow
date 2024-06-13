import { cva, type VariantProps } from "class-variance-authority"
import * as React from "react"

import { cn } from "components/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-[8px] border py-[4px] px-[8px] text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-default",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-secondary text-foreground border-border-secondary",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
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
