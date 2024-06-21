import * as fs from "fs"
import { Address, createPublicClient, http } from "viem"
import { mainnet, sepolia } from "viem/chains"
import { MorphoBlueAbi } from "../../lib/morpho/abi/MorphoBlueAbi.js"
import {
  SupportedChainId,
  morphoAddressesByChain,
  supportedChainIds,
  tokenIconBySymbol,
  whitelistedMetaMorphoMarketsByChain,
} from "../constants.js"
import { Token } from "../types.js"

const mainnetPublicClient = createPublicClient({
  chain: mainnet,
  transport: http(),
})

const sepoliaPublicClient = createPublicClient({
  chain: sepolia,
  transport: http(),
})

function getClient(chainId: number) {
  if (chainId === 1) {
    return mainnetPublicClient
  }
  return sepoliaPublicClient
}

// interface MorphoMarket {
//   //   loanToken: Token
//   //   collateralToken: Token
//   oracle: Address
//   irm: Address
//   lltv: bigint
// }

// interface AppConfig {
//   //   tokens: Token[]
//   morphoMarkets: MorphoMarket[]
// }

// const appConfigsByChain: Record<number, AppConfig> = {}

supportedChainIds.forEach(async (chainId) => {
  const client = getClient(chainId)
  const morphoMarketIds =
    whitelistedMetaMorphoMarketsByChain[chainId as SupportedChainId]
  const morphoBlueAddress =
    morphoAddressesByChain[chainId as SupportedChainId].blue

  const tokens: Array<Token> = []

  // loanToken address, collateralToken address, oracle address, irm address, lltv uint256
  const morphoMarkets = await Promise.all(
    morphoMarketIds.map(async (market) => {
      const [loanTokenAddress, collateralTokenAddress, oracle, irm, lltv] =
        await client.readContract({
          abi: MorphoBlueAbi,
          address: morphoBlueAddress,
          functionName: "idToMarketParams",
          args: [market.morphoId as Address],
        })

      const loanTokenSymbol = await client.readContract({
        abi: ERC20Abi,
        address: loanTokenAddress,
        functionName: "symbol",
      })
      const loanTokenName = await client.readContract({
        abi: ERC20Abi,
        address: loanTokenAddress,
        functionName: "name",
      })
      const loanTokenDecimals = await client.readContract({
        abi: ERC20Abi,
        address: loanTokenAddress,
        functionName: "decimals",
      })

      const collateralTokenSymbol = await client.readContract({
        abi: ERC20Abi,
        address: collateralTokenAddress,
        functionName: "symbol",
      })
      const collateralTokenName = await client.readContract({
        abi: ERC20Abi,
        address: collateralTokenAddress,
        functionName: "name",
      })
      const collateralTokenDecimals = await client.readContract({
        abi: ERC20Abi,
        address: collateralTokenAddress,
        functionName: "decimals",
      })

      //   const loanTokenData = await readContracts(rainbowConfig, {
      //     address: loanToken,
      //     // @ts-ignore
      //     chainId,
      //   })
      //   const collateralTokenData = await getToken(rainbowConfig, {
      //     address: collateralToken,
      //     // @ts-ignore
      //     chainId,
      //   })

      const loanToken = {
        address: loanTokenAddress,
        symbol: loanTokenSymbol,
        name: loanTokenName,
        decimals: loanTokenDecimals,
        iconUrl: tokenIconBySymbol[loanTokenSymbol],
      }

      const collateralToken = {
        address: collateralTokenAddress,
        symbol: collateralTokenSymbol,
        name: collateralTokenName,
        decimals: collateralTokenDecimals,
        iconUrl: tokenIconBySymbol[collateralTokenSymbol],
      }

      !tokens.some((token) => token.address === loanTokenAddress) &&
        tokens.push(loanToken)
      !tokens.some((token) => token.address === collateralTokenAddress) &&
        tokens.push(collateralToken)

      return {
        id: market.morphoId,
        hyperdrive: market.hyperdrive,
        loanToken,
        collateralToken,
        oracle,
        irm,
        lltv: lltv.toString(),
      }
    })
  )

  fs.writeFileSync(
    `src/static/${chainId}-config.json`,
    JSON.stringify({
      tokens,
      morphoMarkets,
    })
  )
})

const ERC20Abi = [
  {
    constant: true,
    inputs: [],
    name: "name",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_spender",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "approve",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_from",
        type: "address",
      },
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transferFrom",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [
      {
        name: "",
        type: "uint8",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        name: "balance",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "symbol",
    outputs: [
      {
        name: "",
        type: "string",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    constant: false,
    inputs: [
      {
        name: "_to",
        type: "address",
      },
      {
        name: "_value",
        type: "uint256",
      },
    ],
    name: "transfer",
    outputs: [
      {
        name: "",
        type: "bool",
      },
    ],
    payable: false,
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    constant: true,
    inputs: [
      {
        name: "_owner",
        type: "address",
      },
      {
        name: "_spender",
        type: "address",
      },
    ],
    name: "allowance",
    outputs: [
      {
        name: "",
        type: "uint256",
      },
    ],
    payable: false,
    stateMutability: "view",
    type: "function",
  },
  {
    payable: true,
    stateMutability: "payable",
    type: "fallback",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "owner",
        type: "address",
      },
      {
        indexed: true,
        name: "spender",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Approval",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        name: "from",
        type: "address",
      },
      {
        indexed: true,
        name: "to",
        type: "address",
      },
      {
        indexed: false,
        name: "value",
        type: "uint256",
      },
    ],
    name: "Transfer",
    type: "event",
  },
] as const
