export function bigintReplacer(_: string, value: unknown) {
  if (typeof value === "bigint") return value.toString()
  return value
}
