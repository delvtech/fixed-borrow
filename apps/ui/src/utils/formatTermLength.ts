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

type FormattedTermLengthResult = {
  value: number
  scale: "days" | "years"
  formatted: string
}
export function formatTermLength(
  termLengthMS: bigint
): FormattedTermLengthResult {
  const numDays = convertMillisecondsToDays(Number(termLengthMS * 1000n))
  const numYears = convertMillisecondsToYears(Number(termLengthMS * 1000n))

  const result: Omit<FormattedTermLengthResult, "formatted"> =
    numYears >= 1
      ? {
          value: numYears,
          scale: "years",
        }
      : {
          value: numDays,
          scale: "days",
        }

  const formatted = result.value + " " + result.scale

  return {
    ...result,
    formatted,
  }
}
