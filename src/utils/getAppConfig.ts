import { Address } from "viem"
import { SupportedChainId } from "../constants"

import { mainnet } from "viem/chains"
import * as mainnetConfig from "../static/1-config.json"
import * as sepoliaConfig from "../static/11155111-config.json"
import { ArrayElement, Market } from "../types"

function transformMetaMorphoMarkets(
  rawData: ArrayElement<(typeof sepoliaConfig)["morphoMarkets"]>
): Market {
  return {
    loanToken: {
      ...rawData.loanToken,
      address: rawData.loanToken.address as Address,
    },
    collateralToken: {
      ...rawData.collateralToken,
      address: rawData.collateralToken.address as Address,
    },
    hyperdrive: rawData.hyperdrive as Address,
    lltv: BigInt(rawData.lltv),
    metadata: {
      id: rawData.id as Address,
      oracle: rawData.oracle as Address,
      irm: rawData.irm as Address,
    },
  }
}

function transfromAppConfig(config: typeof sepoliaConfig) {
  return {
    ...config,
    morphoMarkets: config.morphoMarkets.map(transformMetaMorphoMarkets),
  }
}

export function getAppConfig(chainId: SupportedChainId) {
  let config = sepoliaConfig

  if (chainId === mainnet.id) {
    return (config = mainnetConfig)
  }

  return transfromAppConfig(config)
}
