import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Address, erc20Abi } from "viem"
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWriteContract,
} from "wagmi"

interface UseApprovalResult {
  approve: () => void
  needsApproval: boolean
  allowance: bigint | undefined
  isLoading: boolean
}

/**
 * Hook to determine if an allowance is required and provides
 * an async function to execute said transaction.
 *
 * @param {?Address} [tokenAddress]
 * @param {?Address} [spenderAddress]
 * @param {?bigint} [amount]
 * @returns {UseApprovalResult}
 */
export function useApproval(
  tokenAddress?: Address,
  spenderAddress?: Address,
  amount?: bigint
): UseApprovalResult {
  const { address: account } = useAccount()
  const publicClient = usePublicClient()
  const { writeContractAsync } = useWriteContract()

  const queryClient = useQueryClient()

  const enabled = tokenAddress && spenderAddress && account && publicClient

  const { data: allowance } = useReadContract({
    abi: erc20Abi,
    functionName: "allowance",
    address: tokenAddress,
    args: enabled ? [account, spenderAddress] : undefined,
  })

  const needsApproval = Boolean(
    !allowance || (allowance && amount && allowance < amount)
  )

  const { mutateAsync: approve, isPending: isLoading } = useMutation({
    mutationFn: async () => {
      if (enabled && amount && amount > 0n) {
        const hash = await writeContractAsync({
          abi: erc20Abi,
          functionName: "approve",
          address: tokenAddress,
          args: [spenderAddress, amount],
        })

        await publicClient?.waitForTransactionReceipt({
          hash,
        })
      }
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries()
    },
  })

  return {
    approve,
    needsApproval,
    allowance,
    isLoading,
  }
}
