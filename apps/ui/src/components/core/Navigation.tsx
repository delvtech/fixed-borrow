import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "components/base/button"
import { Link } from "wouter"

export function Navbar() {
  return (
    <div className="grid grid-cols-3 items-center px-8 py-4">
      <div className="flex items-center gap-8">
        <Button variant="ghost" className="rounded-lg" asChild>
          <Link href="/" aria-label="Go to Hyperdrive Home page">
            <img className="h-5" src="/fixed-borrow-logo.png" />
          </Link>
        </Button>
      </div>

      <div className="justify-self-center"></div>

      <div className="flex items-center gap-x-2 justify-self-end">
        <div className="min-h-[40px] w-max">
          <ConnectButton
            showBalance={false}
            accountStatus={{
              smallScreen: "avatar",
              largeScreen: "full",
            }}
            chainStatus={{
              smallScreen: "icon",
              largeScreen: "icon",
            }}
          />
        </div>
      </div>
    </div>
  )
}
