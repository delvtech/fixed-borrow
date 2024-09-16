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

const addresses: Address[] = [
  "0x004dfC2dBA6573fa4dFb1E86e3723e1070C0CfdE",
  "0x005182C62DA59Ff202D53d6E42Cef6585eBF9617",
  "0x005BB73FddB8CE049eE366b50d2f48763E9Dc0De",
  "0x0065291E64E40FF740aE833BE2F68F536A742b70",
  "0x0076b154e60BF0E9088FcebAAbd4A778deC5ce2c",
  "0x00860d89A40a5B4835a3d498fC1052De04996de6",
  "0x00905A77Dc202e618d15d1a04Bc340820F99d7C4",
  "0x009ef846DcbaA903464635B0dF2574CBEE66caDd",
  "0x00D5E029aFCE62738fa01EdCA21c9A4bAeabd434",
  "0x01152152f9c6C92DDc19549636d6A9EdD00b568F",
  "0x011744D5CE050f34592A21066E5987Bf7a72bbE2",
  "0x011988e69F262f87E5BB39BE7038bc112B87f2Ee",
  "0x01261cfA4988d378E08202C28e9497a474A03712",
  "0x012AAa08685270b05c0679bB656FAA80ecD91034",
  "0x012C6F5517aE84E20504E895f52660bA8f4A217C",
  "0x013D45daA32366810F7D51091E7f4458f1De8bC1",
  "0x013b3D77e64b42195C616CCB5D8e130ABE74515E",
  "0x015871DA2edCdeDACA62f001F99a0254F74A85d6",
  "0x0166AE70eADAFc73fa0eE145C29344d08aB23a0b",
  "0x016bc10958443685DD8dF7DEac11E489002e7CD1",
  "0x0176c18939eed6F121d57B518DC6E9185b8dadC2",
  "0x017c3BADb000EEDBC44F019392eBBDbBa2716906",
  "0x01835BfF4Bd19Cb32c227D372B0CB3190750d06d",
  "0x018CC2f751EC7F3FebB7BB5008aE15d7D1b27B86",
  "0x0196c117018C0E33a5073d25623821701450647B",
  "0x0197E1C6E1796B83A88c7900ce06E27B75B49835",
  "0x019dA82db28D078c76B894d086f5e92269786637",
  "0x01Aa031C140ebd77608ff25877b34211584D8641",
  "0x01B35aE0acb3081A6a9A80cCD0504e2bbF80fcE8",
  "0x01B38cD14d7c3CB927f35c18f03175527C2D7e73",
  "0x01C7e99d7Fb37456E4F7814b77c80A611d6961F6",
  "0x01CEE67e325122938F2424B86c0315b3CA1b093F",
  "0x01D02DeE197a58E8f6BA4867e023a9e045c8c42e",
  "0x01Dc86267dcEDD72ABcBc08F3d0954E073F53323",
  "0x01EC0de77Ba1080bcD85007A8f53aE210B34E16b",
  "0x01F1d8Cf081845292484B0B18DD6a9E9eA72de06",
  "0x01F5901Af04B1401CD1d35Afb920B1Cf2eef5b84",
  "0x01a277D78d540429828F00eD1d746672e83a127D",
  "0x01aAdcbbB891A362d822643C9408D3B847110569",
  "0x01aa0Fbf4C7EF185dEB6a66d1d878dB915dD51fE",
  "0x01bDD99a68566D9627Af1220Ab59C9d9A6187364",
  "0x01c5447f6930a49805117a70D71F4Ac8379D8aB8",
  "0x01f6C2C3F635D907F01DAd8436fbc255f8d7419f",
  "0x01fAdE1bC4b90bcc8bFE76777711AfD1922b7e9f",
  "0x020A6F562884395A7dA2be0b607Bf824546699e2",
  "0x020a898437E9c9DCdF3c2ffdDB94E759C0DAdFB6",
  "0x02147558D39cE51e19de3A2E1e5b7c8ff2778829",
  "0x021f1Bbd2Ec870FB150bBCAdaaA1F85DFd72407C",
  "0x0235037B42b4c0575c2575D50D700dD558098b78",
  "0x03408bed71777fC8623055941C2E4Dda597D2776",
  "0x042CAb2Ea353fC48C9491bDbF10a12Cfe9072B6C",
  "0x04C9C818D898F82d0e9aB92685Ee70AB7196Fed0",
  "0x04915b321714e07bd0bd4e95070f2343155B5f93",
]

for (const address of addresses) {
  try {
    await makeBorrowPosition(address)
  } catch (e) {
    console.error(`Make Borrow position failed on address: ${address}`)
    console.error(e)
  }
}
