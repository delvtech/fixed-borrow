import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { useMutation } from "@tanstack/react-query"
import { OrderIntent } from "otc-api"
import { getRandomSalt, signOrderIntent } from "src/otc/utils"
import { Address } from "viem"
import { useAccount, usePublicClient, useWalletClient } from "wagmi"

type OrderData = {
  hyperdrive: Address
  amount: bigint
  slippageGuard: bigint
  expiry: bigint
  orderType: bigint
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
      const currentDate = BigInt(Math.ceil(Date.now() / 1000))
      const expiry = orderData.expiry + currentDate
      const salt = getRandomSalt()
      const orderIntent: OrderIntent = await signOrderIntent(
        hyperdriveMatchingAddress,
        walletClient,
        account,
        {
          trader: account,
          hyperdrive: orderData.hyperdrive,
          amount: orderData.amount,
          slippageGuard: orderData.slippageGuard,
          minVaultSharePrice: vaultSharePrice,
          expiry: Number(expiry),
          orderType: Number(orderData.orderType),
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
