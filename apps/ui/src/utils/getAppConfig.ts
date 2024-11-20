import {
  Config,
  dfbChainConfig,
  ethereumConfig,
  sepoliaConfig,
  SupportedChainId,
} from "dfb-config"
import { delvChain } from "src/client/rainbowClient"
import { mainnet } from "viem/chains"

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
