/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from "@graphql-typed-document-node/core"
export type Maybe<T> = T | null
export type InputMaybe<T> = Maybe<T>
export type Exact<T extends { [key: string]: unknown }> = {
  [K in keyof T]: T[K]
}
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]?: Maybe<T[SubKey]>
}
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & {
  [SubKey in K]: Maybe<T[SubKey]>
}
export type MakeEmpty<
  T extends { [key: string]: unknown },
  K extends keyof T,
> = { [_ in K]?: never }
export type Incremental<T> =
  | T
  | {
      [P in keyof T]?: P extends " $fragmentName" | "__typename" ? T[P] : never
    }
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string }
  String: { input: string; output: string }
  Boolean: { input: boolean; output: boolean }
  Int: { input: number; output: number }
  Float: { input: number; output: number }
  /** 42 character long hex address */
  Address: { input: any; output: any }
  /** The `BigInt` scalar type represents non-fractional signed whole numeric values. */
  BigInt: { input: string; output: string }
  /** Hexadecimal string */
  HexString: { input: any; output: any }
  /** 66 character long hexadecimal market ID */
  MarketId: { input: any; output: any }
}

export type AddressDataPoint = {
  __typename?: "AddressDataPoint"
  x: Scalars["Float"]["output"]
  y?: Maybe<Scalars["Address"]["output"]>
}

/** Asset */
export type Asset = {
  __typename?: "Asset"
  /** ERC-20 token contract address */
  address: Scalars["Address"]["output"]
  chain: Chain
  decimals: Scalars["Float"]["output"]
  /** Historical price in USD, for display purpose */
  historicalPriceUsd?: Maybe<Array<FloatDataPoint>>
  /** Historical spot price in ETH */
  historicalSpotPriceEth?: Maybe<Array<FloatDataPoint>>
  id: Scalars["ID"]["output"]
  name: Scalars["String"]["output"]
  /** Current price in USD, for display purpose. */
  priceUsd?: Maybe<Scalars["Float"]["output"]>
  /** Current spot price in ETH. */
  spotPriceEth?: Maybe<Scalars["Float"]["output"]>
  symbol: Scalars["String"]["output"]
  /** ERC-20 token total supply */
  totalSupply: Scalars["BigInt"]["output"]
  /** MetaMorpho vault */
  vault?: Maybe<Vault>
}

/** Asset */
export type AssetHistoricalPriceUsdArgs = {
  options: TimeseriesOptions
}

/** Asset */
export type AssetHistoricalSpotPriceEthArgs = {
  options: TimeseriesOptions
}

/** Asset */
export type AssetPriceUsdArgs = {
  timestamp?: InputMaybe<Scalars["Float"]["input"]>
}

/** Asset */
export type AssetSpotPriceEthArgs = {
  timestamp?: InputMaybe<Scalars["Float"]["input"]>
}

export type AssetsFilters = {
  /** Filter by token contract address. Case insensitive. */
  address_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars["Int"]["input"]>>
  /** Filter by asset id */
  id_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  search?: InputMaybe<Scalars["String"]["input"]>
  /** Filter by token symbol */
  symbol_in?: InputMaybe<Array<Scalars["String"]["input"]>>
}

export type BigIntDataPoint = {
  __typename?: "BigIntDataPoint"
  x: Scalars["Float"]["output"]
  y?: Maybe<Scalars["BigInt"]["output"]>
}

export enum CacheControlScope {
  Private = "PRIVATE",
  Public = "PUBLIC",
}

/** Chain */
export type Chain = {
  __typename?: "Chain"
  currency: Scalars["String"]["output"]
  id: Scalars["Int"]["output"]
  network: Scalars["String"]["output"]
}

/** Chain synchronization state */
export type ChainSynchronizationState = {
  __typename?: "ChainSynchronizationState"
  blockNumber: Scalars["BigInt"]["output"]
  chain: Chain
  id: Scalars["ID"]["output"]
  key: Scalars["String"]["output"]
}

/** Amount of collateral at risk of liquidation at collateralPriceRatio * oracle price */
export type CollateralAtRiskDataPoint = {
  __typename?: "CollateralAtRiskDataPoint"
  collateralAssets: Scalars["BigInt"]["output"]
  collateralPriceRatio: Scalars["Float"]["output"]
  collateralUsd: Scalars["Float"]["output"]
}

export type FloatDataPoint = {
  __typename?: "FloatDataPoint"
  x: Scalars["Float"]["output"]
  y?: Maybe<Scalars["Float"]["output"]>
}

/** IRM curve data point */
export type IrmCurveDataPoint = {
  __typename?: "IRMCurveDataPoint"
  /** Borrow APY at utilization rate */
  borrowApy: Scalars["Float"]["output"]
  /** Supply APY at utilization rate */
  supplyApy: Scalars["Float"]["output"]
  /** Market utilization rate */
  utilization: Scalars["Float"]["output"]
}

export type IntDataPoint = {
  __typename?: "IntDataPoint"
  x: Scalars["Float"]["output"]
  y?: Maybe<Scalars["Int"]["output"]>
}

/** Morpho Blue market */
export type Market = {
  __typename?: "Market"
  /** Market bad debt values */
  badDebt?: Maybe<MarketBadDebt>
  collateralAsset?: Maybe<Asset>
  /** Amount of collateral to borrow 1 loan asset scaled to both asset decimals */
  collateralPrice?: Maybe<Scalars["BigInt"]["output"]>
  /** Market concentrations */
  concentration?: Maybe<MarketConcentration>
  creationBlockNumber: Scalars["Int"]["output"]
  creationTimestamp?: Maybe<Scalars["BigInt"]["output"]>
  creatorAddress?: Maybe<Scalars["Address"]["output"]>
  /** Current IRM curve at different utilization thresholds for display purpose */
  currentIrmCurve?: Maybe<Array<IrmCurveDataPoint>>
  /** Daily market APYs */
  dailyApys?: Maybe<MarketApyAggregates>
  /** State history */
  historicalState?: Maybe<MarketHistory>
  id: Scalars["ID"]["output"]
  irmAddress: Scalars["Address"]["output"]
  lltv: Scalars["BigInt"]["output"]
  loanAsset: Asset
  /** Monthly market APYs */
  monthlyApys?: Maybe<MarketApyAggregates>
  morphoBlue: MorphoBlue
  oracleAddress: Scalars["Address"]["output"]
  /** Feeds used by the oracle if provided by the contract */
  oracleFeed?: Maybe<MarketOracleFeed>
  /** Market oracle information */
  oracleInfo?: Maybe<MarketOracleInfo>
  /** Market realized bad debt values */
  realizedBadDebt?: Maybe<MarketBadDebt>
  /** Current state */
  state?: Maybe<MarketState>
  uniqueKey: Scalars["MarketId"]["output"]
  /** Market warnings */
  warnings?: Maybe<Array<MarketWarning>>
  /** Weekly market APYs */
  weeklyApys?: Maybe<MarketApyAggregates>
}

/** Morpho Blue market */
export type MarketCurrentIrmCurveArgs = {
  numberOfPoints?: InputMaybe<Scalars["Float"]["input"]>
}

/** Market APY aggregates */
export type MarketApyAggregates = {
  __typename?: "MarketApyAggregates"
  /** Average market borrow APY */
  borrowApy?: Maybe<Scalars["Float"]["output"]>
  /** Average market borrow APY including rewards */
  netBorrowApy?: Maybe<Scalars["Float"]["output"]>
  /** Average market supply APY including rewards */
  netSupplyApy?: Maybe<Scalars["Float"]["output"]>
  /** Average market supply APY */
  supplyApy?: Maybe<Scalars["Float"]["output"]>
}

/** Bad debt realized in the market */
export type MarketBadDebt = {
  __typename?: "MarketBadDebt"
  /** Amount of bad debt realized in the market in underlying units. */
  underlying?: Maybe<Scalars["BigInt"]["output"]>
  /** Amount of bad debt realized in the market in USD. */
  usd?: Maybe<Scalars["Float"]["output"]>
}

/** Market collateral at risk of liquidation */
export type MarketCollateralAtRisk = {
  __typename?: "MarketCollateralAtRisk"
  /** Total collateral at risk of liquidation at certain prices thresholds. */
  collateralAtRisk?: Maybe<Array<CollateralAtRiskDataPoint>>
  market: Market
}

/** Market collateral transfer transaction data */
export type MarketCollateralTransferTransactionData = {
  __typename?: "MarketCollateralTransferTransactionData"
  assets: Scalars["BigInt"]["output"]
  assetsUsd?: Maybe<Scalars["Float"]["output"]>
  market: Market
}

/** Morpho Blue supply and borrow side concentrations */
export type MarketConcentration = {
  __typename?: "MarketConcentration"
  /** Borrowers Herfindahl-Hirschman Index */
  borrowHhi?: Maybe<Scalars["Float"]["output"]>
  /** Borrowers Herfindahl-Hirschman Index */
  supplyHhi?: Maybe<Scalars["Float"]["output"]>
}

/** Filtering options for markets. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export type MarketFilters = {
  /** Filter by greater than or equal to given borrow APY */
  borrowApy_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given borrow APY */
  borrowApy_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by greater than or equal to given borrow asset amount, in USD. */
  borrowAssetsUsd_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given borrow asset amount, in USD. */
  borrowAssetsUsd_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by greater than or equal to given borrow asset amount, in underlying token units. */
  borrowAssets_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given borrow asset amount, in underlying token units. */
  borrowAssets_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by greater than or equal to given borrow shares amount */
  borrowShares_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given borrow shares amount */
  borrowShares_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars["Int"]["input"]>>
  /** Filter by collateral asset address. Case insensitive. */
  collateralAssetAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by collateral asset id */
  collateralAssetId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given fee rate */
  fee_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given fee rate */
  fee_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by market id */
  id_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by market irm address */
  irmAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given lltv */
  lltv_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given lltv */
  lltv_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by loan asset address. Case insensitive. */
  loanAssetAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by loan asset id */
  loanAssetId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given net borrow APY */
  netBorrowApy_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given net borrow APY */
  netBorrowApy_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by greater than or equal to given net supply APY */
  netSupplyApy_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given net supply APY */
  netSupplyApy_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by market oracle address. Case insensitive. */
  oracleAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given rate at target utilization */
  rateAtUTarget_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given rate at target utilization */
  rateAtUTarget_lte?: InputMaybe<Scalars["Float"]["input"]>
  search?: InputMaybe<Scalars["String"]["input"]>
  /** Filter by greater than or equal to given supply APY */
  supplyApy_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given supply APY */
  supplyApy_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by greater than or equal to given supply asset amount, in USD. */
  supplyAssetsUsd_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given supply asset amount, in USD. */
  supplyAssetsUsd_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by greater than or equal to given supply asset amount, in underlying token units. */
  supplyAssets_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given supply asset amount, in underlying token units. */
  supplyAssets_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by greater than or equal to given supply shares amount */
  supplyShares_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given borrow shares amount */
  supplyShares_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by market unique key */
  uniqueKey_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given utilization rate */
  utilization_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given utilization rate */
  utilization_lte?: InputMaybe<Scalars["Float"]["input"]>
}

/** Market state history */
export type MarketHistory = {
  __typename?: "MarketHistory"
  /** Borrow APY */
  borrowApy?: Maybe<Array<FloatDataPoint>>
  /** Amount borrowed on the market, in underlying units. Amount increases as interests accrue. */
  borrowAssets?: Maybe<Array<BigIntDataPoint>>
  /** Amount borrowed on the market, in USD for display purpose */
  borrowAssetsUsd?: Maybe<Array<FloatDataPoint>>
  /** Amount borrowed on the market, in market share units. Amount does not increase as interest accrue. */
  borrowShares?: Maybe<Array<BigIntDataPoint>>
  /** Amount of collateral in the market, in underlying units */
  collateralAssets?: Maybe<Array<BigIntDataPoint>>
  /** Amount of collateral in the market, in USD for display purpose */
  collateralAssetsUsd?: Maybe<Array<FloatDataPoint>>
  /** Fee rate */
  fee?: Maybe<Array<FloatDataPoint>>
  /** Amount available to borrow on the market, in underlying units */
  liquidityAssets?: Maybe<Array<BigIntDataPoint>>
  /** Amount available to borrow on the market, in USD for display purpose */
  liquidityAssetsUsd?: Maybe<Array<FloatDataPoint>>
  /** Supply APY including rewards */
  netBorrowApy?: Maybe<Array<FloatDataPoint>>
  /** Supply APY including rewards */
  netSupplyApy?: Maybe<Array<FloatDataPoint>>
  /** Rate at utilization target */
  rateAtUTarget?: Maybe<Array<FloatDataPoint>>
  /** Supply APY */
  supplyApy?: Maybe<Array<FloatDataPoint>>
  /** Amount supplied on the market, in underlying units. Amount increases as interests accrue. */
  supplyAssets?: Maybe<Array<BigIntDataPoint>>
  /** Amount supplied on the market, in USD for display purpose */
  supplyAssetsUsd?: Maybe<Array<FloatDataPoint>>
  /** Amount supplied on the market, in market share units. Amount does not increase as interest accrue. */
  supplyShares?: Maybe<Array<BigIntDataPoint>>
  /** Utilization rate */
  utilization?: Maybe<Array<FloatDataPoint>>
}

/** Market state history */
export type MarketHistoryBorrowApyArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistoryBorrowAssetsArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistoryBorrowAssetsUsdArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistoryBorrowSharesArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistoryCollateralAssetsArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistoryCollateralAssetsUsdArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistoryFeeArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistoryLiquidityAssetsArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistoryLiquidityAssetsUsdArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistoryNetBorrowApyArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistoryNetSupplyApyArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistoryRateAtUTargetArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistorySupplyApyArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistorySupplyAssetsArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistorySupplyAssetsUsdArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistorySupplySharesArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market state history */
export type MarketHistoryUtilizationArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Market liquidation transaction data */
export type MarketLiquidationTransactionData = {
  __typename?: "MarketLiquidationTransactionData"
  badDebtAssets: Scalars["BigInt"]["output"]
  badDebtAssetsUsd?: Maybe<Scalars["Float"]["output"]>
  badDebtShares: Scalars["BigInt"]["output"]
  liquidator: Scalars["Address"]["output"]
  market: Market
  repaidAssets: Scalars["BigInt"]["output"]
  repaidAssetsUsd?: Maybe<Scalars["Float"]["output"]>
  repaidShares: Scalars["BigInt"]["output"]
  seizedAssets: Scalars["BigInt"]["output"]
  seizedAssetsUsd?: Maybe<Scalars["Float"]["output"]>
}

/** Market oracle accuracy versus spot price */
export type MarketOracleAccuracy = {
  __typename?: "MarketOracleAccuracy"
  /** Average oracle/spot prices deviation */
  averagePercentDifference?: Maybe<Scalars["Float"]["output"]>
  market: Market
  /** Maximum oracle/spot prices deviation */
  maxPercentDifference?: Maybe<Scalars["Float"]["output"]>
}

/** Market oracle feeds */
export type MarketOracleFeed = {
  __typename?: "MarketOracleFeed"
  baseFeedOneAddress: Scalars["Address"]["output"]
  baseFeedOneDescription?: Maybe<Scalars["String"]["output"]>
  baseFeedOneVendor?: Maybe<Scalars["String"]["output"]>
  baseFeedTwoAddress: Scalars["Address"]["output"]
  baseFeedTwoDescription?: Maybe<Scalars["String"]["output"]>
  baseFeedTwoVendor?: Maybe<Scalars["String"]["output"]>
  baseVault?: Maybe<Scalars["Address"]["output"]>
  baseVaultConversionSample?: Maybe<Scalars["BigInt"]["output"]>
  quoteFeedOneAddress: Scalars["Address"]["output"]
  quoteFeedOneDescription?: Maybe<Scalars["String"]["output"]>
  quoteFeedOneVendor?: Maybe<Scalars["String"]["output"]>
  quoteFeedTwoAddress: Scalars["Address"]["output"]
  quoteFeedTwoDescription?: Maybe<Scalars["String"]["output"]>
  quoteFeedTwoVendor?: Maybe<Scalars["String"]["output"]>
  quoteVault?: Maybe<Scalars["Address"]["output"]>
  quoteVaultConversionSample?: Maybe<Scalars["BigInt"]["output"]>
  scaleFactor?: Maybe<Scalars["BigInt"]["output"]>
}

/** Market oracle information */
export type MarketOracleInfo = {
  __typename?: "MarketOracleInfo"
  type: OracleType
}

export enum MarketOrderBy {
  BorrowApy = "BorrowApy",
  BorrowAssets = "BorrowAssets",
  BorrowAssetsUsd = "BorrowAssetsUsd",
  BorrowShares = "BorrowShares",
  Fee = "Fee",
  Lltv = "Lltv",
  NetBorrowApy = "NetBorrowApy",
  NetSupplyApy = "NetSupplyApy",
  RateAtUTarget = "RateAtUTarget",
  SupplyApy = "SupplyApy",
  SupplyAssets = "SupplyAssets",
  SupplyAssetsUsd = "SupplyAssetsUsd",
  SupplyShares = "SupplyShares",
  UniqueKey = "UniqueKey",
  Utilization = "Utilization",
}

/** Market position */
export type MarketPosition = {
  __typename?: "MarketPosition"
  /** Amount of loan asset borrowed, in underlying token units. */
  borrowAssets: Scalars["BigInt"]["output"]
  /** Amount of loan asset borrowed, in USD for display purpose. */
  borrowAssetsUsd?: Maybe<Scalars["Float"]["output"]>
  /** Amount of loan asset borrowed, in market shares. */
  borrowShares: Scalars["BigInt"]["output"]
  /** Amount of collateral asset deposited on the market, in underlying token units. */
  collateral: Scalars["BigInt"]["output"]
  /** Amount of collateral asset deposited on the market, in USD for display purpose. */
  collateralUsd?: Maybe<Scalars["Float"]["output"]>
  /** Health factor of the position, computed as collateral value divided by borrow value. */
  healthFactor?: Maybe<Scalars["Float"]["output"]>
  id: Scalars["ID"]["output"]
  market: Market
  /** Amount of loan asset supplied, in underlying token units. */
  supplyAssets: Scalars["BigInt"]["output"]
  /** Amount of loan asset supplied, in USD for display purpose. */
  supplyAssetsUsd?: Maybe<Scalars["Float"]["output"]>
  /** Amount of loan asset supplied, in market shares. */
  supplyShares: Scalars["BigInt"]["output"]
  user: User
}

/** Filtering options for market positions. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export type MarketPositionFilters = {
  /** Filter by greater than or equal to given borrow shares */
  borrowShares_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given borrow shares */
  borrowShares_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars["Int"]["input"]>>
  /** Filter by greater than or equal to given collateral amount, in underlying token units. */
  collateral_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given collateral amount, in underlying token units. */
  collateral_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by greater than or equal to given health factor */
  healthFactor_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given health factor */
  healthFactor_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by market id */
  marketId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by market unique key */
  marketUniqueKey_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  search?: InputMaybe<Scalars["String"]["input"]>
  /** Filter by greater than or equal to given supply shares */
  supplyShares_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given supply shares */
  supplyShares_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by user address. Case insensitive. */
  userAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by user id */
  userId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
}

export enum MarketPositionOrderBy {
  BorrowShares = "BorrowShares",
  Collateral = "Collateral",
  HealthFactor = "HealthFactor",
  SupplyShares = "SupplyShares",
}

/** Morpho Blue market state */
export type MarketState = {
  __typename?: "MarketState"
  /** Borrow APY */
  borrowApy: Scalars["Float"]["output"]
  /** Amount borrowed on the market, in underlying units. Amount increases as interests accrue. */
  borrowAssets: Scalars["BigInt"]["output"]
  /** Amount borrowed on the market, in USD for display purpose */
  borrowAssetsUsd?: Maybe<Scalars["Float"]["output"]>
  /** Amount borrowed on the market, in market share units. Amount does not increase as interest accrue. */
  borrowShares: Scalars["BigInt"]["output"]
  /** Amount of collateral in the market, in underlying units */
  collateralAssets?: Maybe<Scalars["BigInt"]["output"]>
  /** Amount of collateral in the market, in USD for display purpose */
  collateralAssetsUsd?: Maybe<Scalars["Float"]["output"]>
  /** Fee rate */
  fee: Scalars["Float"]["output"]
  id: Scalars["ID"]["output"]
  /** Amount available to borrow on the market, in underlying units */
  liquidityAssets: Scalars["BigInt"]["output"]
  /** Amount available to borrow on the market, in USD for display purpose */
  liquidityAssetsUsd?: Maybe<Scalars["Float"]["output"]>
  /** Borrow APY including rewards */
  netBorrowApy?: Maybe<Scalars["Float"]["output"]>
  /** Supply APY including rewards */
  netSupplyApy?: Maybe<Scalars["Float"]["output"]>
  /** Borrow rate at target utilization */
  rateAtUTarget: Scalars["Float"]["output"]
  /** Market state rewards */
  rewards?: Maybe<Array<MarketStateReward>>
  /** Supply APY */
  supplyApy: Scalars["Float"]["output"]
  /** Amount supplied on the market, in underlying units. Amount increases as interests accrue. */
  supplyAssets: Scalars["BigInt"]["output"]
  /** Amount supplied on the market, in USD for display purpose */
  supplyAssetsUsd?: Maybe<Scalars["Float"]["output"]>
  /** Amount supplied on the market, in market share units. Amount does not increase as interest accrue. */
  supplyShares: Scalars["BigInt"]["output"]
  /** Last update timestamp. */
  timestamp: Scalars["BigInt"]["output"]
  /** Utilization rate */
  utilization: Scalars["Float"]["output"]
}

/** Morpho Blue market state rewards */
export type MarketStateReward = {
  __typename?: "MarketStateReward"
  asset: Asset
  /** Borrow rewards APY. */
  borrowApy?: Maybe<Scalars["Float"]["output"]>
  /** Supply rewards APY. */
  supplyApy?: Maybe<Scalars["Float"]["output"]>
  /** Amount of reward tokens per year on the borrow side. Scaled to reward asset decimals. */
  yearlyBorrowTokens: Scalars["BigInt"]["output"]
  /** Amount of reward tokens per year on the supply side. Scaled to reward asset decimals. */
  yearlySupplyTokens: Scalars["BigInt"]["output"]
}

/** Market transfer transaction data */
export type MarketTransferTransactionData = {
  __typename?: "MarketTransferTransactionData"
  assets: Scalars["BigInt"]["output"]
  assetsUsd?: Maybe<Scalars["Float"]["output"]>
  market: Market
  shares: Scalars["BigInt"]["output"]
}

/** Market warning */
export type MarketWarning = {
  __typename?: "MarketWarning"
  level: WarningLevel
  type: Scalars["String"]["output"]
}

/** Morpho Blue deployment */
export type MorphoBlue = {
  __typename?: "MorphoBlue"
  address: Scalars["Address"]["output"]
  chain: Chain
  creationBlockNumber: Scalars["Int"]["output"]
  /** State history */
  historicalState?: Maybe<MorphoBlueStateHistory>
  id: Scalars["ID"]["output"]
  /** Current state */
  state?: Maybe<MorphoBlueState>
}

/** Filtering options for morpho blue deployments. */
export type MorphoBlueFilters = {
  /** Filter by deployment address. Case insensitive. */
  address_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars["Int"]["input"]>>
  /** Filter by morpho blue id */
  id_in?: InputMaybe<Array<Scalars["String"]["input"]>>
}

export enum MorphoBlueOrderBy {
  Address = "Address",
}

/** Morpho Blue global state */
export type MorphoBlueState = {
  __typename?: "MorphoBlueState"
  id: Scalars["ID"]["output"]
  /** Number of markets in the protocol */
  marketCount: Scalars["Int"]["output"]
  /** Last update timestamp. */
  timestamp: Scalars["BigInt"]["output"]
  /** Amount borrowed in all markets, in USD for display purpose */
  totalBorrowUsd: Scalars["Float"]["output"]
  /** Amount of collateral in all markets, in USD for display purpose */
  totalCollateralUsd: Scalars["Float"]["output"]
  /** Amount deposited in all markets, in USD for display purpose */
  totalDepositUsd: Scalars["Float"]["output"]
  /** Amount supplied in all markets, in USD for display purpose */
  totalSupplyUsd: Scalars["Float"]["output"]
  /** TVL (collateral + supply - borrows), in USD for display purpose */
  tvlUsd: Scalars["Float"]["output"]
  /** Number of unique users that have interacted with the protocol */
  userCount: Scalars["Int"]["output"]
  /** Number of meta morpho vaults in the protocol */
  vaultCount: Scalars["Int"]["output"]
}

/** Morpho Blue state history */
export type MorphoBlueStateHistory = {
  __typename?: "MorphoBlueStateHistory"
  /** Number of markets in the protocol */
  marketCount?: Maybe<Array<IntDataPoint>>
  /** Amount borrowed in all markets, in USD for display purpose */
  totalBorrowUsd?: Maybe<Array<FloatDataPoint>>
  /** Amount of collateral in all markets, in USD for display purpose. */
  totalCollateralUsd?: Maybe<Array<FloatDataPoint>>
  /** Amount deposited in all markets, in USD for display purpose */
  totalDepositUsd?: Maybe<Array<FloatDataPoint>>
  /** Amount supplied in all markets, in USD for display purpose */
  totalSupplyUsd?: Maybe<Array<FloatDataPoint>>
  /** TVL (collateral + supply - borrows), in USD for display purpose */
  tvlUsd?: Maybe<Array<FloatDataPoint>>
  /** Number of unique users that have interacted with the protocol */
  userCount?: Maybe<Array<IntDataPoint>>
  /** Number of meta morpho vaults in the protocol */
  vaultCount?: Maybe<Array<IntDataPoint>>
}

/** Morpho Blue state history */
export type MorphoBlueStateHistoryMarketCountArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Morpho Blue state history */
export type MorphoBlueStateHistoryTotalBorrowUsdArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Morpho Blue state history */
export type MorphoBlueStateHistoryTotalCollateralUsdArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Morpho Blue state history */
export type MorphoBlueStateHistoryTotalDepositUsdArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Morpho Blue state history */
export type MorphoBlueStateHistoryTotalSupplyUsdArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Morpho Blue state history */
export type MorphoBlueStateHistoryTvlUsdArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Morpho Blue state history */
export type MorphoBlueStateHistoryUserCountArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Morpho Blue state history */
export type MorphoBlueStateHistoryVaultCountArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

export enum OracleType {
  ChainlinkOracle = "ChainlinkOracle",
  ChainlinkOracleV2 = "ChainlinkOracleV2",
  CustomOracle = "CustomOracle",
  Unknown = "Unknown",
}

export enum OrderDirection {
  Asc = "Asc",
  Desc = "Desc",
}

export type PageInfo = {
  __typename?: "PageInfo"
  /** Number of items as scoped by pagination. */
  count: Scalars["Int"]["output"]
  /** Total number of items */
  countTotal: Scalars["Int"]["output"]
  /** Number of items requested. */
  limit: Scalars["Int"]["output"]
  /** Number of items skipped. */
  skip: Scalars["Int"]["output"]
}

export type PaginatedAssets = {
  __typename?: "PaginatedAssets"
  items?: Maybe<Array<Asset>>
  pageInfo?: Maybe<PageInfo>
}

export type PaginatedMarketPositions = {
  __typename?: "PaginatedMarketPositions"
  items?: Maybe<Array<MarketPosition>>
  pageInfo?: Maybe<PageInfo>
}

export type PaginatedMarkets = {
  __typename?: "PaginatedMarkets"
  items?: Maybe<Array<Market>>
  pageInfo?: Maybe<PageInfo>
}

export type PaginatedMetaMorphoPositions = {
  __typename?: "PaginatedMetaMorphoPositions"
  items?: Maybe<Array<VaultPosition>>
  pageInfo?: Maybe<PageInfo>
}

export type PaginatedMetaMorphos = {
  __typename?: "PaginatedMetaMorphos"
  items?: Maybe<Array<Vault>>
  pageInfo?: Maybe<PageInfo>
}

export type PaginatedMorphoBlue = {
  __typename?: "PaginatedMorphoBlue"
  items?: Maybe<Array<MorphoBlue>>
  pageInfo?: Maybe<PageInfo>
}

export type PaginatedPublicAllocator = {
  __typename?: "PaginatedPublicAllocator"
  items?: Maybe<Array<PublicAllocator>>
  pageInfo?: Maybe<PageInfo>
}

export type PaginatedPublicAllocatorReallocates = {
  __typename?: "PaginatedPublicAllocatorReallocates"
  items?: Maybe<Array<PublicAllocatorReallocate>>
  pageInfo?: Maybe<PageInfo>
}

export type PaginatedTransactions = {
  __typename?: "PaginatedTransactions"
  items?: Maybe<Array<Transaction>>
  pageInfo?: Maybe<PageInfo>
}

export type PaginatedUsers = {
  __typename?: "PaginatedUsers"
  items?: Maybe<Array<User>>
  pageInfo?: Maybe<PageInfo>
}

export type PaginatedVaultReallocates = {
  __typename?: "PaginatedVaultReallocates"
  items?: Maybe<Array<VaultReallocate>>
  pageInfo?: Maybe<PageInfo>
}

/** Public allocator */
export type PublicAllocator = {
  __typename?: "PublicAllocator"
  address: Scalars["Address"]["output"]
  creationBlockNumber: Scalars["Int"]["output"]
  id: Scalars["ID"]["output"]
  morphoBlue: MorphoBlue
}

/** Public allocator configuration */
export type PublicAllocatorConfig = {
  __typename?: "PublicAllocatorConfig"
  fee: Scalars["BigInt"]["output"]
  flowCaps: Array<PublicAllocatorFlowCaps>
}

/** Filtering options for public allocators. */
export type PublicAllocatorFilters = {
  /** Filter by address. Case insensitive. */
  address_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars["Int"]["input"]>>
  /** Filter by ids */
  id_in?: InputMaybe<Array<Scalars["String"]["input"]>>
}

/** Public allocator flow caps */
export type PublicAllocatorFlowCaps = {
  __typename?: "PublicAllocatorFlowCaps"
  market: Market
  /** Public allocator flow cap in USD */
  maxIn: Scalars["BigInt"]["output"]
  /** Public allocator flow cap in underlying */
  maxOut: Scalars["BigInt"]["output"]
}

export enum PublicAllocatorOrderBy {
  Address = "Address",
}

/** Public alllocator reallocate */
export type PublicAllocatorReallocate = {
  __typename?: "PublicAllocatorReallocate"
  assets: Scalars["BigInt"]["output"]
  blockNumber: Scalars["BigInt"]["output"]
  hash: Scalars["HexString"]["output"]
  id: Scalars["ID"]["output"]
  logIndex: Scalars["Int"]["output"]
  market: Market
  publicAllocator: PublicAllocator
  sender: Scalars["Address"]["output"]
  timestamp: Scalars["BigInt"]["output"]
  type: PublicAllocatorReallocateType
  vault: Vault
}

export enum PublicAllocatorReallocateOrderBy {
  Assets = "Assets",
  Timestamp = "Timestamp",
}

export enum PublicAllocatorReallocateType {
  Deposit = "Deposit",
  Withdraw = "Withdraw",
}

/** Filtering options for public allocator reallocates. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export type PublicallocatorReallocateFilters = {
  /** Filter by greater than or equal to given amount of market assets, in underlying token units */
  assets_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of market assets, in underlying token units */
  assets_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by market id */
  marketId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by market unique key */
  marketUniqueKey_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given timestamp */
  timestamp_gte?: InputMaybe<Scalars["Int"]["input"]>
  /** Filter by lower than or equal to given timestamp */
  timestamp_lte?: InputMaybe<Scalars["Int"]["input"]>
  /** Filter by reallocate type */
  type_in?: InputMaybe<Array<PublicAllocatorReallocateType>>
  /** Filter by MetaMorpho vault address */
  vaultAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by MetaMorpho vault id */
  vaultId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
}

export type Query = {
  __typename?: "Query"
  asset: Asset
  assetByAddress: Asset
  assets: PaginatedAssets
  chain: Chain
  chainSynchronizationState: ChainSynchronizationState
  chainSynchronizationStates: Array<ChainSynchronizationState>
  chains: Array<Chain>
  market: Market
  marketAverageApys?: Maybe<MarketApyAggregates>
  marketByUniqueKey: Market
  marketCollateralAtRisk: MarketCollateralAtRisk
  marketOracleAccuracy: MarketOracleAccuracy
  marketPosition: MarketPosition
  marketPositions: PaginatedMarketPositions
  markets: PaginatedMarkets
  morphoBlue: MorphoBlue
  morphoBlueByAddress: MorphoBlue
  morphoBlues: PaginatedMorphoBlue
  publicAllocator: PublicAllocator
  publicAllocatorReallocates: PaginatedPublicAllocatorReallocates
  publicAllocators: PaginatedPublicAllocator
  search: SearchResults
  transaction: Transaction
  transactionByHash: Transaction
  transactions: PaginatedTransactions
  user: User
  userByAddress: User
  users: PaginatedUsers
  vault: Vault
  vaultByAddress: Vault
  vaultPosition: VaultPosition
  vaultPositions: PaginatedMetaMorphoPositions
  vaultReallocates: PaginatedVaultReallocates
  vaults: PaginatedMetaMorphos
}

export type QueryAssetArgs = {
  id: Scalars["String"]["input"]
}

export type QueryAssetByAddressArgs = {
  address: Scalars["String"]["input"]
  chainId?: InputMaybe<Scalars["Int"]["input"]>
}

export type QueryAssetsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>
  skip?: InputMaybe<Scalars["Int"]["input"]>
  where?: InputMaybe<AssetsFilters>
}

export type QueryChainArgs = {
  id: Scalars["Int"]["input"]
}

export type QueryChainSynchronizationStateArgs = {
  chainId?: Scalars["Int"]["input"]
  key: Scalars["String"]["input"]
}

export type QueryMarketArgs = {
  id: Scalars["String"]["input"]
}

export type QueryMarketAverageApysArgs = {
  chainId?: InputMaybe<Scalars["Int"]["input"]>
  startTimestamp: Scalars["Float"]["input"]
  uniqueKey: Scalars["String"]["input"]
}

export type QueryMarketByUniqueKeyArgs = {
  chainId?: InputMaybe<Scalars["Int"]["input"]>
  uniqueKey: Scalars["String"]["input"]
}

export type QueryMarketCollateralAtRiskArgs = {
  chainId?: InputMaybe<Scalars["Int"]["input"]>
  numberOfPoints?: InputMaybe<Scalars["Float"]["input"]>
  uniqueKey: Scalars["String"]["input"]
}

export type QueryMarketOracleAccuracyArgs = {
  marketId: Scalars["String"]["input"]
  options?: InputMaybe<TimeseriesOptions>
}

export type QueryMarketPositionArgs = {
  chainId?: InputMaybe<Scalars["Int"]["input"]>
  marketUniqueKey: Scalars["String"]["input"]
  userAddress: Scalars["String"]["input"]
}

export type QueryMarketPositionsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>
  orderBy?: InputMaybe<MarketPositionOrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars["Int"]["input"]>
  where?: InputMaybe<MarketPositionFilters>
}

export type QueryMarketsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>
  orderBy?: InputMaybe<MarketOrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars["Int"]["input"]>
  where?: InputMaybe<MarketFilters>
}

export type QueryMorphoBlueArgs = {
  id: Scalars["String"]["input"]
}

export type QueryMorphoBlueByAddressArgs = {
  address: Scalars["String"]["input"]
  chainId?: InputMaybe<Scalars["Int"]["input"]>
}

export type QueryMorphoBluesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>
  orderBy?: InputMaybe<MorphoBlueOrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars["Int"]["input"]>
  where?: InputMaybe<MorphoBlueFilters>
}

export type QueryPublicAllocatorArgs = {
  address: Scalars["String"]["input"]
  chainId?: InputMaybe<Scalars["Int"]["input"]>
}

export type QueryPublicAllocatorReallocatesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>
  orderBy?: InputMaybe<PublicAllocatorReallocateOrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars["Int"]["input"]>
  where?: InputMaybe<PublicallocatorReallocateFilters>
}

export type QueryPublicAllocatorsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>
  orderBy?: InputMaybe<PublicAllocatorOrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars["Int"]["input"]>
  where?: InputMaybe<PublicAllocatorFilters>
}

export type QuerySearchArgs = {
  marketOrderBy?: InputMaybe<MarketOrderBy>
  numberOfResults?: InputMaybe<Scalars["Int"]["input"]>
  search: Scalars["String"]["input"]
  vaultOrderBy?: InputMaybe<VaultOrderBy>
}

export type QueryTransactionArgs = {
  id: Scalars["String"]["input"]
}

export type QueryTransactionByHashArgs = {
  chainId?: InputMaybe<Scalars["Int"]["input"]>
  hash: Scalars["String"]["input"]
}

export type QueryTransactionsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>
  orderBy?: InputMaybe<TransactionsOrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars["Int"]["input"]>
  where?: InputMaybe<TransactionFilters>
}

export type QueryUserArgs = {
  id: Scalars["String"]["input"]
}

export type QueryUserByAddressArgs = {
  address: Scalars["String"]["input"]
  chainId?: InputMaybe<Scalars["Int"]["input"]>
}

export type QueryUsersArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>
  orderBy?: InputMaybe<UsersOrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars["Int"]["input"]>
  where?: InputMaybe<UsersFilters>
}

export type QueryVaultArgs = {
  id: Scalars["String"]["input"]
}

export type QueryVaultByAddressArgs = {
  address: Scalars["String"]["input"]
  chainId?: InputMaybe<Scalars["Int"]["input"]>
}

export type QueryVaultPositionArgs = {
  chainId?: InputMaybe<Scalars["Int"]["input"]>
  userAddress: Scalars["String"]["input"]
  vaultAddress: Scalars["String"]["input"]
}

export type QueryVaultPositionsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>
  orderBy?: InputMaybe<VaultPositionOrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars["Int"]["input"]>
  where?: InputMaybe<VaultPositionFilters>
}

export type QueryVaultReallocatesArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>
  orderBy?: InputMaybe<VaultReallocateOrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars["Int"]["input"]>
  where?: InputMaybe<VaultReallocateFilters>
}

export type QueryVaultsArgs = {
  first?: InputMaybe<Scalars["Int"]["input"]>
  orderBy?: InputMaybe<VaultOrderBy>
  orderDirection?: InputMaybe<OrderDirection>
  skip?: InputMaybe<Scalars["Int"]["input"]>
  where?: InputMaybe<VaultFilters>
}

/** Global search results */
export type SearchResults = {
  __typename?: "SearchResults"
  markets: Array<Market>
  vaults: Array<Vault>
}

export enum TimeseriesInterval {
  All = "ALL",
  Day = "DAY",
  FifteenMinutes = "FIFTEEN_MINUTES",
  FiveMinutes = "FIVE_MINUTES",
  HalfHour = "HALF_HOUR",
  Hour = "HOUR",
  Minute = "MINUTE",
  Month = "MONTH",
  Quarter = "QUARTER",
  Week = "WEEK",
  Year = "YEAR",
}

export type TimeseriesOptions = {
  /** Unix timestamp (Inclusive) */
  endTimestamp?: InputMaybe<Scalars["Int"]["input"]>
  interval?: InputMaybe<TimeseriesInterval>
  /** Unix timestamp (Inclusive) */
  startTimestamp?: InputMaybe<Scalars["Int"]["input"]>
}

/** Transaction */
export type Transaction = {
  __typename?: "Transaction"
  blockNumber: Scalars["BigInt"]["output"]
  chain: Chain
  data: TransactionData
  hash: Scalars["HexString"]["output"]
  id: Scalars["ID"]["output"]
  logIndex: Scalars["Int"]["output"]
  timestamp: Scalars["BigInt"]["output"]
  type: TransactionType
  user: User
}

export type TransactionData =
  | MarketCollateralTransferTransactionData
  | MarketLiquidationTransactionData
  | MarketTransferTransactionData
  | VaultTransactionData

/** Filtering options for transactions. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export type TransactionFilters = {
  /** Filter by token contract address. Case insensitive. */
  assetAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by asset id */
  assetId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by token symbol. */
  assetSymbol_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given amount of market assets, in USD */
  assetsUsd_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given amount of market assets, in USD */
  assetsUsd_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by greater than or equal to given amount of market assets, in underlying token units */
  assets_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of market assets, in underlying token units */
  assets_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by greater than or equal to given amount of bad debt assets, in USD. Applies exclusively to MarketLiquidation transactions. */
  badDebtAssetsUsd_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given amount of bad debt assets, in USD. Applies exclusively to MarketLiquidation transactions. */
  badDebtAssetsUsd_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by greater than or equal to given amount of bad debt assets. Applies exclusively to MarketLiquidation transactions. */
  badDebtAssets_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of bad debt assets. Applies exclusively to MarketLiquidation transactions. */
  badDebtAssets_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by greater than or equal to given amount of bad debt shares. Applies exclusively to MarketLiquidation transactions. */
  badDebtShares_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of bad debt shares. Applies exclusively to MarketLiquidation transactions. */
  badDebtShares_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars["Int"]["input"]>>
  /** Filter by transaction hash */
  hash?: InputMaybe<Scalars["String"]["input"]>
  /** Filter by liquidator address. Applies exclusively to MarketLiquidation transactions. */
  liquidator_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by market id */
  marketId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by market unique key */
  marketUniqueKey_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given amount of repaid shares, in USD. Applies exclusively to MarketLiquidation transactions. */
  repaidAssetsUsd_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given amount of repaid shares, in USD. Applies exclusively to MarketLiquidation transactions. */
  repaidAssetsUsd_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by greater than or equal to given amount of repaid shares. Applies exclusively to MarketLiquidation transactions. */
  repaidAssets_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of repaid shares. Applies exclusively to MarketLiquidation transactions. */
  repaidAssets_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by greater than or equal to given amount of repaid shares. Applies exclusively to MarketLiquidation transactions. */
  repaidShares_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of repaid shares. Applies exclusively to MarketLiquidation transactions. */
  repaidShares_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  search?: InputMaybe<Scalars["String"]["input"]>
  /** Filter by greater than or equal to given amount of seized shares, in USD. Applies exclusively to MarketLiquidation transactions. */
  seizedAssetsUsd_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given amount of seized shares, in USD. Applies exclusively to MarketLiquidation transactions. */
  seizedAssetsUsd_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by greater than or equal to given amount of seized shares. Applies exclusively to MarketLiquidation transactions. */
  seizedAssets_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of seized shares. Applies exclusively to MarketLiquidation transactions. */
  seizedAssets_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by greater than or equal to given amount of MetaMorpho vault shares */
  shares_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of MetaMorpho vault shares */
  shares_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by greater than or equal to given timestamp */
  timestamp_gte?: InputMaybe<Scalars["Int"]["input"]>
  /** Filter by lower than or equal to given timestamp */
  timestamp_lte?: InputMaybe<Scalars["Int"]["input"]>
  /** Filter by transaction type */
  type_in?: InputMaybe<Array<TransactionType>>
  /** Filter by user address. Case insensitive. */
  userAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by user id */
  userId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by MetaMorpho vault address */
  vaultAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by MetaMorpho vault id */
  vaultId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
}

export enum TransactionType {
  MarketBorrow = "MarketBorrow",
  MarketLiquidation = "MarketLiquidation",
  MarketRepay = "MarketRepay",
  MarketSupply = "MarketSupply",
  MarketSupplyCollateral = "MarketSupplyCollateral",
  MarketWithdraw = "MarketWithdraw",
  MarketWithdrawCollateral = "MarketWithdrawCollateral",
  MetaMorphoDeposit = "MetaMorphoDeposit",
  MetaMorphoFee = "MetaMorphoFee",
  MetaMorphoWithdraw = "MetaMorphoWithdraw",
}

export enum TransactionsOrderBy {
  Assets = "Assets",
  AssetsUsd = "AssetsUsd",
  BadDebtAssets = "BadDebtAssets",
  BadDebtAssetsUsd = "BadDebtAssetsUsd",
  BadDebtShares = "BadDebtShares",
  RepaidAssets = "RepaidAssets",
  RepaidAssetsUsd = "RepaidAssetsUsd",
  RepaidShares = "RepaidShares",
  SeizedAssets = "SeizedAssets",
  SeizedAssetsUsd = "SeizedAssetsUsd",
  Shares = "Shares",
  Timestamp = "Timestamp",
}

/** User */
export type User = {
  __typename?: "User"
  address: Scalars["Address"]["output"]
  chain: Chain
  id: Scalars["ID"]["output"]
  marketPositions: Array<MarketPosition>
  tag?: Maybe<Scalars["String"]["output"]>
  transactions: Array<Transaction>
  vaultPositions: Array<VaultPosition>
}

/** Filtering options for users. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export type UsersFilters = {
  /** Filter by user address. Case insensitive. */
  address_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by token contract address. Case insensitive. */
  assetAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by asset id */
  assetId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by token symbol */
  assetSymbol_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars["Int"]["input"]>>
  /** Filter by user id */
  id_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by market id */
  marketId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by market unique key */
  marketUniqueKey_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  search?: InputMaybe<Scalars["String"]["input"]>
  /** Filter by MetaMorpho vault address. Case insensitive. */
  vaultAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by MetaMorpho vault id. */
  vaultId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
}

export enum UsersOrderBy {
  Address = "Address",
}

/** MetaMorpho Vaults */
export type Vault = {
  __typename?: "Vault"
  address: Scalars["Address"]["output"]
  asset: Asset
  chain: Chain
  creationBlockNumber: Scalars["Int"]["output"]
  creationTimestamp?: Maybe<Scalars["BigInt"]["output"]>
  creatorAddress?: Maybe<Scalars["Address"]["output"]>
  /**
   * Daily vault APY
   * @deprecated Use dailyApys instead.
   */
  dailyApy?: Maybe<Scalars["Float"]["output"]>
  /** Daily vault APYs */
  dailyApys?: Maybe<VaultApyAggregates>
  historicalState: VaultHistory
  id: Scalars["ID"]["output"]
  /** Vault liquidity */
  liquidity?: Maybe<VaultLiquidity>
  /**
   * Monthly vault APY
   * @deprecated Use monthlyApys instead.
   */
  monthlyApy?: Maybe<Scalars["Float"]["output"]>
  /** Monthly vault APYs */
  monthlyApys?: Maybe<VaultApyAggregates>
  name: Scalars["String"]["output"]
  /** Public allocator configuration */
  publicAllocatorConfig?: Maybe<PublicAllocatorConfig>
  state?: Maybe<VaultState>
  symbol: Scalars["String"]["output"]
  /** Vault warnings */
  warnings?: Maybe<Array<VaultWarning>>
  /**
   * Weekly vault APY
   * @deprecated Use weeklyApys instead.
   */
  weeklyApy?: Maybe<Scalars["Float"]["output"]>
  /** Weekly vault APYs */
  weeklyApys?: Maybe<VaultApyAggregates>
}

/** MetaMorpho vault allocation */
export type VaultAllocation = {
  __typename?: "VaultAllocation"
  enabled: Scalars["Boolean"]["output"]
  id: Scalars["ID"]["output"]
  market: Market
  /** Pending maximum amount of asset that can be supplied on market by the vault, in market underlying token units */
  pendingSupplyCap?: Maybe<Scalars["BigInt"]["output"]>
  /** Pending maximum amount of asset that can be supplied on market by the vault, in USD for display purpose. */
  pendingSupplyCapUsd?: Maybe<Scalars["Float"]["output"]>
  /** Pending supply cap apply timestamp */
  pendingSupplyCapValidAt?: Maybe<Scalars["BigInt"]["output"]>
  removableAt: Scalars["BigInt"]["output"]
  /** Amount of asset supplied on market, in market underlying token units */
  supplyAssets: Scalars["BigInt"]["output"]
  /** Amount of asset supplied on market, in USD for display purpose. */
  supplyAssetsUsd?: Maybe<Scalars["Float"]["output"]>
  /** Maximum amount of asset that can be supplied on market by the vault, in market underlying token units */
  supplyCap: Scalars["BigInt"]["output"]
  /** Maximum amount of asset that can be supplied on market by the vault, in USD for display purpose. */
  supplyCapUsd?: Maybe<Scalars["Float"]["output"]>
  /** Supply queue index */
  supplyQueueIndex?: Maybe<Scalars["Int"]["output"]>
  /** Amount of supplied shares on market. */
  supplyShares: Scalars["BigInt"]["output"]
  /** Withdraw queue index */
  withdrawQueueIndex?: Maybe<Scalars["Int"]["output"]>
}

/** MetaMorpho vault allocation history */
export type VaultAllocationHistory = {
  __typename?: "VaultAllocationHistory"
  market: Market
  /** Amount of asset supplied on market, in market underlying token units */
  supplyAssets: Array<BigIntDataPoint>
  /** Amount of asset supplied on market, in USD for display purpose. */
  supplyAssetsUsd?: Maybe<Array<FloatDataPoint>>
  /** Maximum amount of asset that can be supplied on market by the vault, in market underlying token units */
  supplyCap: Array<BigIntDataPoint>
  /** Maximum amount of asset that can be supplied on market by the vault, in USD for display purpose. */
  supplyCapUsd?: Maybe<Array<FloatDataPoint>>
}

/** MetaMorpho vault allocation history */
export type VaultAllocationHistorySupplyAssetsArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** MetaMorpho vault allocation history */
export type VaultAllocationHistorySupplyAssetsUsdArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** MetaMorpho vault allocation history */
export type VaultAllocationHistorySupplyCapArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** MetaMorpho vault allocation history */
export type VaultAllocationHistorySupplyCapUsdArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Vault APY aggregates */
export type VaultApyAggregates = {
  __typename?: "VaultApyAggregates"
  /** Average vault apy */
  apy?: Maybe<Scalars["Float"]["output"]>
  /** Average vault APY including rewards */
  netApy?: Maybe<Scalars["Float"]["output"]>
}

export type VaultFilters = {
  /** Filter by MetaMorpho vault address */
  address_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given APY. */
  apy_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given APY. */
  apy_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by asset contract address */
  assetAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by asset id */
  assetId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by asset symbol */
  assetSymbol_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars["Int"]["input"]>>
  /** Filter by MetaMorpho creator address */
  creatorAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given fee rate. */
  fee_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given fee rate. */
  fee_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by MetaMorpho vault id */
  id_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by markets in which the vault has positions. */
  marketUniqueKey_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given net APY. */
  netApy_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given net APY. */
  netApy_lte?: InputMaybe<Scalars["Float"]["input"]>
  search?: InputMaybe<Scalars["String"]["input"]>
  /** Filter by MetaMorpho vault symbol */
  symbol_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given amount of total assets, in USD. */
  totalAssetsUsd_gte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by lower than or equal to given amount of total assets, in USD. */
  totalAssetsUsd_lte?: InputMaybe<Scalars["Float"]["input"]>
  /** Filter by greater than or equal to given amount of total assets, in underlying token units. */
  totalAssets_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of total assets, in underlying token units. */
  totalAssets_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by greater than or equal to given amount of shares total supply. */
  totalSupply_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of shares total supply. */
  totalSupply_lte?: InputMaybe<Scalars["BigInt"]["input"]>
}

/** Meta-Morpho vault history */
export type VaultHistory = {
  __typename?: "VaultHistory"
  /** Vault allocation on Morpho Blue markets. */
  allocation?: Maybe<Array<VaultAllocationHistory>>
  /** Vault APY. */
  apy?: Maybe<Array<FloatDataPoint>>
  /** Vault curator. */
  curator?: Maybe<Array<AddressDataPoint>>
  /** Vault performance fee. */
  fee?: Maybe<Array<FloatDataPoint>>
  /** Fee recipient. */
  feeRecipient?: Maybe<Array<AddressDataPoint>>
  /** Guardian. */
  guardian?: Maybe<Array<AddressDataPoint>>
  /** Vault APY including rewards. */
  netApy?: Maybe<Array<FloatDataPoint>>
  /** Owner. */
  owner?: Maybe<Array<AddressDataPoint>>
  /** Skim recipient. */
  skimRecipient?: Maybe<Array<AddressDataPoint>>
  /** Total value of vault holdings, in underlying token units. */
  totalAssets?: Maybe<Array<BigIntDataPoint>>
  /** Total value of vault holdings, in USD for display purpose. */
  totalAssetsUsd?: Maybe<Array<FloatDataPoint>>
  /** Vault shares total supply. */
  totalSupply?: Maybe<Array<BigIntDataPoint>>
}

/** Meta-Morpho vault history */
export type VaultHistoryApyArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Meta-Morpho vault history */
export type VaultHistoryCuratorArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Meta-Morpho vault history */
export type VaultHistoryFeeArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Meta-Morpho vault history */
export type VaultHistoryFeeRecipientArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Meta-Morpho vault history */
export type VaultHistoryGuardianArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Meta-Morpho vault history */
export type VaultHistoryNetApyArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Meta-Morpho vault history */
export type VaultHistoryOwnerArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Meta-Morpho vault history */
export type VaultHistorySkimRecipientArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Meta-Morpho vault history */
export type VaultHistoryTotalAssetsArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Meta-Morpho vault history */
export type VaultHistoryTotalAssetsUsdArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Meta-Morpho vault history */
export type VaultHistoryTotalSupplyArgs = {
  options?: InputMaybe<TimeseriesOptions>
}

/** Vault Liquidity */
export type VaultLiquidity = {
  __typename?: "VaultLiquidity"
  /** Vault withdrawable liquidity in underlying. */
  underlying: Scalars["BigInt"]["output"]
  /** Vault withdrawable liquidity in USD. */
  usd: Scalars["Float"]["output"]
}

export enum VaultOrderBy {
  Address = "Address",
  Apy = "Apy",
  Fee = "Fee",
  NetApy = "NetApy",
  TotalAssets = "TotalAssets",
  TotalAssetsUsd = "TotalAssetsUsd",
  TotalSupply = "TotalSupply",
}

/** MetaMorpho vault position */
export type VaultPosition = {
  __typename?: "VaultPosition"
  /** Value of vault shares held, in underlying token units. */
  assets: Scalars["BigInt"]["output"]
  /** Value of vault shares held, in USD for display purpose. */
  assetsUsd?: Maybe<Scalars["Float"]["output"]>
  id: Scalars["ID"]["output"]
  /** Amount of vault shares */
  shares: Scalars["BigInt"]["output"]
  user: User
  vault: Vault
}

/** Filtering options for vault positions. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export type VaultPositionFilters = {
  /** Filter by chain id */
  chainId_in?: InputMaybe<Array<Scalars["Int"]["input"]>>
  search?: InputMaybe<Scalars["String"]["input"]>
  /** Filter by greater than or equal to given amount of vault shares. */
  shares_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of vault shares. */
  shares_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by user address */
  userAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by user id */
  userId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by MetaMorpho vault address */
  vaultAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by MetaMorpho vault id */
  vaultId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
}

export enum VaultPositionOrderBy {
  Shares = "Shares",
}

/** Vault reallocate */
export type VaultReallocate = {
  __typename?: "VaultReallocate"
  assets: Scalars["BigInt"]["output"]
  blockNumber: Scalars["BigInt"]["output"]
  caller: Scalars["Address"]["output"]
  hash: Scalars["HexString"]["output"]
  id: Scalars["ID"]["output"]
  logIndex: Scalars["Int"]["output"]
  market: Market
  shares: Scalars["BigInt"]["output"]
  timestamp: Scalars["BigInt"]["output"]
  type: VaultReallocateType
  vault: Vault
}

/** Filtering options for vault reallocates. AND operator is used for multiple filters, while OR operator is used for multiple values in the same filter. */
export type VaultReallocateFilters = {
  /** Filter by greater than or equal to given amount of market assets, in underlying token units */
  assets_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of market assets, in underlying token units */
  assets_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by market id */
  marketId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by market unique key */
  marketUniqueKey_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by greater than or equal to given amount of market shares */
  shares_gte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by lower than or equal to given amount of market shares */
  shares_lte?: InputMaybe<Scalars["BigInt"]["input"]>
  /** Filter by greater than or equal to given timestamp */
  timestamp_gte?: InputMaybe<Scalars["Int"]["input"]>
  /** Filter by lower than or equal to given timestamp */
  timestamp_lte?: InputMaybe<Scalars["Int"]["input"]>
  /** Filter by reallocate type */
  type_in?: InputMaybe<Array<VaultReallocateType>>
  /** Filter by MetaMorpho vault address */
  vaultAddress_in?: InputMaybe<Array<Scalars["String"]["input"]>>
  /** Filter by MetaMorpho vault id */
  vaultId_in?: InputMaybe<Array<Scalars["String"]["input"]>>
}

export enum VaultReallocateOrderBy {
  Assets = "Assets",
  Shares = "Shares",
  Timestamp = "Timestamp",
}

export enum VaultReallocateType {
  ReallocateSupply = "ReallocateSupply",
  ReallocateWithdraw = "ReallocateWithdraw",
}

/** MetaMorpho vault state */
export type VaultState = {
  __typename?: "VaultState"
  /** Vault allocation on Morpho Blue markets. */
  allocation?: Maybe<Array<VaultAllocation>>
  /** Vault APY. */
  apy: Scalars["Float"]["output"]
  /** Vault curator address. */
  curator: Scalars["Address"]["output"]
  /** Vault performance fee. */
  fee: Scalars["Float"]["output"]
  /** Fee recipient address. */
  feeRecipient: Scalars["Address"]["output"]
  /** Guardian address. */
  guardian: Scalars["Address"]["output"]
  id: Scalars["ID"]["output"]
  /** Stores the total assets managed by this vault when the fee was last accrued, in underlying token units. */
  lastTotalAssets: Scalars["BigInt"]["output"]
  /** Vault APY including rewards. */
  netApy?: Maybe<Scalars["Float"]["output"]>
  /** Owner address. */
  owner: Scalars["Address"]["output"]
  /** Pending guardian address. */
  pendingGuardian?: Maybe<Scalars["Address"]["output"]>
  /** Pending guardian apply timestamp. */
  pendingGuardianValidAt?: Maybe<Scalars["BigInt"]["output"]>
  /** Pending owner address. */
  pendingOwner?: Maybe<Scalars["Address"]["output"]>
  /** Pending timelock in seconds. */
  pendingTimelock?: Maybe<Scalars["BigInt"]["output"]>
  /** Pending timelock apply timestamp. */
  pendingTimelockValidAt?: Maybe<Scalars["BigInt"]["output"]>
  /** Skim recipient address. */
  skimRecipient: Scalars["Address"]["output"]
  /** Timelock in seconds. */
  timelock: Scalars["BigInt"]["output"]
  /** Last update timestamp. */
  timestamp: Scalars["BigInt"]["output"]
  /** Total value of vault holdings, in underlying token units. */
  totalAssets: Scalars["BigInt"]["output"]
  /** Total value of vault holdings, in USD for display purpose. */
  totalAssetsUsd?: Maybe<Scalars["Float"]["output"]>
  /** Vault shares total supply. */
  totalSupply: Scalars["BigInt"]["output"]
}

/** Meta Morpho vault transfer transaction data */
export type VaultTransactionData = {
  __typename?: "VaultTransactionData"
  assets: Scalars["BigInt"]["output"]
  assetsUsd?: Maybe<Scalars["Float"]["output"]>
  shares: Scalars["BigInt"]["output"]
  vault: Vault
}

/** Vault warning */
export type VaultWarning = {
  __typename?: "VaultWarning"
  level: WarningLevel
  type: Scalars["String"]["output"]
}

export enum WarningLevel {
  Red = "RED",
  Yellow = "YELLOW",
}

export type AllMarketsQueryVariables = Exact<{ [key: string]: never }>

export type AllMarketsQuery = {
  __typename?: "Query"
  markets: {
    __typename?: "PaginatedMarkets"
    items?: Array<{
      __typename?: "Market"
      uniqueKey: any
      lltv: string
      oracleAddress: any
      irmAddress: any
      loanAsset: {
        __typename?: "Asset"
        address: any
        symbol: string
        decimals: number
      }
      collateralAsset?: {
        __typename?: "Asset"
        address: any
        symbol: string
        decimals: number
      } | null
      state?: {
        __typename?: "MarketState"
        borrowApy: number
        borrowAssets: string
        borrowAssetsUsd?: number | null
        supplyApy: number
        supplyAssets: string
        supplyAssetsUsd?: number | null
        fee: number
        utilization: number
      } | null
    }> | null
  }
}

export type UserPositionsQueryVariables = Exact<{
  address: Scalars["String"]["input"]
  startTimestamp: Scalars["Int"]["input"]
  endTimestamp: Scalars["Int"]["input"]
}>

export type UserPositionsQuery = {
  __typename?: "Query"
  userByAddress: {
    __typename?: "User"
    address: any
    marketPositions: Array<{
      __typename?: "MarketPosition"
      borrowAssets: string
      borrowShares: string
      borrowAssetsUsd?: number | null
      collateral: string
      collateralUsd?: number | null
      healthFactor?: number | null
      market: {
        __typename?: "Market"
        uniqueKey: any
        historicalState?: {
          __typename?: "MarketHistory"
          borrowApy?: Array<{
            __typename?: "FloatDataPoint"
            x: number
            y?: number | null
          }> | null
        } | null
        loanAsset: {
          __typename?: "Asset"
          id: string
          address: any
          decimals: number
          name: string
          symbol: string
        }
        collateralAsset?: {
          __typename?: "Asset"
          id: string
          address: any
          decimals: number
          name: string
          symbol: string
        } | null
        state?: {
          __typename?: "MarketState"
          utilization: number
          borrowApy: number
          netBorrowApy?: number | null
        } | null
      }
    }>
  }
}

export type MarketCoreFragment = {
  __typename?: "Market"
  uniqueKey: any
  loanAsset: {
    __typename?: "Asset"
    id: string
    address: any
    decimals: number
    name: string
    symbol: string
  }
  collateralAsset?: {
    __typename?: "Asset"
    id: string
    address: any
    decimals: number
    name: string
    symbol: string
  } | null
  state?: {
    __typename?: "MarketState"
    utilization: number
    borrowApy: number
    netBorrowApy?: number | null
  } | null
}

export const MarketCoreFragmentDoc = {
  kind: "Document",
  definitions: [
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "MarketCore" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Market" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "uniqueKey" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "loanAsset" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "address" } },
                { kind: "Field", name: { kind: "Name", value: "decimals" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "symbol" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "collateralAsset" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "address" } },
                { kind: "Field", name: { kind: "Name", value: "decimals" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "symbol" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "state" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "utilization" } },
                { kind: "Field", name: { kind: "Name", value: "borrowApy" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "netBorrowApy" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<MarketCoreFragment, unknown>
export const AllMarketsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "AllMarkets" },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "markets" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                {
                  kind: "Field",
                  name: { kind: "Name", value: "items" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "uniqueKey" },
                      },
                      { kind: "Field", name: { kind: "Name", value: "lltv" } },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "oracleAddress" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "irmAddress" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "loanAsset" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "address" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "symbol" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "decimals" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "collateralAsset" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "address" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "symbol" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "decimals" },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "state" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "borrowApy" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "borrowAssets" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "borrowAssetsUsd" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "supplyApy" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "supplyAssets" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "supplyAssetsUsd" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "fee" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "utilization" },
                            },
                          ],
                        },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<AllMarketsQuery, AllMarketsQueryVariables>
export const UserPositionsDocument = {
  kind: "Document",
  definitions: [
    {
      kind: "OperationDefinition",
      operation: "query",
      name: { kind: "Name", value: "UserPositions" },
      variableDefinitions: [
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "address" },
          },
          type: {
            kind: "NonNullType",
            type: {
              kind: "NamedType",
              name: { kind: "Name", value: "String" },
            },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "startTimestamp" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
        {
          kind: "VariableDefinition",
          variable: {
            kind: "Variable",
            name: { kind: "Name", value: "endTimestamp" },
          },
          type: {
            kind: "NonNullType",
            type: { kind: "NamedType", name: { kind: "Name", value: "Int" } },
          },
        },
      ],
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          {
            kind: "Field",
            name: { kind: "Name", value: "userByAddress" },
            arguments: [
              {
                kind: "Argument",
                name: { kind: "Name", value: "address" },
                value: {
                  kind: "Variable",
                  name: { kind: "Name", value: "address" },
                },
              },
            ],
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "address" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "marketPositions" },
                  selectionSet: {
                    kind: "SelectionSet",
                    selections: [
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "market" },
                        selectionSet: {
                          kind: "SelectionSet",
                          selections: [
                            {
                              kind: "FragmentSpread",
                              name: { kind: "Name", value: "MarketCore" },
                            },
                            {
                              kind: "Field",
                              name: { kind: "Name", value: "historicalState" },
                              selectionSet: {
                                kind: "SelectionSet",
                                selections: [
                                  {
                                    kind: "Field",
                                    name: { kind: "Name", value: "borrowApy" },
                                    arguments: [
                                      {
                                        kind: "Argument",
                                        name: {
                                          kind: "Name",
                                          value: "options",
                                        },
                                        value: {
                                          kind: "ObjectValue",
                                          fields: [
                                            {
                                              kind: "ObjectField",
                                              name: {
                                                kind: "Name",
                                                value: "startTimestamp",
                                              },
                                              value: {
                                                kind: "Variable",
                                                name: {
                                                  kind: "Name",
                                                  value: "startTimestamp",
                                                },
                                              },
                                            },
                                            {
                                              kind: "ObjectField",
                                              name: {
                                                kind: "Name",
                                                value: "endTimestamp",
                                              },
                                              value: {
                                                kind: "Variable",
                                                name: {
                                                  kind: "Name",
                                                  value: "endTimestamp",
                                                },
                                              },
                                            },
                                            {
                                              kind: "ObjectField",
                                              name: {
                                                kind: "Name",
                                                value: "interval",
                                              },
                                              value: {
                                                kind: "EnumValue",
                                                value: "DAY",
                                              },
                                            },
                                          ],
                                        },
                                      },
                                    ],
                                    selectionSet: {
                                      kind: "SelectionSet",
                                      selections: [
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "x" },
                                        },
                                        {
                                          kind: "Field",
                                          name: { kind: "Name", value: "y" },
                                        },
                                      ],
                                    },
                                  },
                                ],
                              },
                            },
                          ],
                        },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "borrowAssets" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "borrowShares" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "borrowAssetsUsd" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "collateral" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "collateralUsd" },
                      },
                      {
                        kind: "Field",
                        name: { kind: "Name", value: "healthFactor" },
                      },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
    },
    {
      kind: "FragmentDefinition",
      name: { kind: "Name", value: "MarketCore" },
      typeCondition: {
        kind: "NamedType",
        name: { kind: "Name", value: "Market" },
      },
      selectionSet: {
        kind: "SelectionSet",
        selections: [
          { kind: "Field", name: { kind: "Name", value: "uniqueKey" } },
          {
            kind: "Field",
            name: { kind: "Name", value: "loanAsset" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "address" } },
                { kind: "Field", name: { kind: "Name", value: "decimals" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "symbol" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "collateralAsset" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "id" } },
                { kind: "Field", name: { kind: "Name", value: "address" } },
                { kind: "Field", name: { kind: "Name", value: "decimals" } },
                { kind: "Field", name: { kind: "Name", value: "name" } },
                { kind: "Field", name: { kind: "Name", value: "symbol" } },
              ],
            },
          },
          {
            kind: "Field",
            name: { kind: "Name", value: "state" },
            selectionSet: {
              kind: "SelectionSet",
              selections: [
                { kind: "Field", name: { kind: "Name", value: "utilization" } },
                { kind: "Field", name: { kind: "Name", value: "borrowApy" } },
                {
                  kind: "Field",
                  name: { kind: "Name", value: "netBorrowApy" },
                },
              ],
            },
          },
        ],
      },
    },
  ],
} as unknown as DocumentNode<UserPositionsQuery, UserPositionsQueryVariables>
