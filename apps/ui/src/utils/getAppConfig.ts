import {
  Config,
  dfbChainConfig,
  ethereumConfig,
  sepoliaConfig,
} from "dfb-config"
import { delvChain } from "src/client/rainbowClient"
import { mainnet } from "viem/chains"
import { SupportedChainId } from "../constants"

export function getAppConfig(chainId: SupportedChainId): Config {
  let config = sepoliaConfig

  if (chainId === mainnet.id) {
    config = ethereumConfig
  }

  if (chainId === delvChain.id) {
    config = dfbChainConfig
  }

  return config
}
