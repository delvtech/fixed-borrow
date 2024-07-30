import { Card, CardContent, CardHeader } from "components/base/card"
import { Skeleton } from "components/base/skeleton"

export function PositionCardSkeleton(): JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <Skeleton className="size-14 bg-muted p-2" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-12 w-40 rounded-full bg-muted" />
        </div>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-evenly gap-6 lg:flex-row">
        <Card className="flex min-h-80 w-full flex-1 flex-col justify-evenly gap-6">
          <CardHeader>
            <Skeleton className="h-4 w-24 bg-muted" />
            <Skeleton className="h-6 w-32 bg-muted" />
            <Skeleton className="h-4 w-16 bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="flex">
              <div className="flex flex-1 flex-col gap-4">
                <Skeleton className="h-4 w-32 bg-muted" />
                <Skeleton className="h-6 w-16 bg-muted" />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <Skeleton className="h-4 w-32 bg-muted" />
                <Skeleton className="h-6 w-16 bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="flex min-h-80 w-full flex-1 flex-col justify-evenly gap-6">
          <CardHeader>
            <Skeleton className="h-4 w-24 bg-muted" />
            <Skeleton className="h-6 w-32 bg-muted" />
            <Skeleton className="h-4 w-16 bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="flex">
              <div className="flex flex-1 flex-col gap-4">
                <Skeleton className="h-4 w-32 bg-muted" />
                <Skeleton className="h-6 w-16 bg-muted" />
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <Skeleton className="h-4 w-32 bg-muted" />
                <Skeleton className="h-6 w-16 bg-muted" />
              </div>
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
