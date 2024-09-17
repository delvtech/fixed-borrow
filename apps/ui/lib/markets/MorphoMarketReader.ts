import { fixed, parseFixed } from "@delvtech/fixed-point-wasm"
import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import {
  AccrualPosition,
  AdaptiveCurveIrmLib,
  MarketId,
  MarketUtils,
  Market as MorphoMarket,
} from "@morpho-org/blue-sdk"
import { AdaptiveCurveIrmAbi } from "artifacts/morpho/AdaptiveCurveIrmAbi"
import { MorphoBlueAbi } from "artifacts/morpho/MorphoBlueAbi"
import { OracleAbi } from "artifacts/morpho/OracleAbi"
import { Address, PublicClient } from "viem"
import { SupportedChainId, morphoAddressesByChain } from "../../src/constants"
import {
  BorrowPosition,
  Market,
  MarketInfo,
  RateHistory,
} from "../../src/types"
import { getAppConfig } from "../../src/utils/getAppConfig"
import { getTokenUsdPrice } from "../../src/utils/getTokenUsdPrice"
import { MarketReader } from "./MarketsReader"

interface MorphoMarketState {
  id: Address
  totalSupplyAssets: bigint
  totalSupplyShares: bigint
  totalBorrowAssets: bigint
  totalBorrowShares: bigint
  lastUpdate: bigint
  fee: bigint
}

export class MorphoMarketReader extends MarketReader {
  private morphoAddress: Address
  private irmAddress: Address

  constructor(client: PublicClient, chainId: SupportedChainId) {
    super(client, chainId)
    this.morphoAddress = morphoAddressesByChain[chainId].blue
    this.irmAddress = morphoAddressesByChain[chainId].irm
  }

  /**
   * Implements fetching borrow position data from the Morpho Protocol.
   * @param account The account with the loan..
   * @param market The market that originates the loan.
   * @returns {BorrowPosition}
   */
  async getBorrowPosition(
    account: Address,
    market: Market
  ): Promise<BorrowPosition | undefined> {
    console.log(market)
    const marketConfig = {
      id: market.metadata.id as MarketId,
      loanToken: market.loanToken.address,
      collateralToken: market.collateralToken.address,
      oracle: market.collateralToken.address,
      irm: market.metadata.irm,
      lltv: market.lltv,
      liquidationIncentiveFactor: 1n, // not used
    }

    // Fetch the position owned by the user.
    const [supplyShares, borrowShares, collateral] =
      await this.client.readContract({
        abi: MorphoBlueAbi,
        address: this.morphoAddress,
        functionName: "position",
        args: [market.metadata.id, account],
      })

    // Early termination if no borrow position exists.
    if (borrowShares <= 0) {
      return Promise.resolve(undefined)
    }

    // Fetch the market state.
    const [
      totalSupplyAssets,
      totalSupplyShares,
      totalBorrowAssets,
      totalBorrowShares,
      lastUpdate,
      fee,
    ] = await this.client.readContract({
      abi: MorphoBlueAbi,
      address: this.morphoAddress,
      functionName: "market",
      args: [market.metadata.id],
    })

    // Batch RPC call the oracle price and rateAtTarget from the IRM.
    const [price, rateAtTarget] = await Promise.all([
      this.client.readContract({
        abi: OracleAbi,
        address: market.metadata.oracle,
        functionName: "price",
      }),
      this.client.readContract({
        abi: AdaptiveCurveIrmAbi,
        address: this.irmAddress,
        functionName: "rateAtTarget",
        args: [marketConfig.id],
      }),
    ])

    const morphoMarket = new MorphoMarket({
      config: marketConfig,
      totalSupplyAssets,
      totalSupplyShares,
      totalBorrowAssets,
      totalBorrowShares,
      lastUpdate,
      fee,
      price,
      rateAtTarget,
    })

    const position = new AccrualPosition(
      {
        user: account,
        supplyShares,
        borrowShares,
        collateral,
      },
      morphoMarket
    )

    // Fetch an off-chain estimated token price of one base asset.
    const loanTokenPriceUsd = await getTokenUsdPrice(
      this.chainId,
      market.loanToken.address
    )

    // Fetch the rate history and range going back an estimated 30 days.
    const pastBlock = await super.getPastBlock(Date.now() / 1000 - 2592000)
    const rateHistory = pastBlock.number
      ? await this.getMarketRateHistory(
          market.metadata.id,
          BigInt(pastBlock.number)
        )
      : undefined

    // Fetch the current spot FRB rate.
    const fixedRate = await this.quoteRate(market)

    const totalDebt = position.borrowAssets
    const totalDebtUsd = fixed(position.borrowAssets)
      .mul(loanTokenPriceUsd ?? 0n)
      .formatCurrency()
    const currentRate = morphoMarket.borrowApy
    const rates = rateHistory
      ? {
          lowestRate: rateHistory.lowestRate,
          highestRate: rateHistory.highestRate,
          averageRate: rateHistory.averageRate,
        }
      : undefined

    return {
      market,
      totalDebt,
      totalDebtUsd,
      fixedRate,
      currentRate,
      rates,
    }
  }

  /**
   * Fetches borrow positions from an account for all Hyperdrive supported
   * Morpho markets.
   * @param account The account with the loan..
   * @returns {BorrowPosition}
   */
  async getBorrowPositions(account: Address): Promise<BorrowPosition[]> {
    // Get all supported Morpho markets from the config.
    const markets = getAppConfig(this.chainId).morphoMarkets

    // Batch fetch using our atomic getBorrowPosition function and filter
    // out markets without a user position.
    const accountBorrowPositions = (
      await Promise.all(
        markets.map(async (market) => this.getBorrowPosition(account, market))
      )
    ).filter(Boolean) as BorrowPosition[]

    return accountBorrowPositions
  }

  /**
   * @notice This function can be more optimized.
   * @returns {Promise<MarketInfo[]>}
   */
  async getAllMarketsInfo(): Promise<MarketInfo[]> {
    // Get all supported Morpho markets from the config.
    const appConfig = getAppConfig(this.chainId)
    const markets = appConfig.morphoMarkets

    const morphoMarketStates = await this.getMarketStateBatch(
      markets.map((market) => market.metadata.id),
      this.morphoAddress
    )

    const marketParams = markets.map((market) => ({
      id: market.metadata.id as MarketId,
      loanToken: market.loanToken.address,
      collateralToken: market.collateralToken.address,
      oracle: market.metadata.oracle,
      irm: market.metadata.irm,
      lltv: market.lltv,
      liquidationIncentiveFactor: 0n, // not used
    }))

    // Ensure that our two data-structures have the same length.
    if (morphoMarketStates.length !== marketParams.length)
      throw new Error("getAllMarketsInfo fetching failed: Invalid sizes.")

    const morphoMarkets = await Promise.all(
      markets.map(async (market) => {
        const marketConfig = {
          id: market.metadata.id as MarketId,
          loanToken: market.loanToken.address,
          collateralToken: market.collateralToken.address,
          oracle: market.collateralToken.address,
          irm: market.metadata.irm,
          lltv: market.lltv,
          liquidationIncentiveFactor: 1n,
        }

        const [
          totalSupplyAssets,
          totalSupplyShares,
          totalBorrowAssets,
          totalBorrowShares,
          lastUpdate,
          fee,
        ] = await this.client.readContract({
          abi: MorphoBlueAbi,
          address: this.morphoAddress,
          functionName: "market",
          args: [market.metadata.id],
        })

        const [price, rateAtTarget] = await Promise.all([
          this.client.readContract({
            abi: OracleAbi,
            address: market.metadata.oracle,
            functionName: "price",
          }),
          await this.client.readContract({
            abi: AdaptiveCurveIrmAbi,
            address: this.irmAddress,
            functionName: "rateAtTarget",
            args: [marketConfig.id],
          }),
        ])

        return new MorphoMarket({
          config: marketConfig,
          totalSupplyAssets,
          totalSupplyShares,
          totalBorrowAssets,
          totalBorrowShares,
          lastUpdate,
          fee,
          price,
          rateAtTarget,
        })
      })
    )
    const apys = morphoMarkets.map((m) => m.borrowApy)

    return Promise.all(
      markets.map(async (market, i) => {
        const hyperdrive = new ReadHyperdrive({
          address: market.hyperdrive,
          publicClient: this.client,
        })
        const liquidity = await hyperdrive.getPresentValue()
        const fixedRate = await hyperdrive.getFixedApr()

        const borrowRate = apys[i]

        return {
          market: {
            ...market,
            loanToken: {
              ...market.loanToken,
              address: market.loanToken.address,
            },
            collateralToken: {
              ...market.collateralToken,
              address: market.loanToken.address,
            },
            hyperdrive: market.hyperdrive,
          },
          liquidity,
          fixedRate,
          borrowRate,
        }
      })
    )
  }

  /**
   * @description Utility function formats the borrow rate fetched from the
   * AdaptiveCurveIRM smart contract to a human readable rate.
   *
   * @param borrowRate - Borrow rate from the IRM as a BigNumber
   */
  async getMarketStateBatch(
    morphoIds: Address[],
    morphoAddress: Address
  ): Promise<Array<MorphoMarketState>> {
    const results = await Promise.all(
      morphoIds.map((id) =>
        this.client.readContract({
          abi: MorphoBlueAbi,
          address: morphoAddress,
          functionName: "market",
          args: [id],
        })
      )
    )

    return results.map((result, i) => {
      const [
        totalSupplyAssets,
        totalSupplyShares,
        totalBorrowAssets,
        totalBorrowShares,
        lastUpdate,
        fee,
      ] = result as [bigint, bigint, bigint, bigint, bigint, bigint]

      return {
        id: morphoIds[i],
        totalBorrowAssets,
        totalBorrowShares,
        totalSupplyAssets,
        totalSupplyShares,
        lastUpdate,
        fee,
      }
    })
  }

  /**
   * @description Utility function to return market rate history such as
   * the lowest, highest, and average rates for a period. It's possible that
   * this function returns undefined. This scenario is usually caused by
   * no rate data existing from the `fromBlock` to the current block.
   *
   * @param marketId - Morpho market id.
   * @param fromBlock - Defines the starting block logs will be fetched from.
   */
  async getMarketRateHistory(
    marketId: Address,
    fromBlock: bigint
  ): Promise<RateHistory | undefined> {
    // Fetch contract logs from RPC.
    const rateData = await this.client.getContractEvents({
      abi: AdaptiveCurveIrmAbi,
      address: this.irmAddress,
      eventName: "BorrowRateUpdate",
      args: {
        id: marketId,
      },
      fromBlock,
    })

    // We early return if no logs have been found. This is possible if no
    // rate activity happened between fromBlock and the current block.
    if (!rateData.length) {
      return undefined
    }

    // The actual rate is stored as the avgBorrowRate in the log.
    const rates = rateData
      .map((i) => {
        const avgBorrowRate = i.args.avgBorrowRate

        if (!avgBorrowRate) return undefined

        return BigInt(avgBorrowRate)
      })
      .filter(Boolean) as bigint[]

    // Compute lowest, highest, and average rates.
    let lowestRate = rates[0]
    let highestRate = rates[0]

    rates.forEach((rate) => {
      if (rate > highestRate) {
        highestRate = rate
      }

      if (rate < lowestRate) {
        lowestRate = rate
      }
    })

    const averageRate =
      rates.reduce((prev, curr) => {
        return prev + curr
      }, 0n) / BigInt(rates.length)

    return {
      lowestRate: MarketUtils.getApy(lowestRate),
      highestRate: MarketUtils.getApy(highestRate),
      averageRate: MarketUtils.getApy(averageRate),
    }
  }

  /**
   * @description Function that returns the worse-case fixed rate quote.
   * We compute the current borrow rate from the underlying Morpho market and
   * add the open short cost to create the rate quote.
   *
   * AdaptiveCurveIRM Math Reference: {@link https://docs.morpho.org/morpho-blue/contracts/irm/}
   *
   * @param market - Morpho market.
   * @param spotRate - An optional override from the current Hyperdrive fixed spot rate.
   * @returns The worse-case rate quote.
   */
  async quoteRate(market: Market, spotRate?: bigint): Promise<bigint> {
    // Ensure all required variables are present.
    if (!market.metadata) throw new Error("No IRM")

    const hyperdrive = new ReadHyperdrive({
      address: market.hyperdrive,
      publicClient: this.client,
    })

    // Fetch hyperdrive spot rate.
    const fixedRate = spotRate ?? (await hyperdrive.getFixedApr())

    // Fetch the rateAtTarget for the target Morpho market.
    const rateAtTarget = await this.client.readContract({
      abi: AdaptiveCurveIrmAbi,
      address: market.metadata?.irm,
      functionName: "rateAtTarget",
      args: [market.metadata.id],
    })

    // One represented with 18 decimals.
    const ONE = parseFixed(1)

    /**
     * 0.35 is the worst-case utilization rate
     * Reference: {@link https://hackmd.io/1hfGguwoTMiT4L2kCSAnAQ}
     */
    const borrowRate = AdaptiveCurveIrmLib.getBorrowRate(
      parseFixed(0.35).bigint,
      rateAtTarget,
      0
    )
    const supplyRate = MarketUtils.getSupplyRate(borrowRate.avgBorrowRate, {
      utilization: parseFixed(0.35).bigint,
      fee: 0n,
    })
    const borrowApy = MarketUtils.getApy(borrowRate.avgBorrowRate)
    const supplyApy = MarketUtils.getApy(supplyRate)
    const gapApy = borrowApy - supplyApy

    // 1 - (1 / (1 + fixedRate))
    const shortRate = ONE.sub(ONE.div(ONE.add(fixedRate)))

    // Add the gap and shortRate together for the rate quote.
    const quoteRate = shortRate.add(gapApy)
    return quoteRate.bigint
  }
}
