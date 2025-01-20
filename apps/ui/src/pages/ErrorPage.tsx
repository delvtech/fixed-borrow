import { Button } from "components/base/button"
import { ExternalLink, TriangleAlert } from "lucide-react"

export function ErrorPage() {
  return (
    <main>
      <div className="flex w-screen flex-col items-center justify-center gap-8 text-center">
        <div className="space-y-3">
          <h2 className="flex items-center justify-center gap-4">
            <TriangleAlert className="size-10 text-red-500" /> Unexpected Error
          </h2>

          <p>
            We&lsquo;re sorry but an error occurred while loading the app.
            Refresh the page or try again later.
          </p>
        </div>

        <Button asChild>
          <a href="https://hyperdrive.box" className="daisy-link-primary">
            Hyperdrive Website <ExternalLink size={14} />
          </a>
        </Button>
      </div>
    </main>
  )
}
