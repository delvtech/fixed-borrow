import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { useMutation } from "@tanstack/react-query"
import { OrderType, signOrderIntent } from "src/otc/utils"
import { Address } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

// Define the type for the order data
type OrderData = {
  hyperdrive: Address
  amount: bigint
  slippageGuard: bigint
  expiry: bigint
  orderType: OrderType
}

export const useSignOrder = (hyperdriveMatchingAddress: Address) => {
  const { address: account } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  return useMutation({
    mutationFn: async (orderData: OrderData) => {
      if (!account || !walletClient || !publicClient) {
        throw new Error("Wallet not connected")
      }
      const readHyperdrive = new ReadHyperdrive({
        address: orderData.hyperdrive,
        publicClient,
      })
      const { vaultSharePrice } = await readHyperdrive.getPoolInfo()
      const signature = await signOrderIntent(
        hyperdriveMatchingAddress,
        walletClient,
        account,
        {
          trader: account,
          hyperdrive: orderData.hyperdrive,
          amount: orderData.amount,
          slippageGuard: orderData.slippageGuard,
          minVaultSharePrice: vaultSharePrice,
          expiry: orderData.expiry,
          orderType: orderData.orderType,
          options: {
            destination: account,
            asBase: true,
            extraData: "0x",
          },
          salt: "0x0000000000000000000000000000000000000000000000000000000000000000" as `0x${string}`,
        }
      )
      return signature
    },
    onError: (error) => {
      console.error("Error signing order:", error)
    },
    onSuccess: (data) => {
      console.log("Order signed successfully:", data)
    },
  })
}
