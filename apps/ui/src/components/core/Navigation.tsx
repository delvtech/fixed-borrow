import { useMediaQuery } from "@uidotdev/usehooks"
import { Button } from "components/base/button"
import { Link } from "wouter"
import { CustomConnectWalletButton } from "./CustomConnectWalletButton"

export function Navbar() {
  const isAtLeastSm = useMediaQuery("(min-width: 640px)")

  return (
    <div className="grid grid-cols-3 items-center px-8 py-4">
      <div className="flex items-center gap-8">
        <Button variant="ghost" className="shrink-0 rounded-lg" asChild>
          <Link href="/" aria-label="Go to Hyperdrive Home page">
            {isAtLeastSm ? (
              <img
                className="h-10"
                src="/assets/logos/delv-fixed-borrow-logo.svg"
              />
            ) : (
              <img
                className="h-5"
                src="/assets/logos/assets/logos/hyperdrive-logo.svg"
              />
            )}
          </Link>
        </Button>
      </div>

      <div className="justify-self-center"></div>

      <div className="flex items-center gap-x-2 justify-self-end">
        <div className="min-h-[40px] w-max">
          <CustomConnectWalletButton />
        </div>
      </div>
    </div>
  )
}
