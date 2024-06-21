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
import { BorrowPosition, MarketInfo } from "../../src/types"
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
  protected morphoBlueAddress: Address
  protected irmAddress: Address

  constructor(client: PublicClient, chainId: SupportedChainId) {
    super(client, chainId)
    this.morphoBlueAddress = morphoAddressesByChain[chainId].blue
    this.irmAddress = morphoAddressesByChain[chainId].irm
  }

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

  async getMarketRateHistory(marketId: Address, fromBlock?: bigint) {
    // fetch from RPC

    const rateData = await this.client.getContractEvents({
      abi: AdaptiveCurveIrmAbi,
      address: morphoAddressesByChain[this.chainId].irm,
      eventName: "BorrowRateUpdate",
      args: {
        id: marketId,
      },
      fromBlock,
    })

    const rates = rateData
      .map((i) => {
        const avgBorrowRate = i.args.avgBorrowRate

        if (!avgBorrowRate) return undefined

        return BigInt(avgBorrowRate)
      })
      .filter(Boolean) as bigint[]

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

    return {
      lowestRate:
        Number(
          formatUnits(
            wTaylorCompounded(BigInt(lowestRate), BigInt(SECONDS_PER_YEAR)),
            18
          )
        ) * 100,
      highestRate:
        Number(
          formatUnits(
            wTaylorCompounded(BigInt(highestRate), BigInt(SECONDS_PER_YEAR)),
            18
          )
        ) * 100,
      averageRate:
        Number(
          formatUnits(
            wTaylorCompounded(
              rates.reduce((prev, curr) => {
                return prev + curr
              }, 0n) / BigInt(rates.length),
              BigInt(SECONDS_PER_YEAR)
            ),
            18
          )
        ) * 100,
    }
  }

  public async getBorrowPositions(account: Address): Promise<BorrowPosition[]> {
    const markets = getAppConfig(this.chainId).morphoMarkets

    const accountBorrowPositions = (
      await Promise.all(
        markets.map(async (market) => {
          // Fetch position shares
          const [, borrowShares, collateral] = await this.client.readContract({
            abi: MorphoBlueAbi,
            address: morphoAddressesByChain[this.chainId].blue,
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
            address: morphoAddressesByChain[this.chainId].blue,
            functionName: "market",
            args: [market.id],
          })

          // const [loanToken, collateralToken, oracle, irm, lltv] =
          //   await this.client.readContract({
          //     abi: MorphoBlueAbi,
          //     address: morphoAddressesByChain[this.chainId].blue,
          //     functionName: "idToMarketParams",
          //     args: [market.id],
          //   })

          const borrowRate = await this.client.readContract({
            abi: AdaptiveCurveIrmAbi,
            address: morphoAddressesByChain[this.chainId].irm,
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

          const { lowestRate, highestRate, averageRate } =
            await this.getMarketRateHistory(
              market.id,
              pastBlock?.number ? BigInt(pastBlock.number) : undefined
            )

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
            fixedRate: Number(formatUnits(fixedRate, 18)),
            currentRate: Number(formatUnits(borrowAPY, 16)),
            rates: {
              lowestRate,
              highestRate,
              averageRate,
            },
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
      morphoAddressesByChain[this.chainId].blue
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
}
