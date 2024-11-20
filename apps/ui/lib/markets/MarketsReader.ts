import { SupportedChainId } from "dfb-config"
import { Address, Block, PublicClient } from "viem"
import { mainnet } from "viem/chains"
import { BorrowPosition, Market, MarketInfo } from "../../src/types"

/**
 * @description Abstract class that should be implemented for each Hyperdrive
 * supported lending protocol. Provides utility functions that can assist
 * the inherited classes.
 *
 * @param account - Address of the borrower or connected account.
 */
export abstract class MarketReader {
  protected client: PublicClient
  protected chainId: SupportedChainId

  constructor(client: PublicClient, chainId: SupportedChainId) {
    this.client = client
    this.chainId = chainId
  }

  /**
   * @description Abstract that function that when implemented, returns
   * all current borrow positions from a Hyperdrive supported lending protocol.
   *
   * @param account - Address of the borrower or connected account.
   */
  abstract getBorrowPositions(account: Address): Promise<BorrowPosition[]>

  /**
   * @description Abstract that function that when implemented, returns
   * Hyperdrive supported markets and related useful market state information.
   */
  abstract getAllMarketsInfo(): Promise<MarketInfo[]>

  /**
   * @description Abstract that function that when implemented, computes the
   * current fixed rate quote for a specific market. The fixed rate quote is
   * the worst-case fixed rate.
   *
   * @param market - The market to quote a fixed rate.
   */
  abstract quoteRate(market: Market): Promise<bigint>

  /**
   * @description Utility function that returns the closest block from the
   * provided timestamp. Uses a block explorer API.
   *
   * @param timestamp - Unix timestamp in seconds.
   */
  protected async getPastBlock(timestamp: number): Promise<Block> {
    // Default to mainnet, assuming this is null when we are on fork.
    const blockExplorerUrl =
      this.client.chain?.blockExplorers?.default.apiUrl ??
      mainnet.blockExplorers.default.apiUrl

    // Throw error is the chain does not have a registered block explorer API.
    if (!blockExplorerUrl)
      throw new Error("Chain does not have block explorer api.")

    // Create URL request object.
    const url = new URL(blockExplorerUrl)

    // Add query parameters to the request.
    url.search = new URLSearchParams({
      module: "block",
      action: "getblocknobytime",
      timestamp: Math.floor(timestamp).toString(),
      closest: "before",
      apikey: import.meta.env.VITE_ETHERSCAN_API_KEY,
    }).toString()

    // Fetch previous block number from block explorer API.
    const res = await fetch(url)
    const resJson = await res.json()
    const blockNumber = resJson.result

    // Fetch block data using viem.
    return this.client.getBlock({
      blockNumber: BigInt(blockNumber),
    })
  }
}
