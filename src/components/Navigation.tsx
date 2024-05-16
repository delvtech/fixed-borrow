import { ConnectButton } from "@rainbow-me/rainbowkit"

export function Navbar() {
  return (
    <div className="grid grid-cols-3 py-2 items-center">
      <div>
        <span className="text-xl font-semibold font-chakra">
          Hyperdrive Borrow
        </span>
      </div>

      <div></div>

      <div className="justify-self-end">
        <ConnectButton chainStatus="none" showBalance={false} />
      </div>
    </div>
  )
}
