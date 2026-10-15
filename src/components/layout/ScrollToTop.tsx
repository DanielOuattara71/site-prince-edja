import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useReducedMotion } from 'motion/react'

const EXIT_DURATION_MS = 300

/**
 * Défilement au changement de page, et vers l'ancre demandée.
 *
 * Sans la gestion du fragment, un lien `#audience` naviguerait vers la page sans jamais
 * l'atteindre : React Router pousse l'URL sans déclencher le défilement natif du
 * navigateur. `scroll-margin` est déjà posé sur les sections, le navigateur s'aligne
 * donc juste en dessous de la barre flottante.
 */
export function ScrollToTop() {
  const { pathname, hash } = useLocation()
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (hash) {
      const cible = document.getElementById(hash.slice(1))
      if (!cible) return
      const behavior: ScrollBehavior = reducedMotion ? 'auto' : 'smooth'
      cible.scrollIntoView({ behavior, block: 'start' })
      return
    }

    const delay = reducedMotion ? 0 : EXIT_DURATION_MS
    const timer = setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }, delay)
    return () => clearTimeout(timer)
  }, [pathname, hash, reducedMotion])

  return null
}
