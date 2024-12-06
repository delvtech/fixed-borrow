type NestedValue = string | number | boolean | null | NestedObject | NestedArray
interface NestedObject {
  [key: string]: NestedValue | BigInt
}
type NestedArray = (NestedValue | BigInt)[]

/**
 * Recursively converts all BigInt values in an object or array to strings.
 * @param value - The value to process (object, array, or primitive).
 * @returns The processed value with all BigInts converted to strings.
 */
export function convertBigIntsToStrings<T>(value: T): T {
  if (typeof value === "bigint") {
    return value.toString() as unknown as T // Convert BigInt to string
  } else if (Array.isArray(value)) {
    return value.map(convertBigIntsToStrings) as unknown as T // Recursively handle arrays
  } else if (value !== null && typeof value === "object") {
    const convertedObject: Record<string, any> = {}
    for (const [key, val] of Object.entries(value)) {
      convertedObject[key] = convertBigIntsToStrings(val)
    }
    return convertedObject as T
  }
  return value // Return other types unchanged
}
