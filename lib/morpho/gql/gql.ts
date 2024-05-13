/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core"
import * as types from "./graphql"

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 */
const documents = {
  "query AllMarkets {\n  markets {\n    items {\n      uniqueKey\n      lltv\n      oracleAddress\n      irmAddress\n      loanAsset {\n        address\n        symbol\n        decimals\n      }\n      collateralAsset {\n        address\n        symbol\n        decimals\n      }\n      state {\n        borrowApy\n        borrowAssets\n        borrowAssetsUsd\n        supplyApy\n        supplyAssets\n        supplyAssetsUsd\n        fee\n        utilization\n      }\n    }\n  }\n}":
    types.AllMarketsDocument,
  "query UserPositions($address: String!) {\n  userByAddress(address: $address) {\n    address\n    marketPositions {\n      market {\n        ...MarketCore\n      }\n      borrowAssets\n      borrowShares\n      borrowAssetsUsd\n      collateral\n      collateralUsd\n      healthFactor\n    }\n  }\n}\n\nfragment MarketCore on Market {\n  uniqueKey\n  loanAsset {\n    id\n    address\n    decimals\n    name\n    symbol\n  }\n  collateralAsset {\n    id\n    address\n    decimals\n    name\n    symbol\n  }\n  state {\n    utilization\n    borrowApy\n    netBorrowApy\n  }\n}":
    types.UserPositionsDocument,
}

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = graphql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function graphql(source: string): unknown

/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query AllMarkets {\n  markets {\n    items {\n      uniqueKey\n      lltv\n      oracleAddress\n      irmAddress\n      loanAsset {\n        address\n        symbol\n        decimals\n      }\n      collateralAsset {\n        address\n        symbol\n        decimals\n      }\n      state {\n        borrowApy\n        borrowAssets\n        borrowAssetsUsd\n        supplyApy\n        supplyAssets\n        supplyAssetsUsd\n        fee\n        utilization\n      }\n    }\n  }\n}"
): (typeof documents)["query AllMarkets {\n  markets {\n    items {\n      uniqueKey\n      lltv\n      oracleAddress\n      irmAddress\n      loanAsset {\n        address\n        symbol\n        decimals\n      }\n      collateralAsset {\n        address\n        symbol\n        decimals\n      }\n      state {\n        borrowApy\n        borrowAssets\n        borrowAssetsUsd\n        supplyApy\n        supplyAssets\n        supplyAssetsUsd\n        fee\n        utilization\n      }\n    }\n  }\n}"]
/**
 * The graphql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function graphql(
  source: "query UserPositions($address: String!) {\n  userByAddress(address: $address) {\n    address\n    marketPositions {\n      market {\n        ...MarketCore\n      }\n      borrowAssets\n      borrowShares\n      borrowAssetsUsd\n      collateral\n      collateralUsd\n      healthFactor\n    }\n  }\n}\n\nfragment MarketCore on Market {\n  uniqueKey\n  loanAsset {\n    id\n    address\n    decimals\n    name\n    symbol\n  }\n  collateralAsset {\n    id\n    address\n    decimals\n    name\n    symbol\n  }\n  state {\n    utilization\n    borrowApy\n    netBorrowApy\n  }\n}"
): (typeof documents)["query UserPositions($address: String!) {\n  userByAddress(address: $address) {\n    address\n    marketPositions {\n      market {\n        ...MarketCore\n      }\n      borrowAssets\n      borrowShares\n      borrowAssetsUsd\n      collateral\n      collateralUsd\n      healthFactor\n    }\n  }\n}\n\nfragment MarketCore on Market {\n  uniqueKey\n  loanAsset {\n    id\n    address\n    decimals\n    name\n    symbol\n  }\n  collateralAsset {\n    id\n    address\n    decimals\n    name\n    symbol\n  }\n  state {\n    utilization\n    borrowApy\n    netBorrowApy\n  }\n}"]

export function graphql(source: string) {
  return (documents as any)[source] ?? {}
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> =
  TDocumentNode extends DocumentNode<infer TType, any> ? TType : never
