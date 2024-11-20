import { ReadHyperdrive } from "@delvtech/hyperdrive-viem"
import { ERC20Abi } from "artifacts/base/ERC20"
import { MorphoBlueAbi } from "artifacts/morpho/MorphoBlueAbi"
import * as fs from "fs"
import { camelCase } from "lodash-es"
import { Address } from "viem"
import { getClient } from "./clients"
import {
  SupportedChainId,
  morphoAddressesByChain,
  supportedChainIds,
  tokenIconBySymbol,
  whitelistedMetaMorphoMarketsByChain,
} from "./constants"
import { Config, Market } from "./types"

export interface Token {
  symbol: string
  name: string
  decimals: number
  address: Address
  iconUrl?: string
}
// custom polyfill to serialize a bigint.
;(BigInt.prototype as any).toJSON = function () {
  return this.toString() + "n"
}

supportedChainIds.forEach(async (chainId) => {
  const client = getClient(chainId)
  const morphoMarketIds =
    whitelistedMetaMorphoMarketsByChain[chainId as SupportedChainId]
  const morphoBlueAddress =
    morphoAddressesByChain[chainId as SupportedChainId].blue

  const tokens: Array<Token> = []

  const morphoMarkets: Market[] = await Promise.all(
    morphoMarketIds.map(async (market) => {
      const [loanTokenAddress, collateralTokenAddress, oracle, irm, lltv] =
        await client.readContract({
          abi: MorphoBlueAbi,
          address: morphoBlueAddress,
          functionName: "idToMarketParams",
          args: [market.morphoId as Address],
        })

      const [
        loanTokenSymbol,
        loanTokenName,
        loanTokenDecimals,
        collateralTokenSymbol,
        collateralTokenName,
        collateralTokenDecimals,
      ] = await Promise.all([
        await client.readContract({
          abi: ERC20Abi,
          address: loanTokenAddress,
          functionName: "symbol",
        }),
        await client.readContract({
          abi: ERC20Abi,
          address: loanTokenAddress,
          functionName: "name",
        }),
        await client.readContract({
          abi: ERC20Abi,
          address: loanTokenAddress,
          functionName: "decimals",
        }),
        await client.readContract({
          abi: ERC20Abi,
          address: collateralTokenAddress,
          functionName: "symbol",
        }),
        await client.readContract({
          abi: ERC20Abi,
          address: collateralTokenAddress,
          functionName: "name",
        }),
        await client.readContract({
          abi: ERC20Abi,
          address: collateralTokenAddress,
          functionName: "decimals",
        }),
      ])

      const loanToken = {
        address: loanTokenAddress,
        symbol: loanTokenSymbol,
        name: loanTokenName,
        decimals: loanTokenDecimals,
        iconUrl: tokenIconBySymbol[loanTokenSymbol],
      }

      const collateralToken = {
        address: collateralTokenAddress,
        symbol: collateralTokenSymbol,
        name: collateralTokenName,
        decimals: collateralTokenDecimals,
        iconUrl: tokenIconBySymbol[collateralTokenSymbol],
      }

      !tokens.some((token) => token.address === loanTokenAddress) &&
        tokens.push(loanToken)
      !tokens.some((token) => token.address === collateralTokenAddress) &&
        tokens.push(collateralToken)

      const readHyperdrive = new ReadHyperdrive({
        publicClient: client,
        address: market.hyperdrive,
      })

      const hyperdrivePoolConfig = await readHyperdrive.getPoolConfig()

      const duration = hyperdrivePoolConfig.positionDuration
      const marketObj: Market = {
        hyperdrive: market.hyperdrive,
        loanToken,
        collateralToken,
        lltv,
        duration,
        metadata: {
          id: market.morphoId as Address,
          oracle,
          irm,
        },
      }

      return marketObj
    })
  )

  const config: Config = {
    tokens,
    morphoMarkets,
  }

  const chainName = camelCase(client.chain?.name)

  const tsContent = `
  // This file is auto-generated. Do not edit manually.
  import { Config } from "../types";
  export const ${chainName}Config: Config = ${JSON.stringify(config, null, 2).replace(/"(\d+n)"/g, "$1")} as const;
  `

  fs.writeFileSync(`src/configs/${chainName}-config.ts`, tsContent)
})
