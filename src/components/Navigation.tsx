import { ConnectButton } from "@rainbow-me/rainbowkit"
import { Button } from "components/ui/button"

export function Navbar() {
  return (
    <div className="grid grid-cols-3 py-2 items-center px-8 border-b-gray-100 border-b">
      <div>
        <span className="text-xl font-semibold font-chakra">
          Hyperdrive Borrow
        </span>
      </div>

      <div></div>

      <div className="justify-self-end flex gap-x-2">
        <Button variant="secondary">Learn how fixed rates work</Button>

        <ConnectButton chainStatus="none" showBalance={false} />
      </div>
    </div>
  )
}
