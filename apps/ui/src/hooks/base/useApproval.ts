import { Address, erc20Abi } from "viem"
import { useAccount, useReadContract, useWriteContract } from "wagmi"

export function useApproval(
  tokenAddress?: Address,
  spenderAddress?: Address,
  amount?: bigint
) {
  const { address: account } = useAccount()
  const enabled = tokenAddress && spenderAddress && account
  const { writeContractAsync } = useWriteContract()

  const { data: allowance } = useReadContract({
    abi: erc20Abi,
    functionName: "allowance",
    address: tokenAddress,
    args: enabled ? [account, spenderAddress] : undefined,
  })

  const needsApproval =
    !allowance || (allowance && amount && allowance < amount)

  const approve = () => {
    if (enabled && amount && amount > 0n) {
      writeContractAsync({
        abi: erc20Abi,
        functionName: "approve",
        address: tokenAddress,
        args: [spenderAddress, amount],
      })
    }
  }

  return {
    approve,
    needsApproval,
    allowance,
  }
}
