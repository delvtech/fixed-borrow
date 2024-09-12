import { useMutation } from "@tanstack/react-query"
import { getAppConfig } from "utils/getAppConfig"
import { useChainId, usePublicClient, useWalletClient } from "wagmi"
import { morphoAddressesByChain, SupportedChainId } from "~/constants"

import { MorphoBlueAbi } from "lib/morpho/abi/MorphoBlueAbi"
import { testClient } from "src/client/rainbowClient"
import {
  Address,
  encodeFunctionData,
  erc20Abi,
  erc4626Abi,
  maxUint256,
  parseEther,
} from "viem"

export function useTestPosition() {
  const chainId = useChainId()

  const market = getAppConfig(chainId as SupportedChainId).morphoMarkets.at(1)

  console.log(market)

  const { data: walletClient } = useWalletClient()
  const publicClient = usePublicClient()

  // const { address: destination } = useAccount()

  const destination = "0x005182C62DA59Ff202D53d6E42Cef6585eBF9617" as Address

  // const { data: maxMintAmountLoan } = useReadContract({
  //   abi: [
  //     {
  //       type: "function",
  //       name: "maxMintAmount",
  //       inputs: [],
  //       outputs: [{ name: "", type: "uint256", internalType: "uint256" }],
  //       stateMutability: "view",
  //     },
  //   ],
  //   functionName: "maxMintAmount",
  //   address: market?.loanToken.address,
  // })

  // For some reason the max mint amount for the collateral token is off
  // const maxMintAmountCollateral = 5000000000000000000000n

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
    mutationKey: [market?.hyperdrive, "test-position"],
    mutationFn: async () => {
      if (!destination || !market || !walletClient || !publicClient || !market)
        return

      // const chainId = walletClient.chain.id
      // const morphoBlueAddress =
      //   morphoAddressesByChain[chainId as SupportedChainId].blue

      // // Math.min but for bigints
      // const maxMintAmount =
      //   maxMintAmountLoan > maxMintAmountCollateral
      //     ? maxMintAmountCollateral
      //     : maxMintAmountLoan

      await testClient.setBalance({
        address: destination,
        value: parseEther("100"),
      })

      console.log("Minted ETH to account")

      const USDE_WHALE_MAINNET =
        "0xf89d7b9c864f589bbf53a82105107622b35eaa40" as Address
      const USDE_ADDRESS_MAINNET =
        "0x4c9EDD5852cd905f086C759E8383e09bff1E68B3" as Address

      const SUSDE_ADDRESS_MAINNET =
        "0x9D39A5DE30e57443BfF2A8307A4256c8797A3497" as Address

      const DAI_ADDRESS_MAINNET =
        "0x6b175474e89094c44da98b954eedeac495271d0f" as Address

      // USDe
      let transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [destination as Address, parseEther("20000")],
      })

      let hash = await testClient.sendUnsignedTransaction({
        from: USDE_WHALE_MAINNET,
        to: USDE_ADDRESS_MAINNET,
        data: transferData,
      })

      let receipt = await publicClient.waitForTransactionReceipt({ hash })

      console.log("Transferred 20,000 USDe from whale: ", receipt)

      // sUSDe

      // Approve USDe spend
      transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [SUSDE_ADDRESS_MAINNET, maxUint256],
      })

      hash = await testClient.sendUnsignedTransaction({
        from: destination,
        to: USDE_ADDRESS_MAINNET,
        data: transferData,
      })

      receipt = await publicClient.waitForTransactionReceipt({ hash })

      console.log("Approved USDe spend for sUSDe deposit: ", receipt)

      transferData = encodeFunctionData({
        abi: erc4626Abi,
        functionName: "deposit",
        args: [parseEther("10000"), destination],
      })

      hash = await testClient.sendUnsignedTransaction({
        from: destination,
        to: SUSDE_ADDRESS_MAINNET,
        data: transferData,
      })

      receipt = await publicClient.waitForTransactionReceipt({ hash })

      console.log("Deposited 10,000 USDe for sUSDe: ", receipt)

      // DAI
      transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [destination as Address, parseEther("20000")],
      })

      hash = await testClient.sendUnsignedTransaction({
        from: "0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf",
        to: DAI_ADDRESS_MAINNET,
        data: transferData,
      })

      receipt = await publicClient.waitForTransactionReceipt({ hash })

      console.log("Transferred 20,000 DAI from whale: ", receipt)

      // wstETH
      transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "transfer",
        args: [destination as Address, parseEther("10")],
      })

      hash = await testClient.sendUnsignedTransaction({
        from: "0xc329400492c6ff2438472d4651ad17389fcb843a",
        to: "0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0",
        data: transferData,
      })
      receipt = await publicClient.waitForTransactionReceipt({ hash })

      console.log("Transferred 10 wstETH from whale: ", receipt)

      // WETH
      transferData = encodeFunctionData({
        abi: WETHAbi,
        functionName: "deposit",
      })

      hash = await testClient.sendUnsignedTransaction({
        from: destination,
        to: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        data: transferData,
        value: parseEther("10"),
      })

      receipt = await publicClient.waitForTransactionReceipt({ hash })

      console.log("Deposited 10 ETH for WETH: ", receipt)

      // Supply Collateral to USDe/DAI market

      // Approve USDe spend
      transferData = encodeFunctionData({
        abi: erc20Abi,
        functionName: "approve",
        args: [
          morphoAddressesByChain[chainId as SupportedChainId].blue,
          maxUint256,
        ],
      })
      hash = await testClient.sendUnsignedTransaction({
        from: destination,
        to: USDE_ADDRESS_MAINNET,
        data: transferData,
      })
      receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log("Approved USDe spend for sUSDe collateral deposit: ", receipt)

      transferData = encodeFunctionData({
        abi: MorphoBlueAbi,
        functionName: "supplyCollateral",
        args: [
          {
            irm: market.metadata.irm,
            oracle: market.metadata.oracle,
            lltv: market.lltv,
            collateralToken: market.collateralToken.address,
            loanToken: market.loanToken.address,
          },
          parseEther("10000"),
          destination,
          "0x",
        ],
      })
      hash = await testClient.sendUnsignedTransaction({
        from: destination,
        to: morphoAddressesByChain[chainId as SupportedChainId].blue,
        data: transferData,
      })
      receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log("Deposited 10,000 USDe for collateral: ", receipt)

      // Borrow DAI
      transferData = encodeFunctionData({
        abi: MorphoBlueAbi,
        functionName: "borrow",
        args: [
          {
            irm: market.metadata.irm,
            oracle: market.metadata.oracle,
            lltv: market.lltv,
            collateralToken: market.collateralToken.address,
            loanToken: market.loanToken.address,
          },
          parseEther("9000"),
          0n,
          destination,
          destination,
        ],
      })
      hash = await testClient.sendUnsignedTransaction({
        from: destination,
        to: morphoAddressesByChain[chainId as SupportedChainId].blue,
        data: transferData,
      })
      receipt = await publicClient.waitForTransactionReceipt({ hash })
      console.log("Borrow 9,000 DAI from market: ", receipt)

      return

      // console.log(
      //   await publicClient.readContract({
      //     abi: ERC20MintableAbi,
      //     address: market.loanToken.address,
      //     functionName: "maxMintAmount",
      //   })
      // )

      // console.log(
      //   await publicClient.readContract({
      //     abi: ERC20MintableAbi,
      //     address: market.collateralToken.address,
      //     functionName: "maxMintAmount",
      //   })
      // )

      // const [maxLoanTokenMint, maxCollateralTokenMint] = await Promise.all([
      //   publicClient.readContract({
      //     abi: ERC20MintableAbi,
      //     address: market.loanToken.address,
      //     functionName: "maxMintAmount",
      //   }),
      //   publicClient.readContract({
      //     abi: ERC20MintableAbi,
      //     address: market.collateralToken.address,
      //     functionName: "maxMintAmount",
      //   }),
      // ])

      // console.log(maxLoanTokenMint, maxCollateralTokenMint)

      // await walletClient.writeContract({
      //   abi: MulticallAbi,
      //   address: "0xcA11bde05977b3631167028862bE2a173976CA11",
      //   functionName: "aggregate",
      //   args: [
      //     [
      //       {
      //         target: market.loanToken.address,
      //         callData: encodeFunctionData({
      //           abi: parseAbi([
      //             "function mint(address destination, uint256 mintAmount)",
      //           ]),
      //           functionName: "mint",
      //           args: [destination, maxMintAmountLoan],
      //         }),
      //       },
      //       {
      //         target: market.collateralToken.address,
      //         callData: encodeFunctionData({
      //           abi: parseAbi([
      //             "function mint(address destination, uint256 mintAmount)",
      //           ]),
      //           functionName: "mint",
      //           args: [destination, maxMintAmountLoan],
      //         }),
      //       },
      //     ],
      //   ],
      // })

      // let hash = await walletClient.writeContract({
      //   abi: parseAbi([
      //     "function mint(address destination, uint256 mintAmount)",
      //   ]),
      //   address: market.loanToken.address,
      //   functionName: "mint",
      //   args: [destination, maxMintAmountLoan],
      // })

      // await publicClient.waitForTransactionReceipt({
      //   hash,
      // })

      // hash = await walletClient.writeContract({
      //   abi: parseAbi([
      //     "function mint(address destination, uint256 mintAmount)",
      //   ]),
      //   address: market.collateralToken.address,
      //   functionName: "mint",
      //   args: [destination, maxMintAmountCollateral],
      // })

      // await publicClient.waitForTransactionReceipt({
      //   hash,
      // })

      // hash = await walletClient.writeContract({
      //   abi: erc20Abi,
      //   address: market.loanToken.address,
      //   functionName: "approve",
      //   args: [morphoBlueAddress, maxUint256],
      // })

      // await publicClient.waitForTransactionReceipt({
      //   hash,
      // })

      // hash = await walletClient.writeContract({
      //   abi: erc20Abi,
      //   address: market.collateralToken.address,
      //   functionName: "approve",
      //   args: [morphoBlueAddress, maxUint256],
      // })

      // await publicClient.waitForTransactionReceipt({
      //   hash,
      // })

      // hash = await walletClient.writeContract({
      //   abi: MorphoBlueAbi,
      //   address: morphoBlueAddress,
      //   functionName: "supplyCollateral",
      // args: [
      //   {
      //     irm: market.metadata.irm,
      //     oracle: market.metadata.oracle,
      //     lltv: market.lltv,
      //     collateralToken: market.collateralToken.address,
      //     loanToken: market.loanToken.address,
      //   },
      //   maxMintAmount,
      //   destination,
      //   "0x",
      // ],
      // })

      // await publicClient.waitForTransactionReceipt({
      //   hash,
      // })

      // hash = await walletClient.writeContract({
      //   abi: MorphoBlueAbi,
      //   address: morphoBlueAddress,
      //   functionName: "borrow",
      //   args: [
      //     {
      //       irm: market.metadata.irm,
      //       oracle: market.metadata.oracle,
      //       lltv: market.lltv,
      //       collateralToken: market.collateralToken.address,
      //       loanToken: market.loanToken.address,
      //     },
      //     fixed(maxMintAmount).mul(85, 2).bigint,
      //     0n,
      //     destination,
      //     destination,
      //   ],
      // })

      // await publicClient.waitForTransactionReceipt({
      //   hash,
      // })
    },
  })
}

const WETHAbi = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "guy", type: "address" },
      { name: "wad", type: "uint256" },
    ],
    name: "approve",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "src", type: "address" },
      { name: "dst", type: "address" },
      { name: "wad", type: "uint256" },
    ],
    name: "transferFrom",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [{ name: "wad", type: "uint256" }],
    name: "withdraw",
    outputs: [],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [{ name: "", type: "string" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      { name: "dst", type: "address" },
      { name: "wad", type: "uint256" },
    ],
    name: "transfer",
    outputs: [{ name: "", type: "bool" }],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: false,
    inputs: [],
    name: "deposit",
    outputs: [],
    payable: true,
    stateMutability: "payable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      { name: "", type: "address" },
      { name: "", type: "address" },
    ],
    name: "allowance",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  { payable: true, stateMutability: "payable", type: "fallback" },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "src", type: "address" },
      { indexed: true, name: "guy", type: "address" },
      { indexed: false, name: "wad", type: "uint256" },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "src", type: "address" },
      { indexed: true, name: "dst", type: "address" },
      { indexed: false, name: "wad", type: "uint256" },
    ],
    name: "Transfer",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "dst", type: "address" },
      { indexed: false, name: "wad", type: "uint256" },
    ],
    name: "Deposit",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      { indexed: true, name: "src", type: "address" },
      { indexed: false, name: "wad", type: "uint256" },
    ],
    name: "Withdrawal",
    type: "event",
  },
] as const
