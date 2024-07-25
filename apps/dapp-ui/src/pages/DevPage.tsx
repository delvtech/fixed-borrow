import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { Button } from "components/base/button"
import { usePublicClient } from "wagmi"

export default function DevPage() {
  const client = usePublicClient()

  return (
    <main className="my-16 flex flex-col gap-y-24">
      <Button
        onClick={async () => {
          if (!client) return

          const read = new ReadHyperdrive({
            address: "0xE352F4D16C7Ee4162d1aa54b77A15d4DA8f35f4b",
            publicClient: client,
          })
          await read.getFixedApr()
          console.log(await read.getFixedApr())
        }}
      >
        click
      </Button>
    </main>
  )
}
