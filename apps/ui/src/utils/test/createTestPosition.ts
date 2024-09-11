import { fixed } from "@delvtech/fixed-point-wasm"
import { useMutation } from "@tanstack/react-query"
import { MorphoBlueAbi } from "lib/morpho/abi/MorphoBlueAbi"
import { getAppConfig } from "utils/getAppConfig"
import { erc20Abi, maxUint256, parseAbi } from "viem"
import {
  useAccount,
  useChainId,
  usePublicClient,
  useReadContract,
  useWalletClient,
} from "wagmi"
import { SupportedChainId, morphoAddressesByChain } from "~/constants"

export function useTestPosition() {
  const chainId = useChainId()

  const market = getAppConfig(chainId as SupportedChainId).morphoMarkets.at(1)

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

  // For some reason the max mint amount for the collateral token is off
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

      let hash = await walletClient.writeContract({
        abi: parseAbi([
          "function mint(address destination, uint256 mintAmount)",
        ]),
        address: market.loanToken.address,
        functionName: "mint",
        args: [destination, maxMintAmountLoan],
      })

      await publicClient.waitForTransactionReceipt({
        hash,
      })

      hash = await walletClient.writeContract({
        abi: parseAbi([
          "function mint(address destination, uint256 mintAmount)",
        ]),
        address: market.collateralToken.address,
        functionName: "mint",
        args: [destination, maxMintAmountCollateral],
      })

      await publicClient.waitForTransactionReceipt({
        hash,
      })

      hash = await walletClient.writeContract({
        abi: erc20Abi,
        address: market.loanToken.address,
        functionName: "approve",
        args: [morphoBlueAddress, maxUint256],
      })

      await publicClient.waitForTransactionReceipt({
        hash,
      })

      hash = await walletClient.writeContract({
        abi: erc20Abi,
        address: market.collateralToken.address,
        functionName: "approve",
        args: [morphoBlueAddress, maxUint256],
      })

      await publicClient.waitForTransactionReceipt({
        hash,
      })

      hash = await walletClient.writeContract({
        abi: MorphoBlueAbi,
        address: morphoBlueAddress,
        functionName: "supplyCollateral",
        args: [
          {
            irm: market.metadata.irm,
            oracle: market.metadata.oracle,
            lltv: market.lltv,
            collateralToken: market.collateralToken.address,
            loanToken: market.loanToken.address,
          },
          maxMintAmount,
          destination,
          "0x",
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
            irm: market.metadata.irm,
            oracle: market.metadata.oracle,
            lltv: market.lltv,
            collateralToken: market.collateralToken.address,
            loanToken: market.loanToken.address,
          },
          fixed(maxMintAmount).mul(85, 2).bigint,
          0n,
          destination,
          destination,
        ],
      })

      await publicClient.waitForTransactionReceipt({
        hash,
      })
    },
  })
}
