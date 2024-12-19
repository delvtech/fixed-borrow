import { SupportedChainId } from "dfb-config"
import { getAppConfig } from "utils/getAppConfig"
import { useChainId } from "wagmi"

export function useAppConfig() {
  const chainId = useChainId() as SupportedChainId

  return getAppConfig(chainId)
}
