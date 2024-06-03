import request from "graphql-request"
import { AdaptiveCurveIrmAbi } from "lib/morpho/abi/AdaptiveCurveIrmAbi"
import { MorphoBlueAbi } from "lib/morpho/abi/MorphoBlueAbi"
import { MORPHO_GQL_URL } from "lib/morpho/constants"
import { UserPositionsDocument } from "lib/morpho/gql/graphql"
import { Address, Chain, PublicClient } from "viem"
import { mainnet, sepolia } from "viem/chains"
import { BorrowPosition } from "./constants"

const supportedChainIds: Chain["id"][] = [mainnet.id, sepolia.id] as const
type SupportedChainId = (typeof supportedChainIds)[number]

const morphoAddressesByChain: Record<
  SupportedChainId,
  {
    blue: Address
    irm: Address
  }
> = {
  [mainnet.id]: {
    blue: "0xBBBBBbbBBb9cC5e90e3b3Af64bdAF62C37EEFFCb",
    irm: "0x870aC11D48B15DB9a138Cf899d20F13F79Ba00BC",
  },
  [sepolia.id]: {
    blue: "0x927A9E3C4B897eF5135e6B2C7689637fA8E2E0Bd",
    irm: "0x0fB591F09ab2eB967c0EFB9eE0EF6642c2abe6Ab",
  },
}

const whitelistedMetaMorphoMarketsByChain: Record<SupportedChainId, string[]> =
  {
    [mainnet.id]: [],
    [sepolia.id]: [],
  }

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
      const accountBorrowPositions = await Promise.all(
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
        })
      )

      // returns (supplyShares, borrowShares, collateral)

      return []
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
