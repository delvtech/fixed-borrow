/**
 * Naive pluralize fn that adds an 's' if `count > 1` by default.
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string
): string {
  return count === 1 ? singular : plural ?? `${singular}s`
}
