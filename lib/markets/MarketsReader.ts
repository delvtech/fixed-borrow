import { Address, Block, PublicClient } from "viem"
import { SupportedChainId } from "../../src/constants"
import { BorrowPosition, MarketInfo } from "../../src/types"

export abstract class MarketReader {
  protected client: PublicClient
  protected chainId: SupportedChainId

  constructor(client: PublicClient, chainId: SupportedChainId) {
    this.client = client
    this.chainId = chainId
  }

  abstract getBorrowPositions(account: Address): Promise<BorrowPosition[]>

  abstract getAllMarketsInfo(): Promise<MarketInfo[]>

  protected async getPastBlock(timestamp: number): Promise<Block | undefined> {
    const blockExplorerUrl = this.client.chain?.blockExplorers?.default.apiUrl

    if (!blockExplorerUrl) return Promise.resolve(undefined)

    // Create a URL object
    let url = new URL(blockExplorerUrl)

    // Append the query parameters to the URL
    url.search = new URLSearchParams({
      module: "block",
      action: "getblocknobytime",
      timestamp: Math.floor(timestamp).toString(),
      closest: "before",
      apikey: import.meta.env.VITE_ETHERSCAN_API_KEY,
    }).toString()

    const res = await fetch(url, {})
    const resJson = await res.json()
    const blockNumber = resJson.result

    return this.client.getBlock({
      blockNumber: BigInt(blockNumber),
    })
  }
}
