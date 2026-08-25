import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useReducedMotion } from 'motion/react'

const EXIT_DURATION_MS = 300

export function ScrollToTop() {
  const { pathname } = useLocation()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const delay = reducedMotion ? 0 : EXIT_DURATION_MS
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }, delay)
    return () => clearTimeout(timer)
  }, [pathname, reducedMotion])

  return null
}
