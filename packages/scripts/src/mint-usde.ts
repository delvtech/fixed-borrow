import {
  Address,
  Chain,
  createPublicClient,
  createTestClient,
  encodeFunctionData,
  erc20Abi,
  http,
  parseEther,
} from "viem"

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

async function mintUsde(destination: Address) {
  const chainId = publicClient.chain?.id

  if (!publicClient.chain) return

  await testClient.setBalance({
    address: destination,
    value: parseEther("100"),
  })

  console.log("Minted ETH to account")

  const DAI_ADDRESS_MAINNET =
    "0x6b175474e89094c44da98b954eedeac495271d0f" as Address

  const DAI_WHALE_MAINNET =
    "0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf" as Address

  // DAI
  let transferData = encodeFunctionData({
    abi: erc20Abi,
    functionName: "transfer",
    args: [destination as Address, parseEther("1000000")],
  })

  let hash = await testClient.sendUnsignedTransaction({
    from: DAI_WHALE_MAINNET,
    to: DAI_ADDRESS_MAINNET,
    data: transferData,
  })

  let receipt = await publicClient.waitForTransactionReceipt({ hash })

  console.log("Transferred 1,000,000 DAI from whale: ", receipt)
}

await mintUsde("0x042CAb2Ea353fC48C9491bDbF10a12Cfe9072B6C")
