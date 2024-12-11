export function ensureHexPrefix(value: string): `0x${string}` {
  return `0x${value.replace(/^0x/, "")}`
}
