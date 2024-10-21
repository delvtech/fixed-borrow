import { Button } from "components/base/button"
import { ExternalLink, GlobeLock } from "lucide-react"

export function VpnNotAllowedPage() {
  return (
    <main>
      <div className="flex w-screen flex-col items-center justify-center gap-8 text-center">
        <div className="space-y-3">
          <h2 className="flex items-center justify-center gap-4">
            <GlobeLock className="size-10 text-red-500" /> VPN Detected
          </h2>

          <p>We&lsquo;re sorry but this app is not accessible for VPN users.</p>
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
