import { WETHAbi } from "artifacts/base/WETH"
import { MorphoBlueAbi } from "artifacts/morpho/MorphoBlueAbi"
import {
  Address,
  Chain,
  createPublicClient,
  createTestClient,
  encodeFunctionData,
  erc20Abi,
  erc4626Abi,
  http,
  maxUint256,
  parseEther,
} from "viem"
import { morphoAddressesByChain, SupportedChainId } from "./constants"

/** The core interface for a market that contains critical information. */
export interface Market {
  /** Loan token information. */
  loanToken: Token

  /** Collateral token information. */
  collateralToken: Token

  /** The max loan to value ratio for the market,
   * priced in 18 point decimals.
   */
  lltv: bigint

  /** Hyperdrive contract address */
  hyperdrive: Address

  /** Hyperdrive term duration */
  duration: bigint

  /** Special metadata related to the market, this can differ
   * in structure depending on the market type.
   */
  metadata: MorphoMarketMetadata
}

export interface MorphoMarketMetadata {
  id: Address
  oracle: Address
  irm: Address
}

export interface Token {
  symbol: string
  name: string
  decimals: number
  address: Address
  iconUrl?: string
}

export const delvChain = {
  id: 42069,
  name: "☁️Chain",
  nativeCurrency: { name: "Ether", symbol: "ETH", decimals: 18 },
  rpcUrls: {
    default: { http: ["https://fork.hyperdrive.money:8545"] },
  },
  blockExplorers: {
    default: { name: "Etherscan", url: "https://etherscan.io" },
  },
  contracts: {
    ensRegistry: {
      address: "0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e",
    },
    ensUniversalResolver: {
      address: "0xE4Acdd618deED4e6d2f03b9bf62dc6118FC9A4da",
      blockCreated: 16773775,
    },
    multicall3: {
      address: "0xca11bde05977b3631167028862be2a173976ca11",
      blockCreated: 14353601,
    },
  },
} as const satisfies Chain

export const testClient = createTestClient({
  chain: delvChain,
  mode: "anvil",
  transport: http("https://fork.hyperdrive.money:8545"),
})

const publicClient = createPublicClient({
  chain: delvChain,
  transport: http("https://fork.hyperdrive.money:8545", {
    batch: true,
  }),
})

async function makeBorrowPosition(destination: Address) {
  const chainId = publicClient.chain?.id

  if (!publicClient.chain) return

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
        irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
        oracle: "0xaE4750d0813B5E37A51f7629beedd72AF1f9cA35",
        lltv: 915000000000000000n,
        collateralToken: USDE_ADDRESS_MAINNET,
        loanToken: DAI_ADDRESS_MAINNET,
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
        irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
        oracle: "0xaE4750d0813B5E37A51f7629beedd72AF1f9cA35",
        lltv: 915000000000000000n,
        collateralToken: USDE_ADDRESS_MAINNET,
        loanToken: DAI_ADDRESS_MAINNET,
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
}

const addresses: Address[] = ["0x07833B7B4ab7d80Be6ED1fA45183BD434BEf8ff4"]

for (const address of addresses) {
  try {
    await makeBorrowPosition(address)
  } catch (e) {
    console.error(`Make Borrow position failed on address: ${address}`)
    console.error(e)
  }
}
