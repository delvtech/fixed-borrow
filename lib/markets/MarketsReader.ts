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
import { sepolia } from "viem/chains"
import {
  SupportedChainId,
  morphoAddressesByChain,
  whitelistedMetaMorphoMarketsByChain,
} from "../../src/constants"
import { BorrowPosition, Market } from "../../src/types"
import { getAppConfig } from "../../src/utils/getAppConfig"
import { getTokenUsdPrice } from "../../src/utils/getTokenUsdPrice"

interface MarketInfo {
  market: Market
  liquidity: bigint
  fixedRate: bigint
  borrowRate: bigint
}

interface MorphoMarketState {
  id: Address
  totalSupplyAssets: bigint
  totalSupplyShares: bigint
  totalBorrowAssets: bigint
  totalBorrowShares: bigint
  lastUpdate: bigint
  fee: bigint
}

abstract class MarketReader {
  protected client: PublicClient
  protected chainId: SupportedChainId

  constructor(client: PublicClient, chainId: SupportedChainId) {
    this.client = client
    this.chainId = chainId
  }

  abstract getBorrowPositions(account: Address): Promise<BorrowPosition[]>

  abstract getAllMarketsInfo(): Promise<MarketInfo[]>
}

export class MorphoMarketReader extends MarketReader {
  constructor(client: PublicClient, chainId: SupportedChainId) {
    super(client, chainId)
  }

  async getMarketStateBatch(
    morphoIds: Address[],
    morphoBlueAddress: Address
  ): Promise<Array<MorphoMarketState>> {
    // const morphoBlueContract = {
    //   address: morphoBlueAddress,
    //   abi: MorphoBlueAbi,
    // } as const

    // const wagmiContract = {
    //   address: "0xFBA3912Ca04dd458c843e2EE08967fC04f3579c2",
    //   abi: MorphoBlueAbi,
    // } as const

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

  public async getBorrowPositions(account: Address) {
    const accountBorrowPositions: BorrowPosition[] = await Promise.all(
      whitelistedMetaMorphoMarketsByChain[sepolia.id].map(async (market) => {
        // fetch position shares
        const [, borrowShares, collateral] = await this.client.readContract({
          abi: MorphoBlueAbi,
          address: morphoAddressesByChain[sepolia.id].blue,
          functionName: "position",
          args: [market.morphoId as Address, account],
        })

        const [
          totalSupplyAssets,
          totalSupplyShares,
          totalBorrowAssets,
          totalBorrowShares,
          lastUpdate,
          fee,
        ] = await this.client.readContract({
          abi: MorphoBlueAbi,
          address: morphoAddressesByChain[sepolia.id].blue,
          functionName: "market",
          args: [market.morphoId as Address],
        })

        const morphoMarketParams = getAppConfig(
          this.chainId
        ).morphoMarkets.find((market) => market.id)

        if (!morphoMarketParams) {
          throw new Error()
        }

        const [loanToken, collateralToken, oracle, irm, lltv] =
          await this.client.readContract({
            abi: MorphoBlueAbi,
            address: morphoAddressesByChain[sepolia.id].blue,
            functionName: "idToMarketParams",
            args: [market.morphoId as Address],
          })

        const borrowRate = await this.client.readContract({
          abi: AdaptiveCurveIrmAbi,
          address: morphoAddressesByChain[sepolia.id].irm,
          functionName: "borrowRateView",
          args: [
            {
              loanToken,
              collateralToken,
              oracle,
              irm,
              lltv,
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
          address: oracle,
          functionName: "price",
        })

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
          wMulDown(lltv, collateralPrice)
        )

        const collateralTokenPriceUsd = await getTokenUsdPrice(
          this.chainId,
          morphoMarketParams.collateralToken.address as Address
        )

        const loanTokenPriceUsd = await getTokenUsdPrice(
          this.chainId,
          morphoMarketParams.loanToken.address as Address
        )

        collateralTokenPriceUsd && console.log()

        return {
          ...morphoMarketParams,
          totalCollateral: collateral.toString(),
          totalCollateralUsd: collateralTokenPriceUsd
            ? dn.format(
                [
                  wMulDown(collateralTokenPriceUsd, collateral),
                  morphoMarketParams.collateralToken.decimals,
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
                  morphoMarketParams.loanToken.decimals,
                ],
                {
                  digits: 2,
                  trailingZeros: true,
                }
              )
            : undefined,
          marketMaxLtv: lltv.toString(),
          currentBorrowApy: Number(formatUnits(borrowAPY, 18)),
          ltv: Number(dn.format([ltv, 18], 2)),
          liquidationPrice: dn.format(
            [liqPrice, morphoMarketParams.collateralToken.decimals],
            2
          ),
        } as BorrowPosition
      })
    )

    return accountBorrowPositions

    // const currentTimestamp = Math.round(Date.now() / 1000)
    // const res = await request(MORPHO_GQL_URL, UserPositionsDocument, {
    //   address: account,
    //   startTimestamp: currentTimestamp - 2592000,
    //   endTimestamp: currentTimestamp,
    // })

    // // Filter small positions out.
    // const filteredPositions = res.userByAddress.marketPositions.filter(
    //   (position) =>
    //     BigInt(position.borrowAssets) > 0n &&
    //     position.borrowAssetsUsd &&
    //     position.borrowAssetsUsd > 10
    // )

    // const borrowPositions = filteredPositions.map((position) => {
    //   const collateralAsset = position.market.collateralAsset
    //   const collateralUsd = position.collateralUsd
    //   const borrowAssetsUsd = position.borrowAssetsUsd
    //   const historicalState = position.market.historicalState?.borrowApy
    //   const marketState = position.market.state

    //   if (!collateralAsset) {
    //     throw new Error("")
    //   }

    //   if (collateralUsd === undefined || collateralUsd === null) {
    //     throw new Error("")
    //   }

    //   if (borrowAssetsUsd === undefined || borrowAssetsUsd === null) {
    //     throw new Error("")
    //   }

    //   if (historicalState === undefined || historicalState === null) {
    //     throw new Error("")
    //   }

    //   if (marketState === undefined || marketState === null) {
    //     throw new Error("")
    //   }

    //   return {
    //     loanToken: {
    //       symbol: position.market.loanAsset.symbol,
    //       name: position.market.loanAsset.name,
    //       decimals: position.market.loanAsset.decimals,
    //       address: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb" as Address, // todo
    //     },
    //     collateralToken: {
    //       symbol: collateralAsset.symbol,
    //       name: collateralAsset.name,
    //       decimals: collateralAsset.decimals,
    //       address: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb" as Address, // todo
    //     },
    //     totalCollateral: position.collateral,
    //     totalCollateralUsd: collateralUsd.toString(),
    //     totalDebt: position.borrowAssets,
    //     totalDebtUsd: borrowAssetsUsd.toString(),
    //     ltv: position.healthFactor ?? 0,
    //     marketMaxLtv: position.market.lltv,
    //     currentBorrowApy: marketState.borrowApy,
    //     averageBorrowApy: historicalState.length
    //       ? historicalState.reduce((prev, curr) => {
    //           return prev + (curr.y ?? 0)
    //         }, 0) / historicalState.length
    //       : 0,
    //   }
    // })

    // return borrowPositions
  }

  async getAllMarketsInfo() {
    // Get whitelisted Morpho Blue markets from AppConfig
    const appConfig = getAppConfig(this.chainId)
    const markets = appConfig.morphoMarkets

    const morphoMarketStates = await this.getMarketStateBatch(
      markets.map((market) => market.id as Address),
      morphoAddressesByChain[this.chainId].blue
    )

    return Promise.all(
      morphoMarketStates.map(async (state) => {
        const { id, ...marketState } = state

        const morphoMarketParams = appConfig.morphoMarkets.find(
          (market) => market.id === state.id
        )

        if (!morphoMarketParams) {
          throw new Error()
        }

        const hyperdrive = new ReadHyperdrive({
          address: morphoMarketParams.hyperdrive as Address, // hyperdrive contract address
          publicClient: this.client,
        })

        let borrowRate = await this.client.readContract({
          abi: AdaptiveCurveIrmAbi,
          address: morphoAddressesByChain[this.chainId].irm,
          functionName: "borrowRateView",
          args: [
            {
              loanToken: morphoMarketParams.loanToken.address as Address,
              collateralToken: morphoMarketParams.collateralToken
                .address as Address,
              oracle: morphoMarketParams.oracle as Address,
              irm: morphoMarketParams.irm as Address,
              lltv: BigInt(morphoMarketParams.lltv),
            },
            {
              ...marketState,
            },
          ],
        })

        borrowRate = wTaylorCompounded(borrowRate, BigInt(SECONDS_PER_YEAR))
        const liquidity = await hyperdrive.getPresentValue()
        const fixedRate = await hyperdrive.getFixedApr()

        return {
          market: {
            ...morphoMarketParams,
            loanToken: {
              ...morphoMarketParams.loanToken,
              address: morphoMarketParams.loanToken.address as Address,
            },
            collateralToken: {
              ...morphoMarketParams.collateralToken,
              address: morphoMarketParams.loanToken.address as Address,
            },
            hyperdrive: morphoMarketParams.hyperdrive as Address,
          },
          liquidity,
          fixedRate,
          borrowRate,
        }
      })
    )

    // return Promise.all(
    //   markets.map(async (market) => {
    //     const hyperdrive = new ReadHyperdrive({
    //       address: market.hyperdrive as Address, // hyperdrive contract address
    //       publicClient: this.client,
    //     })

    //     const [
    //       totalSupplyAssets,
    //       totalSupplyShares,
    //       totalBorrowAssets,
    //       totalBorrowShares,
    //       lastUpdate,
    //       fee,
    //     ] = await this.client.readContract({
    //       abi: MorphoBlueAbi,
    //       address: morphoAddressesByChain[sepolia.id].blue,
    //       functionName: "market",
    //       args: [market.id as Address],
    //     })

    //     const morphoMarketParams = appConfig.morphoMarkets.find(
    //       (market) => market.id
    //     )

    //     if (!morphoMarketParams) {
    //       throw new Error()
    //     }

    //     let borrowRate = await this.client.readContract({
    //       abi: AdaptiveCurveIrmAbi,
    //       address: morphoAddressesByChain[this.chainId].irm,
    //       functionName: "borrowRateView",
    //       args: [
    //         {
    //           loanToken: morphoMarketParams.loanToken.address as Address,
    //           collateralToken: morphoMarketParams.collateralToken
    //             .address as Address,
    //           oracle: morphoMarketParams.oracle as Address,
    //           irm: morphoMarketParams.irm as Address,
    //           lltv: BigInt(morphoMarketParams.lltv),
    //         },
    //         {
    //           totalSupplyShares,
    //           totalSupplyAssets,
    //           totalBorrowAssets,
    //           totalBorrowShares,
    //           lastUpdate,
    //           fee,
    //         },
    //       ],
    //     })

    //     borrowRate = wTaylorCompounded(borrowRate, BigInt(SECONDS_PER_YEAR))
    //     const liquidity = await hyperdrive.getPresentValue()
    //     const fixedRate = await hyperdrive.getFixedApr()

    //     return {
    //       market: {
    //         ...market,
    //         loanToken: {
    //           ...market.loanToken,
    //           address: market.loanToken.address as Address,
    //         },
    //         collateralToken: {
    //           ...market.collateralToken,
    //           address: market.loanToken.address as Address,
    //         },
    //         hyperdrive: market.hyperdrive as Address,
    //       },
    //       liquidity,
    //       fixedRate,
    //       borrowRate,
    //     }
    //   })
    // )
  }
}

// interface MarketReader {
//   getBorrowPositions: (
//     client: PublicClient,
//     account: Address,
//     chainId: SupportedChainId
//   ) => Promise<BorrowPosition[]>

//   getAllMarketsInfo: (
//     client: PublicClient,
//     chainId: SupportedChainId
//   ) => Promise<
//     {
//       market: Market
//       liquidity: bigint
//       fixedRate: bigint
//       borrowRate: bigint
//     }[]
//   >
// }

// todo make into a class

// export const _MorphoMarketReader: MarketReader = {
//   //@ts-ignore
//   async getAllMarketsInfo(client, chainId = mainnet.id) {
//     const appConfig = getAppConfig(chainId)

//     const markets = appConfig.morphoMarkets

//     return Promise.all(
//       markets.map(async (market) => {
//         const hyperdrive = new ReadHyperdrive({
//           address: market.hyperdrive as Address, // hyperdrive contract address
//           publicClient: client,
//         })

//         const [
//           totalSupplyAssets,
//           totalSupplyShares,
//           totalBorrowAssets,
//           totalBorrowShares,
//           lastUpdate,
//           fee,
//         ] = await client.readContract({
//           abi: MorphoBlueAbi,
//           address: morphoAddressesByChain[sepolia.id].blue,
//           functionName: "market",
//           args: [market.id as Address],
//         })

//         const morphoMarketParams = getAppConfig(chainId).morphoMarkets.find(
//           (market) => market.id
//         )

//         if (!morphoMarketParams) {
//           throw new Error()
//         }

//         const borrowRate = await client.readContract({
//           abi: AdaptiveCurveIrmAbi,
//           address: morphoAddressesByChain[sepolia.id].irm,
//           functionName: "borrowRateView",
//           args: [
//             {
//               loanToken: morphoMarketParams.loanToken.address as Address,
//               collateralToken: morphoMarketParams.collateralToken
//                 .address as Address,
//               oracle: morphoMarketParams.oracle as Address,
//               irm: morphoMarketParams.irm as Address,
//               lltv: BigInt(morphoMarketParams.lltv),
//             },
//             {
//               totalSupplyShares,
//               totalSupplyAssets,
//               totalBorrowAssets,
//               totalBorrowShares,
//               lastUpdate,
//               fee,
//             },
//           ],
//         })

//         const borrowAPY = wTaylorCompounded(
//           borrowRate,
//           BigInt(SECONDS_PER_YEAR)
//         )

//         const liquidity = await hyperdrive.getPresentValue()
//         const fixedRate = await hyperdrive.getFixedApr()
//         return {
//           market,
//           liquidity,
//           fixedRate,
//           borrowRate: borrowAPY,
//         }
//       })
//     )
//   },
//   async getBorrowPositions(
//     client,
//     account,
//     chainId = mainnet.id
//   ): Promise<BorrowPosition[]> {
//     if (chainId === sepolia.id) {
//       const accountBorrowPositions: BorrowPosition[] = await Promise.all(
//         whitelistedMetaMorphoMarketsByChain[sepolia.id].map(async (market) => {
//           // fetch position shares
//           const [, borrowShares, collateral] = await client.readContract({
//             abi: MorphoBlueAbi,
//             address: morphoAddressesByChain[sepolia.id].blue,
//             functionName: "position",
//             args: [market.morphoId as Address, account],
//           })

//           const [
//             totalSupplyAssets,
//             totalSupplyShares,
//             totalBorrowAssets,
//             totalBorrowShares,
//             lastUpdate,
//             fee,
//           ] = await client.readContract({
//             abi: MorphoBlueAbi,
//             address: morphoAddressesByChain[sepolia.id].blue,
//             functionName: "market",
//             args: [market.morphoId as Address],
//           })

//           const morphoMarketParams = getAppConfig(chainId).morphoMarkets.find(
//             (market) => market.id
//           )

//           if (!morphoMarketParams) {
//             throw new Error()
//           }

//           const [loanToken, collateralToken, oracle, irm, lltv] =
//             await client.readContract({
//               abi: MorphoBlueAbi,
//               address: morphoAddressesByChain[sepolia.id].blue,
//               functionName: "idToMarketParams",
//               args: [market.morphoId as Address],
//             })

//           const borrowRate = await client.readContract({
//             abi: AdaptiveCurveIrmAbi,
//             address: morphoAddressesByChain[sepolia.id].irm,
//             functionName: "borrowRateView",
//             args: [
//               {
//                 loanToken,
//                 collateralToken,
//                 oracle,
//                 irm,
//                 lltv,
//               },
//               {
//                 totalSupplyShares,
//                 totalSupplyAssets,
//                 totalBorrowAssets,
//                 totalBorrowShares,
//                 lastUpdate,
//                 fee,
//               },
//             ],
//           })

//           const borrowAssetsUser = toAssetsUp(
//             borrowShares,
//             totalBorrowAssets,
//             totalBorrowShares
//           )

//           const borrowAPY = wTaylorCompounded(
//             borrowRate,
//             BigInt(SECONDS_PER_YEAR)
//           )

//           const oraclePrice = await client.readContract({
//             abi: OracleAbi,
//             address: oracle,
//             functionName: "price",
//           })

//           const ltv = wDivDown(
//             borrowAssetsUser,
//             mulDivDown(collateral, oraclePrice, ORACLE_PRICE_SCALE)
//           )

//           const collateralPrice = mulDivDown(
//             collateral,
//             oraclePrice,
//             ORACLE_PRICE_SCALE
//           )

//           const liqPrice = wDivDown(
//             borrowAssetsUser,
//             wMulDown(lltv, collateralPrice)
//           )

//           const collateralTokenPriceUsd = await getTokenUsdPrice(
//             chainId,
//             morphoMarketParams.collateralToken.address as Address
//           )

//           const loanTokenPriceUsd = await getTokenUsdPrice(
//             chainId,
//             morphoMarketParams.loanToken.address as Address
//           )

//           collateralTokenPriceUsd && console.log()

//           return {
//             ...morphoMarketParams,
//             totalCollateral: collateral.toString(),
//             totalCollateralUsd: collateralTokenPriceUsd
//               ? dn.format(
//                   [
//                     wMulDown(collateralTokenPriceUsd, collateral),
//                     morphoMarketParams.collateralToken.decimals,
//                   ],
//                   {
//                     digits: 2,
//                     trailingZeros: true,
//                   }
//                 )
//               : undefined,
//             totalDebt: borrowAssetsUser.toString(),
//             totalDebtUsd: loanTokenPriceUsd
//               ? dn.format(
//                   [
//                     wMulDown(loanTokenPriceUsd, borrowAssetsUser),
//                     morphoMarketParams.loanToken.decimals,
//                   ],
//                   {
//                     digits: 2,
//                     trailingZeros: true,
//                   }
//                 )
//               : undefined,
//             marketMaxLtv: lltv.toString(),
//             currentBorrowApy: Number(formatUnits(borrowAPY, 18)),
//             ltv: Number(dn.format([ltv, 18], 2)),
//             liquidationPrice: dn.format(
//               [liqPrice, morphoMarketParams.collateralToken.decimals],
//               2
//             ),
//           } as BorrowPosition
//         })
//       )

//       return accountBorrowPositions
//     }

//     const currentTimestamp = Math.round(Date.now() / 1000)
//     const res = await request(MORPHO_GQL_URL, UserPositionsDocument, {
//       address: account,
//       startTimestamp: currentTimestamp - 2592000,
//       endTimestamp: currentTimestamp,
//     })

//     // Filter small positions out.
//     const filteredPositions = res.userByAddress.marketPositions.filter(
//       (position) =>
//         BigInt(position.borrowAssets) > 0n &&
//         position.borrowAssetsUsd &&
//         position.borrowAssetsUsd > 10
//     )

//     const borrowPositions = filteredPositions.map((position) => {
//       const collateralAsset = position.market.collateralAsset
//       const collateralUsd = position.collateralUsd
//       const borrowAssetsUsd = position.borrowAssetsUsd
//       const historicalState = position.market.historicalState?.borrowApy
//       const marketState = position.market.state

//       if (!collateralAsset) {
//         throw new Error("")
//       }

//       if (collateralUsd === undefined || collateralUsd === null) {
//         throw new Error("")
//       }

//       if (borrowAssetsUsd === undefined || borrowAssetsUsd === null) {
//         throw new Error("")
//       }

//       if (historicalState === undefined || historicalState === null) {
//         throw new Error("")
//       }

//       if (marketState === undefined || marketState === null) {
//         throw new Error("")
//       }

//       return {
//         loanToken: {
//           symbol: position.market.loanAsset.symbol,
//           name: position.market.loanAsset.name,
//           decimals: position.market.loanAsset.decimals,
//           address: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb" as Address, // todo
//         },
//         collateralToken: {
//           symbol: collateralAsset.symbol,
//           name: collateralAsset.name,
//           decimals: collateralAsset.decimals,
//           address: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb" as Address, // todo
//         },
//         totalCollateral: position.collateral,
//         totalCollateralUsd: collateralUsd.toString(),
//         totalDebt: position.borrowAssets,
//         totalDebtUsd: borrowAssetsUsd.toString(),
//         ltv: position.healthFactor ?? 0,
//         marketMaxLtv: position.market.lltv,
//         currentBorrowApy: marketState.borrowApy,
//         averageBorrowApy: historicalState.length
//           ? historicalState.reduce((prev, curr) => {
//               return prev + (curr.y ?? 0)
//             }, 0) / historicalState.length
//           : 0,
//       }
//     })

//     return borrowPositions
//   },
// }
