import { fixed, parseFixed } from "@delvtech/fixed-point-wasm"
import { ReadWriteHyperdrive } from "@delvtech/hyperdrive-viem"
import { useMutation } from "@tanstack/react-query"
import { isNil } from "lodash-es"
import { Address, encodePacked, maxUint256, toFunctionSelector } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

export function useOpenShort() {
  const client = usePublicClient()
  const { address: account } = useAccount()
  const { data: walletClient } = useWalletClient()

  return useMutation({
    mutationFn: async (vars: {
      bondAmount: bigint
      hyperdrive: Address
      rateQuote: bigint
    }) => {
      // early termination
      if (isNil(vars.bondAmount) || isNil(walletClient) || isNil(client)) return
      if (vars.bondAmount <= 0n) return
      if (!account) return

      const writeHyperdrive = new ReadWriteHyperdrive({
        address: vars.hyperdrive,
        publicClient: client,
        walletClient,
      })
      const minVaultSharePrice = (await writeHyperdrive.getPoolInfo())
        .vaultSharePrice

      // lets reduce to 4 decimals
      const reduced = fixed(vars.rateQuote).divUp(parseFixed(1e12)).bigint
      const storedQuote = fixed(reduced, 4)

      const encodedRate = encodePacked(
        ["bytes4", "uint24"],
        [toFunctionSelector("frb(uint24)"), Number(storedQuote.bigint)]
      )

      return await writeHyperdrive.openShort({
        args: {
          destination: account,
          minVaultSharePrice,
          maxDeposit: maxUint256,
          asBase: true,
          bondAmount: vars.bondAmount,
          extraData: encodedRate,
        },
      })
    },
  })
}
