const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000
const MILLISECONDS_PER_YEAR = MILLISECONDS_PER_DAY * 365

function convertMillisecondsToDays(ms: number): number {
  const days = Math.floor(ms / MILLISECONDS_PER_DAY)
  return days
}

function convertMillisecondsToYears(ms: number): number {
  const days = Math.floor(ms / MILLISECONDS_PER_YEAR)
  return days
}

export function formatTermLength(termLengthMS: bigint): {
  value: number
  scale: "days" | "years"
} {
  const numDays = convertMillisecondsToDays(Number(termLengthMS * 1000n))
  const numYears = convertMillisecondsToYears(Number(termLengthMS * 1000n))

  if (numYears >= 1) {
    return {
      value: numYears,
      scale: "years",
    }
  }

  return {
    value: numDays,
    scale: "days",
  }
}
