import request from "graphql-request"
import { MORPHO_GQL_URL } from "lib/morpho/constants"
import { AllMarketsDocument } from "lib/morpho/gql/graphql"

export async function getAllMarkets() {
  const res = await request(MORPHO_GQL_URL, AllMarketsDocument)

  console.log(res)
}
