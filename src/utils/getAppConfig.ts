import { SupportedChainId } from "../constants"

import * as mainnetConfig from "../static/1-config.json"
import * as sepoliaConfig from "../static/11155111-config.json"

export function getAppConfig(chainId: SupportedChainId) {
  if (chainId === 1) {
    return mainnetConfig
  }

  return sepoliaConfig
}
