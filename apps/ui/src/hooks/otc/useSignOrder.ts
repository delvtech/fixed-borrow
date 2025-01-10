import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { useMutation } from "@tanstack/react-query"
import { OrderIntent } from "otc-api"
import { getRandomSalt, signOrderIntent } from "src/otc/utils"
import { Address } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

type OrderData = {
  hyperdrive: Address
  bondAmount: bigint
  depositAmount: bigint
  expiry: number
  orderType: number
}

export const useSignOrder = (hyperdriveMatchingAddress: Address) => {
  const { address: account } = useAccount()
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  return useMutation<OrderIntent | undefined, Error, OrderData>({
    mutationFn: async (
      orderData: OrderData
    ): Promise<OrderIntent | undefined> => {
      if (!account || !walletClient || !publicClient) {
        throw new Error("Wallet not connected")
      }
      const readHyperdrive = new ReadHyperdrive({
        address: orderData.hyperdrive,
        publicClient,
      })
      const { vaultSharePrice } = await readHyperdrive.getPoolInfo()
      const salt = getRandomSalt()
      const orderIntent: OrderIntent = await signOrderIntent(
        hyperdriveMatchingAddress,
        publicClient,
        walletClient,
        account,
        {
          trader: account,
          hyperdrive: orderData.hyperdrive,
          amount:
            orderData.orderType === 0
              ? orderData.depositAmount
              : orderData.bondAmount,
          slippageGuard:
            orderData.orderType === 0
              ? orderData.bondAmount
              : orderData.depositAmount,
          minVaultSharePrice: vaultSharePrice,
          expiry: orderData.expiry,
          orderType: orderData.orderType,
          options: {
            destination: account,
            asBase: true,
            extraData: "0x",
          },
          salt,
        }
      )
      return orderIntent
    },
    onError: (error) => {
      console.error("Error signing order:", error)
    },
    onSuccess: (data) => {
      console.log("Order signed successfully:", data)
    },
  })
}
