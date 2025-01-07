import { dayInMs, yearInMs } from "utils/constants"

function convertMillisecondsToDays(ms: number): number {
  const days = Math.floor(ms / dayInMs)
  return days
}

function convertMillisecondsToYears(ms: number): number {
  const days = Math.floor(ms / yearInMs)
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
