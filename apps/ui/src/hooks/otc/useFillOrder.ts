import { useMutation, UseMutationOptions } from "@tanstack/react-query"
import { HyperdriveMatchingEngineAbi } from "artifacts/hyperdrive/HyperdriveMatchingEngine"
import { createOrderKey, OrderIntent } from "otc-api"
import { otc } from "src/otc/client"
import { Address, TransactionReceipt } from "viem"
import { usePublicClient, useWalletClient } from "wagmi"

interface FillOrderOptions {
  matchingEngine: Address
  pendingOrder: OrderIntent
  newOrder: OrderIntent
  onMined?: (receipt: TransactionReceipt) => void
}

type TypedMutationOptions = Omit<
  UseMutationOptions<
    `0x${string}` | undefined,
    Error,
    FillOrderOptions,
    unknown
  >,
  "mutationFn"
>

export function useFillOrder(options?: TypedMutationOptions) {
  const publicClient = usePublicClient()
  const { data: walletClient } = useWalletClient()

  return useMutation({
    ...options,
    mutationFn: async ({ matchingEngine, pendingOrder, newOrder, onMined }) => {
      if (!publicClient || !walletClient) return

      const account = walletClient.account.address

      // Determine the long and short orders
      const [longOrder, shortOrder] =
        pendingOrder.orderType === 0
          ? [pendingOrder, newOrder]
          : [newOrder, pendingOrder]

      const { request } = await publicClient.simulateContract({
        address: matchingEngine,
        abi: HyperdriveMatchingEngineAbi,
        functionName: "matchOrders",
        account: walletClient.account,
        args: [
          {
            ...longOrder,
            expiry: BigInt(longOrder.expiry),
          },
          {
            ...shortOrder,
            expiry: BigInt(shortOrder.expiry),
          },
          0n,
          {
            destination: account,
            asBase: true,
            extraData: "0x",
          },
          {
            destination: account,
            asBase: true,
            extraData: "0x",
          },
          account, // Fee recipient
          true, // Long first
        ],
      })

      const txHash = await walletClient.writeContract(request)

      // Update the API once mined
      publicClient.waitForTransactionReceipt({ hash: txHash }).then((r) => {
        if (onMined) onMined(r)
        otc.createOrder({
          ...newOrder,
          matchKey: createOrderKey("pending", pendingOrder),
        })
      })

      return txHash
    },
  })
}
