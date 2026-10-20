import * as React from "react"

const MOBILE_BREAKPOINT = 768
const MD_QUERY = `(min-width: ${MOBILE_BREAKPOINT}px)`

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}

/** Viewport is `md` and up. Snapshot is correct on the first client render (no flash). */
export function usePrefersMd() {
  return React.useSyncExternalStore(
    (onChange) => {
      const mq = window.matchMedia(MD_QUERY)
      mq.addEventListener("change", onChange)
      return () => mq.removeEventListener("change", onChange)
    },
    () => window.matchMedia(MD_QUERY).matches,
    () => false,
  )
}
