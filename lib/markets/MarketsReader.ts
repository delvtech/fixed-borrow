import request from "graphql-request"
import { AdaptiveCurveIrmAbi } from "lib/morpho/abi/AdaptiveCurveIrmAbi"
import { MorphoBlueAbi } from "lib/morpho/abi/MorphoBlueAbi"
import { MORPHO_GQL_URL } from "lib/morpho/constants"
import { UserPositionsDocument } from "lib/morpho/gql/graphql"
import {
  SECONDS_PER_YEAR,
  toAssetsUp,
  wTaylorCompounded,
} from "lib/morpho/utils"
import { Address, PublicClient, formatUnits } from "viem"
import { mainnet, sepolia } from "viem/chains"
import { getToken } from "wagmi/actions"
import { rainbowConfig } from "../../src/App"
import {
  SupportedChainId,
  morphoAddressesByChain,
  whitelistedMetaMorphoMarketsByChain,
} from "../../src/constants"
import { BorrowPosition } from "../../src/types"

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
          const [supplyShares, borrowShares, collateral] =
            await client.readContract({
              abi: MorphoBlueAbi,
              address: morphoAddressesByChain[sepolia.id].blue,
              functionName: "position",
              args: [market as Address, account],
            })

          // fetch market state

          // returns  totalSupplyAssets uint128, totalSupplyShares uint128, totalBorrowAssets uint128, totalBorrowShares uint128, lastUpdate uint128, fee uint128
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

          //loanToken address, collateralToken address, oracle address, irm address, lltv uint256
          const [loanToken, collateralToken, oracle, irm, lltv] =
            await client.readContract({
              abi: MorphoBlueAbi,
              address: morphoAddressesByChain[sepolia.id].blue,
              functionName: "idToMarketParams",
              args: [market as Address],
            })

          const loanTokenData = await getToken(rainbowConfig, {
            address: loanToken,
          })
          const collateralTokenData = await getToken(rainbowConfig, {
            address: collateralToken,
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

          console.log(formatUnits(borrowAPY, 18))

          return {
            loanToken: {
              symbol: loanTokenData.symbol,
              name: loanTokenData.name,
              decimals: loanTokenData.decimals,
              address: loanToken,
            },
            collateralToken: {
              symbol: collateralTokenData.symbol,
              name: collateralTokenData.name,
              decimals: collateralTokenData.decimals,
              address: collateralToken,
            },
            totalCollateral: collateral.toString(),
            totalDebt: borrowAssetsUser.toString(),
            ltv: 0,
            marketMaxLtv: lltv.toString(),
            currentBorrowApy: Number(formatUnits(borrowAPY, 18)),
            averageBorrowApy: 0,
          } as BorrowPosition
        })
      )

      // returns (supplyShares, borrowShares, collateral)

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
