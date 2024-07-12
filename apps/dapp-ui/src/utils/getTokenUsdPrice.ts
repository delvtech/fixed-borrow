import { Address, parseUnits } from "viem"
import { mainnet, sepolia } from "viem/chains"
import { SupportedChainId } from "../constants"

const tokenUsdPriceResolvers: Record<
  SupportedChainId,
  Record<Address, () => Promise<bigint>>
> = {
  [mainnet.id]: {},
  [sepolia.id]: {
    // Fake DAI
    "0x552ceaDf3B47609897279F42D3B3309B604896f3": () =>
      Promise.resolve(parseUnits("1", 18)),
    // Fake sDAI
    "0xECa45b0391E81c311F1b390808a3BA3214d35eAA": () =>
      Promise.resolve(parseUnits("1", 18)),
  },
}

export async function getTokenUsdPrice(
  chainId: SupportedChainId,
  address: Address
) {
  const resolverFunc = tokenUsdPriceResolvers[chainId][address]
  if (!resolverFunc) {
    return null
  }

  return resolverFunc()
}
