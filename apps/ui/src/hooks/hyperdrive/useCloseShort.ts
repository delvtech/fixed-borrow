import { ReadWriteHyperdrive } from "@delvtech/hyperdrive-viem"
import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { Address } from "viem"
import { usePublicClient, useWalletClient } from "wagmi"

interface CloseShortOptions {
  maturityTime: bigint
  bondAmountIn: bigint
  minAmountOut: bigint
  destination: Address
  // not used, but possibly in the future
  //   asBase?: boolean
  //   extraData?: Address
}

type TypedMutationOptions = Omit<
  UseMutationOptions<
    `0x${string}` | undefined,
    Error,
    {
      hyperdrive: Address
      shortOptions: CloseShortOptions
    },
    unknown
  >,
  "mutationFn"
>

export function useCloseShort(options?: TypedMutationOptions) {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  return useMutation({
    ...options,
    mutationFn: async (args: {
      hyperdrive: Address
      shortOptions: CloseShortOptions
    }) => {
      if (!publicClient || !walletClient) return

      const writeHyperdrive = new ReadWriteHyperdrive({
        address: args.hyperdrive,
        publicClient,
        walletClient,
      })

      const hash = await writeHyperdrive.closeShort({
        args: {
          ...args.shortOptions,
          asBase: true,
          extraData: "0x",
        },
      })

      return hash
    },
  })
}
