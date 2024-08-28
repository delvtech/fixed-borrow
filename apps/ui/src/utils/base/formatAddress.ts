export function formatAddress(
  address: string,
  options?: {
    startChars?: number
    endChars?: number
  }
): string {
  return `0x${address.slice(2, 2 + (options?.startChars ?? 2))}...${address.slice(options?.endChars ? -options?.endChars : -4)}`
}
