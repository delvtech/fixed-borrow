import { Address, Chain } from "viem"

export async function getUSDPrice(addresses: Address[], chain: Chain) {
  if (chain.name === "sepolia") return {}

  const coins = addresses.map((address) => `${chain.name}:${address}`).join(",")
  const response = await fetch(`https://coins.llama.fi/prices/current/${coins}`)
  const data = await response.json()
  const prices: Record<Address, bigint> = {}

  for (const [coin, info] of Object.entries(data.coins)) {
    const [, address] = coin.split(":")
    // make sure prices are always in 18 decimals
    prices[address as Address] = BigInt(
      (info as any).price * Number(10n ** 18n)
    )
  }
  return prices
}
