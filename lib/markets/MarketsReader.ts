import request from "graphql-request"
import { MORPHO_GQL_URL } from "lib/morpho/constants"
import { UserPositionsDocument } from "lib/morpho/gql/graphql"
import { Address } from "viem"

interface BorrowPosition {}

interface MarketReader {
  getBorrowPositions: (account: Address) => Promise<BorrowPosition>
}

export const MorphoMarketReader: MarketReader = {
  async getBorrowPositions(account) {
    const res = await request(MORPHO_GQL_URL, UserPositionsDocument, {
      address: account,
    })

    console.log(res)

    return {}
  },
}
