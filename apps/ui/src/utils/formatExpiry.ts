import { dayInMs, hourInMs, weekInMs, yearInMs } from "utils/constants"
import { pluralize } from "utils/pluralize"

export function formatExpiry(timeInSeconds: bigint | number): string {
  const timeInMs = Number(timeInSeconds) * 1000
  const remainingMs = timeInMs - Date.now()

  if (remainingMs < 0) {
    return "Expired"
  }

  const years = Math.floor(remainingMs / yearInMs)
  const weeks = Math.floor((remainingMs % yearInMs) / weekInMs)
  const yearsFormatted = `${years} ${pluralize(years, "year")}`
  const weeksFormatted = `${weeks} ${pluralize(weeks, "week")}`

  if (years > 0) {
    return weeks > 0 ? `${yearsFormatted}, ${weeksFormatted}` : yearsFormatted
  }

  const days = Math.floor((remainingMs % weekInMs) / dayInMs)
  const daysFormatted = `${days} ${pluralize(days, "day")}`

  if (weeks > 0) {
    return days > 0 ? `${weeksFormatted}, ${daysFormatted}` : weeksFormatted
  }

  const hours = Math.floor((remainingMs % dayInMs) / hourInMs)
  const hoursFormatted = `${hours} ${pluralize(hours, "hour")}`

  if (days > 0) {
    return hours > 0 ? `${daysFormatted}, ${hoursFormatted}` : daysFormatted
  }

  const minutes = Math.floor((remainingMs % hourInMs) / 60_000)
  const minutesFormatted = `${minutes} ${pluralize(minutes, "minute")}`

  if (hours > 0) {
    return minutes > 0
      ? `${hoursFormatted}, ${minutesFormatted}`
      : hoursFormatted
  }

  const seconds = Math.floor((remainingMs % 60_000) / 1000)
  const secondsFormatted = `${seconds} ${pluralize(seconds, "second")}`

  if (minutes > 0) {
    return `${minutesFormatted}, ${secondsFormatted}`
  }

  return secondsFormatted
}
