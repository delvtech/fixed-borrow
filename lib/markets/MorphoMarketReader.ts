import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import * as dn from "dnum"
import { AdaptiveCurveIrmAbi } from "lib/morpho/abi/AdaptiveCurveIrmAbi"
import { MorphoBlueAbi } from "lib/morpho/abi/MorphoBlueAbi"
import { OracleAbi } from "lib/morpho/abi/OracleAbi"
import {
  ORACLE_PRICE_SCALE,
  SECONDS_PER_YEAR,
  mulDivDown,
  toAssetsUp,
  wDivDown,
  wMulDown,
  wTaylorCompounded,
} from "lib/morpho/utils"
import {
  Address,
  ContractFunctionParameters,
  PublicClient,
  formatUnits,
} from "viem"
import { SupportedChainId, morphoAddressesByChain } from "../../src/constants"
import { BorrowPosition, Market, MarketInfo } from "../../src/types"
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

interface MorphoMarketRateHistory {
  lowestRate: number
  highestRate: number
  averageRate: number
}

export class MorphoMarketReader extends MarketReader {
  private morphoBlueAddress: Address
  private irmAddress: Address

  constructor(client: PublicClient, chainId: SupportedChainId) {
    super(client, chainId)
    this.morphoBlueAddress = morphoAddressesByChain[chainId].blue
    this.irmAddress = morphoAddressesByChain[chainId].irm
  }

  async getBorrowPositions(account: Address): Promise<BorrowPosition[]> {
    const markets = getAppConfig(this.chainId).morphoMarkets

    const accountBorrowPositions = (
      await Promise.all(
        markets.map(async (market) => {
          // Fetch position shares
          const [, borrowShares, collateral] = await this.client.readContract({
            abi: MorphoBlueAbi,
            address: this.morphoBlueAddress,
            functionName: "position",
            args: [market.id, account],
          })

          // Early termination if the connect account does not have a borrow
          // position open.
          if (borrowShares <= 0) {
            return Promise.resolve(undefined)
          }

          // Fetch market state.
          const [
            totalSupplyAssets,
            totalSupplyShares,
            totalBorrowAssets,
            totalBorrowShares,
            lastUpdate,
            fee,
          ] = await this.client.readContract({
            abi: MorphoBlueAbi,
            address: this.morphoBlueAddress,
            functionName: "market",
            args: [market.id],
          })

          // const [loanToken, collateralToken, oracle, irm, lltv] =
          //   await this.client.readContract({
          //     abi: MorphoBlueAbi,
          //     address: this.morphoBlueAddress,
          //     functionName: "idToMarketParams",
          //     args: [market.id],
          //   })

          const borrowRate = await this.client.readContract({
            abi: AdaptiveCurveIrmAbi,
            address: this.irmAddress,
            functionName: "borrowRateView",
            args: [
              {
                loanToken: market.loanToken.address,
                collateralToken: market.collateralToken.address,
                oracle: market.collateralToken.address,
                irm: market.irm,
                lltv: market.lltv,
              },
              {
                totalSupplyShares,
                totalSupplyAssets,
                totalBorrowAssets,
                totalBorrowShares,
                lastUpdate,
                fee,
              },
            ],
          })

          const borrowAssetsUser = toAssetsUp(
            borrowShares,
            totalBorrowAssets,
            totalBorrowShares
          )

          const borrowAPY = wTaylorCompounded(
            borrowRate,
            BigInt(SECONDS_PER_YEAR)
          )

          const oraclePrice = await this.client.readContract({
            abi: OracleAbi,
            address: market.oracle,
            functionName: "price",
          })

          // todo fix ltv calcuation if user does not have position, maybe early return

          const ltv = wDivDown(
            borrowAssetsUser,
            mulDivDown(collateral, oraclePrice, ORACLE_PRICE_SCALE)
          )

          const collateralPrice = mulDivDown(
            collateral,
            oraclePrice,
            ORACLE_PRICE_SCALE
          )

          const liqPrice = wDivDown(
            borrowAssetsUser,
            wMulDown(market.lltv, collateralPrice)
          )

          const collateralTokenPriceUsd = await getTokenUsdPrice(
            this.chainId,
            market.collateralToken.address
          )

          const loanTokenPriceUsd = await getTokenUsdPrice(
            this.chainId,
            market.loanToken.address
          )
          const pastBlock = await super.getPastBlock(
            Date.now() / 1000 - 2592000
          )

          const rateHistory = pastBlock.number
            ? await this.getMarketRateHistory(
                market.id,
                BigInt(pastBlock.number)
              )
            : undefined

          const hyperdrive = new ReadHyperdrive({
            address: market.hyperdrive,
            publicClient: this.client,
          })

          const fixedRate = await hyperdrive.getFixedApr()

          return {
            market,
            totalCollateral: collateral.toString(),
            totalCollateralUsd: collateralTokenPriceUsd
              ? dn.format(
                  [
                    wMulDown(collateralTokenPriceUsd, collateral),
                    market.collateralToken.decimals,
                  ],
                  {
                    digits: 2,
                    trailingZeros: true,
                  }
                )
              : undefined,
            totalDebt: borrowAssetsUser.toString(),
            totalDebtUsd: loanTokenPriceUsd
              ? dn.format(
                  [
                    wMulDown(loanTokenPriceUsd, borrowAssetsUser),
                    market.loanToken.decimals,
                  ],
                  {
                    digits: 2,
                    trailingZeros: true,
                  }
                )
              : undefined,
            marketMaxLtv: BigInt(market.lltv).toString(),
            fixedRate,
            currentRate: Number(formatUnits(borrowAPY, 16)),
            rates: rateHistory
              ? {
                  lowestRate: rateHistory.lowestRate,
                  highestRate: rateHistory.highestRate,
                  averageRate: rateHistory.averageRate,
                }
              : undefined,
            ltv: Number(dn.format([ltv, 18], 2)),
            liquidationPrice: dn.format(
              [liqPrice, market.collateralToken.decimals],
              2
            ),
          }
        })
      )
    ).filter(Boolean) as BorrowPosition[]

    return accountBorrowPositions
  }

  async getAllMarketsInfo(): Promise<MarketInfo[]> {
    // Get whitelisted Morpho Blue markets from AppConfig
    const appConfig = getAppConfig(this.chainId)
    const markets = appConfig.morphoMarkets

    const morphoMarketStates = await this.getMarketStateBatch(
      markets.map((market) => market.id),
      this.morphoBlueAddress
    )

    const makeCall = (
      params: {
        loanToken: Address
        collateralToken: Address
        oracle: Address
        irm: Address
        lltv: bigint
      },
      state: MorphoMarketState
    ): ContractFunctionParameters<
      typeof AdaptiveCurveIrmAbi,
      "view",
      "borrowRateView"
    > => {
      return {
        abi: AdaptiveCurveIrmAbi,
        address: this.irmAddress,
        functionName: "borrowRateView",
        args: [params, state],
      }
    }

    const marketParams = markets.map((market) => ({
      loanToken: market.loanToken.address,
      collateralToken: market.collateralToken.address,
      oracle: market.oracle,
      irm: market.irm,
      lltv: market.lltv,
    }))

    const morphoMarketBorrowRates = (
      await this.client.multicall({
        contracts: morphoMarketStates.map((state, i) =>
          makeCall(marketParams[i], state)
        ),
        allowFailure: false,
      })
    ).map((rate) => wTaylorCompounded(rate, BigInt(SECONDS_PER_YEAR)))

    // ensure all data is same length

    return Promise.all(
      markets.map(async (market, i) => {
        const hyperdrive = new ReadHyperdrive({
          address: market.hyperdrive,
          publicClient: this.client,
        })
        const liquidity = await hyperdrive.getPresentValue()
        const fixedRate = await hyperdrive.getFixedApr()

        const borrowRate = morphoMarketBorrowRates[i]

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
    morphoBlueAddress: Address
  ): Promise<Array<MorphoMarketState>> {
    const makeCall = (
      id: Address
    ): ContractFunctionParameters<typeof MorphoBlueAbi, "view", "market"> => {
      return {
        abi: MorphoBlueAbi,
        address: morphoBlueAddress,
        functionName: "market",
        args: [id],
      }
    }

    const results = await this.client.multicall({
      contracts: morphoIds.map(makeCall),
      allowFailure: false,
    })

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
   * @description Utility function formats the borrow rate fetched from the
   * AdaptiveCurveIRM smart contract to a human readable rate.
   *
   * @param borrowRate - Borrow rate from the IRM as a BigNumber
   */
  getFormattedRateFromBorrowRate(borrowRate: bigint): number {
    return (
      Number(
        formatUnits(
          wTaylorCompounded(BigInt(borrowRate), BigInt(SECONDS_PER_YEAR)),
          18
        )
      ) * 100
    )
  }

  /**
   * @description Utility function to return market rate history such as
   * the lowest, highest, and average rates for a period. It's possible that
   * this function returns undefined. This scenerio is usually caused by
   * no rate data existing from the `fromBlock` to the current block.
   *
   * @param marketId - Morpho market id.
   * @param fromBlock - Defines the starting block logs will be fetched from.
   */
  async getMarketRateHistory(
    marketId: Address,
    fromBlock: bigint
  ): Promise<MorphoMarketRateHistory | undefined> {
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
      lowestRate: this.getFormattedRateFromBorrowRate(lowestRate),
      highestRate: this.getFormattedRateFromBorrowRate(highestRate),
      averageRate: this.getFormattedRateFromBorrowRate(averageRate),
    }
  }

  /**
   * @description Utility function to return market rate history such as
   * the lowest, highest, and average rates for a period. It's possible that
   * this function returns undefined. This scenerio is usually caused by
   * no rate data existing from the `fromBlock` to the current block.
   *
   * @param marketId - Morpho market id.
   * @param fromBlock - Defines the starting block logs will be fetched from.
   */
  async quoteRate(market: Market): Promise<bigint> {
    // get current rate at target

    // r_target * curve function

    const r_target = dn.from(0.1295, 18)
    const u = dn.from(0.7667, 18)

    const curve = (currentUtilization: number) => {
      // do in 18 point
      const u = dn.from(currentUtilization, 18)
      const u_target = dn.from(0.9, 18)
      const one = dn.from(1, 18)
      const zero = dn.from(0, 18)
      const k = dn.from(4, 18)
      const error_norm = dn.greaterThan(u, u_target)
        ? dn.sub(one, u_target)
        : u_target

      const error = dn.div(dn.sub(u, u_target), error_norm)

      const c_norm = dn.lessThan(error, zero)
        ? dn.sub(one, dn.div(one, k))
        : dn.sub(k, 1)

      const c = dn.add(dn.mul(c_norm, error), one)

      return c
    }

    const quote = dn.mul(r_target, curve(0.8547))
    console.log(quote)
    return quote[0]
  }
}
