import { SupportedChainId } from "dfb-config"
import { delvChain } from "src/client/rainbowClient"
import { Address, parseUnits } from "viem"
import { mainnet, sepolia } from "viem/chains"

const tokenUsdPriceResolvers: Record<
  SupportedChainId,
  Record<Address, () => Promise<bigint>>
> = {
  [mainnet.id]: {},
  [sepolia.id]: {
    // Fake DAI
    "0xe8b99bF4249D90C0eB900651F92485F7160A0513": () =>
      Promise.resolve(parseUnits("1", 18)),
    // Fake sDAI
    "0xFF8AFe6bb92eB9D8e80c607bbe5bbb78BF1201Df": () =>
      Promise.resolve(parseUnits("1", 18)),
  },
  [delvChain.id]: {
    "0x6b175474e89094c44da98b954eedeac495271d0f": () =>
      Promise.resolve(parseUnits("1", 18)),
  },
}

export async function getTokenUsdPrice(
  chainId: SupportedChainId,
  address: Address
) {
  address = address.toLowerCase() as Address
  const resolverFunc = tokenUsdPriceResolvers[chainId][address]
  if (!resolverFunc) {
    return null
  }

  return resolverFunc()
}
