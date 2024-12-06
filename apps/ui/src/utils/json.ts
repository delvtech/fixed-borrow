/**
 * Converts an object with BigInt values into a JSON string.
 * @param {Object} obj - The object to serialize.
 * @param {number} [space=0] - Number of spaces for pretty formatting (default: 0).
 * @returns {string} - The JSON string with BigInt values as strings.
 */
function stringifyWithBigInt<T>(obj: T, space = 0) {
  return JSON.stringify(
    obj,
    (key, value) => (typeof value === "bigint" ? value.toString() : value),
    space
  )
}

/**
 * Parses a JSON string and converts BigInt-compatible strings back to BigInt.
 * @param {string} json - The JSON string to parse.
 * @returns {Object} - The parsed object with BigInt values restored.
 */
function parseWithBigInt<T>(json: string): T {
  return JSON.parse(json, (key, value) =>
    typeof value === "string" && /^\d+$/.test(value) ? BigInt(value) : value
  )
}
