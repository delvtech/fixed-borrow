import * as dn from "dnum"
import request from "graphql-request"
import { AdaptiveCurveIrmAbi } from "lib/morpho/abi/AdaptiveCurveIrmAbi"
import { MorphoBlueAbi } from "lib/morpho/abi/MorphoBlueAbi"
import { OracleAbi } from "lib/morpho/abi/OracleAbi"
import { MORPHO_GQL_URL } from "lib/morpho/constants"
import { UserPositionsDocument } from "lib/morpho/gql/graphql"
import {
  ORACLE_PRICE_SCALE,
  SECONDS_PER_YEAR,
  mulDivDown,
  toAssetsUp,
  wDivDown,
  wMulDown,
  wTaylorCompounded,
} from "lib/morpho/utils"
import { Address, PublicClient, formatUnits } from "viem"
import { mainnet, sepolia } from "viem/chains"
import {
  SupportedChainId,
  morphoAddressesByChain,
  whitelistedMetaMorphoMarketsByChain,
} from "../../src/constants"
import { BorrowPosition } from "../../src/types"
import { getAppConfig } from "../../src/utils/getAppConfig"
import { getTokenUsdPrice } from "../../src/utils/getTokenUsdPrice"

interface MarketReader {
  getBorrowPositions: (
    client: PublicClient,
    account: Address,
    chainId: SupportedChainId
  ) => Promise<BorrowPosition[]>
}

export const MorphoMarketReader: MarketReader = {
  async getBorrowPositions(
    client,
    account,
    chainId = mainnet.id
  ): Promise<BorrowPosition[]> {
    if (chainId === sepolia.id) {
      const accountBorrowPositions: BorrowPosition[] = await Promise.all(
        whitelistedMetaMorphoMarketsByChain[sepolia.id].map(async (market) => {
          // fetch position shares
          const [, borrowShares, collateral] = await client.readContract({
            abi: MorphoBlueAbi,
            address: morphoAddressesByChain[sepolia.id].blue,
            functionName: "position",
            args: [market as Address, account],
          })

          const [
            totalSupplyAssets,
            totalSupplyShares,
            totalBorrowAssets,
            totalBorrowShares,
            lastUpdate,
            fee,
          ] = await client.readContract({
            abi: MorphoBlueAbi,
            address: morphoAddressesByChain[sepolia.id].blue,
            functionName: "market",
            args: [market as Address],
          })

          const morphoMarketParams = getAppConfig(chainId).morphoMarkets.find(
            (market) => market.id
          )

          if (!morphoMarketParams) {
            throw new Error()
          }

          const [loanToken, collateralToken, oracle, irm, lltv] =
            await client.readContract({
              abi: MorphoBlueAbi,
              address: morphoAddressesByChain[sepolia.id].blue,
              functionName: "idToMarketParams",
              args: [market as Address],
            })

          const borrowRate = await client.readContract({
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

          const oraclePrice = await client.readContract({
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
            chainId,
            morphoMarketParams.collateralToken.address as Address
          )

          const loanTokenPriceUsd = await getTokenUsdPrice(
            chainId,
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
    }

    const currentTimestamp = Math.round(Date.now() / 1000)
    const res = await request(MORPHO_GQL_URL, UserPositionsDocument, {
      address: account,
      startTimestamp: currentTimestamp - 2592000,
      endTimestamp: currentTimestamp,
    })

    // Filter small positions out.
    const filteredPositions = res.userByAddress.marketPositions.filter(
      (position) =>
        BigInt(position.borrowAssets) > 0n &&
        position.borrowAssetsUsd &&
        position.borrowAssetsUsd > 10
    )

    const borrowPositions = filteredPositions.map((position) => {
      const collateralAsset = position.market.collateralAsset
      const collateralUsd = position.collateralUsd
      const borrowAssetsUsd = position.borrowAssetsUsd
      const historicalState = position.market.historicalState?.borrowApy
      const marketState = position.market.state

      if (!collateralAsset) {
        throw new Error("")
      }

      if (collateralUsd === undefined || collateralUsd === null) {
        throw new Error("")
      }

      if (borrowAssetsUsd === undefined || borrowAssetsUsd === null) {
        throw new Error("")
      }

      if (historicalState === undefined || historicalState === null) {
        throw new Error("")
      }

      if (marketState === undefined || marketState === null) {
        throw new Error("")
      }

      return {
        loanToken: {
          symbol: position.market.loanAsset.symbol,
          name: position.market.loanAsset.name,
          decimals: position.market.loanAsset.decimals,
          address: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb" as Address, // todo
        },
        collateralToken: {
          symbol: collateralAsset.symbol,
          name: collateralAsset.name,
          decimals: collateralAsset.decimals,
          address: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb" as Address, // todo
        },
        totalCollateral: position.collateral,
        totalCollateralUsd: collateralUsd.toString(),
        totalDebt: position.borrowAssets,
        totalDebtUsd: borrowAssetsUsd.toString(),
        ltv: position.healthFactor ?? 0,
        marketMaxLtv: position.market.lltv,
        currentBorrowApy: marketState.borrowApy,
        averageBorrowApy: historicalState.length
          ? historicalState.reduce((prev, curr) => {
              return prev + (curr.y ?? 0)
            }, 0) / historicalState.length
          : 0,
      }
    })

    return borrowPositions
  },
}
