import request from "graphql-request"
import { MORPHO_GQL_URL } from "lib/morpho/constants"
import {
  UserPositionsDocument,
  UserPositionsQuery,
} from "lib/morpho/gql/graphql"
import { Address } from "viem"

interface MarketReader {
  getBorrowPositions: (
    account: Address
  ) => Promise<UserPositionsQuery["userByAddress"]["marketPositions"]>
}

export const MorphoMarketReader: MarketReader = {
  async getBorrowPositions(account) {
    const currentTimestamp = Math.round(Date.now() / 1000)
    const res = await request(MORPHO_GQL_URL, UserPositionsDocument, {
      address: account,
      startTimestamp: currentTimestamp - 2592000,
      endTimestamp: currentTimestamp,
    })

    return res.userByAddress.marketPositions.filter(
      (position) => BigInt(position.borrowAssets) > 0n
    )
  },
}
