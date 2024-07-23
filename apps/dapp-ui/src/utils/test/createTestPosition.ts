import { useMutation } from "@tanstack/react-query"
import { MorphoBlueAbi } from "lib/morpho/abi/MorphoBlueAbi"
import { wMulDown } from "lib/morpho/utils"
import { zeroHash } from "viem"
import {
  useAccount,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi"
import { SupportedChainId, morphoAddressesByChain } from "~/constants"
import { Market } from "../../types"

export function useTestPosition(market?: Market) {
  console.log(market)
  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  const { address: destination } = useAccount()

  const { data: maxMintAmountLoan } = useReadContract({
    abi: [
      {
        type: "function",
        name: "maxMintAmount",
        inputs: [],
        outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
        stateMutability: "view",
      },
    ],
    functionName: "maxMintAmount",
    address: market?.loanToken.address,
  })

  const maxMintAmountCollateral = 5000000000000000000000n

  //   const { data: maxMintAmountCollateral } = useReadContract({
  //     abi: [
  //       {
  //         type: "function",
  //         name: "maxMintAmount",
  //         inputs: [],
  //         outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  //         stateMutability: "view",
  //       },
  //     ],
  //     functionName: "maxMintAmount",
  //     address: market?.collateralToken.address,
  //   })

  return useMutation({
    mutationKey: [
      market?.hyperdrive,
      "test-position",
      maxMintAmountLoan?.toString(),
      maxMintAmountCollateral?.toString(),
    ],
    mutationFn: async () => {
      if (
        !destination ||
        !maxMintAmountLoan ||
        !maxMintAmountCollateral ||
        !market ||
        !walletClient ||
        !publicClient ||
        !market
      )
        return

      const chainId = walletClient.chain.id
      const morphoBlueAddress =
        morphoAddressesByChain[chainId as SupportedChainId].blue

      // Math.min but for bigints
      const maxMintAmount =
        maxMintAmountLoan > maxMintAmountCollateral
          ? maxMintAmountCollateral
          : maxMintAmountLoan

      console.log(maxMintAmountLoan, maxMintAmountCollateral)

      //   let hash = await walletClient.writeContract({
      //     abi: parseAbi([
      //       "function mint(address destination, uint256 mintAmount)",
      //     ]),
      //     address: market.loanToken.address,
      //     functionName: "mint",
      //     args: [destination, maxMintAmountLoan],
      //   })

      //   await publicClient.waitForTransactionReceipt({
      //     hash,
      //   })

      //   hash = await walletClient.writeContract({
      //     abi: parseAbi([
      //       "function mint(address destination, uint256 mintAmount)",
      //     ]),
      //     address: market.collateralToken.address,
      //     functionName: "mint",
      //     args: [destination, maxMintAmountCollateral],
      //   })

      //   await publicClient.waitForTransactionReceipt({
      //     hash,
      //   })

      //   hash = await walletClient.writeContract({
      //     abi: erc20Abi,
      //     address: market.loanToken.address,
      //     functionName: "approve",
      //     args: [morphoBlueAddress, maxUint256],
      //   })

      //   await publicClient.waitForTransactionReceipt({
      //     hash,
      //   })

      //   hash = await walletClient.writeContract({
      //     abi: erc20Abi,
      //     address: market.collateralToken.address,
      //     functionName: "approve",
      //     args: [morphoBlueAddress, maxUint256],
      //   })

      //   await publicClient.waitForTransactionReceipt({
      //     hash,
      //   })

      let hash = await walletClient.writeContract({
        abi: MorphoBlueAbi,
        address: morphoBlueAddress,
        functionName: "supplyCollateral",
        args: [
          {
            irm: market.metadata.oracle,
            oracle: market.metadata.irm,
            lltv: market.lltv,
            collateralToken: market.collateralToken.address,
            loanToken: market.loanToken.address,
          },
          maxMintAmount,
          destination,
          zeroHash,
        ],
      })

      await publicClient.waitForTransactionReceipt({
        hash,
      })

      hash = await walletClient.writeContract({
        abi: MorphoBlueAbi,
        address: morphoBlueAddress,
        functionName: "borrow",
        args: [
          {
            irm: market.metadata.oracle,
            oracle: market.metadata.irm,
            lltv: market.lltv,
            collateralToken: market.collateralToken.address,
            loanToken: market.loanToken.address,
          },
          wMulDown(maxMintAmount, market.lltv),
          0n,
          destination,
          zeroHash,
        ],
      })

      await publicClient.waitForTransactionReceipt({
        hash,
      })
    },
  })
}
