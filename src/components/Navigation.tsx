import { ConnectButton } from "@rainbow-me/rainbowkit"

export function Navbar() {
  return (
    <div className="grid grid-cols-3 py-2">
      <div>
        <span>fixed-borrow</span>
      </div>

      <div></div>

      <div className="justify-self-end">
        <ConnectButton />
      </div>
    </div>
  )
}
