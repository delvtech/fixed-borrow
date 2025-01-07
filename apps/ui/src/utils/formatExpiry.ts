import { dayInMs, hourInMs, weekInMs, yearInMs } from "utils/constants"
import { pluralize } from "utils/pluralize"

export function formatExpiry(seconds: bigint | number): string {
  const ms = Number(seconds) * 1000
  const nowMs = Date.now()
  const remainingMs = ms - nowMs

  if (remainingMs < 0) {
    return "Expired"
  }

  const years = Math.floor(remainingMs / yearInMs)

  if (years > 1) {
    return `${years} years`
  }

  const weeks = Math.floor(remainingMs / weekInMs)

  if (years === 1) {
    return `1 year, ${pluralize(weeks, "week")}`
  }
  if (weeks > 1) {
    return `${weeks} weeks`
  }

  const days = Math.floor(remainingMs / dayInMs)

  if (weeks === 1) {
    return `1 week, ${pluralize(days, "day")}`
  }
  if (days > 1) {
    return `${days} days`
  }

  const hours = Math.floor(remainingMs / hourInMs)

  if (days === 1) {
    return `1 day, ${pluralize(hours, "hour")}`
  }
  if (hours > 1) {
    return `${hours} hours`
  }

  const minutes = Math.floor(remainingMs / (60 * 1000))

  if (hours === 1) {
    return `1 hour, ${pluralize(minutes, "minute")}`
  }
  if (minutes > 1) {
    return `${minutes} minutes`
  }
  if (minutes === 1) {
    return `1 minute, ${pluralize(Number(seconds), "second")}`
  }

  return pluralize(Number(seconds), "second")
}
