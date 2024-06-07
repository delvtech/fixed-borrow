import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "components/base/button"

export function Navbar() {
  return (
    <div className="grid grid-cols-3 py-4 items-center px-8 border-b-2 bg-secondary">
      <div>
        <span className="text-xl font-semibold font-chakra">
          Hyperdrive Borrow
        </span>
      </div>

      <div></div>

      <div className="justify-self-end flex gap-x-2">
        <Button>Learn how fixed rates work</Button>

        <div className="w-max">
          <ConnectButton showBalance={false} />
        </div>
      </div>
    </div>
  )
}
