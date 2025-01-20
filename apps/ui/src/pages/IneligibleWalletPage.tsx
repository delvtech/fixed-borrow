import { Button } from "components/base/button"
import { ExternalLink } from "lucide-react"

export function IneligibleWalletPage() {
  return (
    <main>
      <div className="flex w-screen flex-col items-center justify-center gap-8 text-center">
        <div className="space-y-3">
          <h2 className="flex items-center justify-center gap-4">
            Ineligible Wallet Address
          </h2>
          <p>This wallet address is not eligible to use this website.</p>
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
