import request from "graphql-request"
import { MORPHO_GQL_URL } from "lib/morpho/constants"
import { UserPositionsDocument } from "lib/morpho/gql/graphql"
import { Address } from "viem"
import { BorrowPosition } from "./constants"

interface MarketReader {
  getBorrowPositions: (account: Address) => Promise<BorrowPosition[]>
}

export const MorphoMarketReader: MarketReader = {
  async getBorrowPositions(account): Promise<BorrowPosition[]> {
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
        },
        collateralToken: {
          symbol: collateralAsset.symbol,
          name: collateralAsset.name,
          decimals: collateralAsset.decimals,
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
