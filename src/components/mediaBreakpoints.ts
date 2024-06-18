import { useEffect, useState } from "react"

/**
 * 'sm' breakpoint from tailwind.
 */
export const SMALL_BREAKPOINT = 640
/**
 * 'md' breakpoint from tailwind.
 */
export const MEDIUM_BREAKPOINT = 768
/**
 * 'lg' breakpoint from tailwind.
 */
export const LARGE_BREAKPOINT = 1024

/**
 * 'xl' breakpoint from tailwind.
 */
export const EXTRA_LARGE_BREAKPOINT = 1280

export function useIsTailwindSmallScreen(): boolean {
  const isSm = useIsTailwindSm()
  const isMd = useIsTailwindMd()
  const isLg = useIsTailwindLg()
  return isSm || isMd || isLg
}

export function useIsTailwindLargeScreen(): boolean {
  const isXl = useIsTailwindXl()
  return isXl
}

export function useIsTailwindLessThanSm(): boolean {
  const isLessThanSm = useMediaQuery(`(max-width: ${SMALL_BREAKPOINT}px)`)
  return isLessThanSm
}

function useIsTailwindSm(): boolean {
  const isLessThanMd = useMediaQuery(`(max-width: ${MEDIUM_BREAKPOINT}px)`)
  return isLessThanMd
}

function useIsTailwindMd(): boolean {
  const isAtLeastMdBreakpoint = useMediaQuery(
    `(min-width: ${MEDIUM_BREAKPOINT}px)`
  )
  const isLessThanLgBreakpoint = useMediaQuery(
    `(max-width: ${LARGE_BREAKPOINT - 1}px)`
  )
  return isAtLeastMdBreakpoint && isLessThanLgBreakpoint
}

function useIsTailwindLg(): boolean {
  const isAtLeastLgBreakpoint = useMediaQuery(
    `(min-width: ${LARGE_BREAKPOINT}px)`
  )
  const isLessThanXlBreakpoint = useMediaQuery(
    `(max-width: ${EXTRA_LARGE_BREAKPOINT - 1}px)`
  )
  return isAtLeastLgBreakpoint && isLessThanXlBreakpoint
}

function useIsTailwindXl(): boolean {
  return useMediaQuery(`(min-width: ${EXTRA_LARGE_BREAKPOINT - 1}px)`)
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => {
    if (typeof window !== "undefined") {
      return window.matchMedia(query).matches
    }
    return false
  })

  useEffect(() => {
    if (typeof window === "undefined") {
      return
    }

    const mediaQueryList = window.matchMedia(query)
    const listener = (event: MediaQueryListEvent) => setMatches(event.matches)

    mediaQueryList.addEventListener("change", listener)
    return () => {
      mediaQueryList.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}
