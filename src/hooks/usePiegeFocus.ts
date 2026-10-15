import { useEffect, useRef } from 'react'

/**
 * Piège de focus pour une surface modale.
 *
 * Fait trois choses qu'un overlay néglige souvent : renvoyer le focus à l'intérieur
 * quand il tente de sortir par Tab, lui rendre sa place d'origine à la fermeture
 * (sinon le clavier se retrouve en haut de la page, inexplicablement), et fermer sur
 * Échap. `useLockBodyScroll` complète côté défilement.
 */
export function usePiegeFocus<T extends HTMLElement>(actif: boolean) {
  const ref = useRef<T>(null)
  const retour = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!actif) return
    retour.current = document.activeElement as HTMLElement | null

    const surface = ref.current
    // On met le focus sur le premier élément focusable, et non sur la surface :
    // une div focusable aux détours de Tab suivants paraît un piège.
    const cibles = surface?.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    cibles?.[0]?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return
      if (event.key !== 'Tab') return

      const liste = surface?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )
      if (!liste || liste.length === 0) return

      const premier = liste[0]
      const dernier = liste[liste.length - 1]
      const actif = document.activeElement

      if (event.shiftKey && (actif === premier || !surface?.contains(actif))) {
        event.preventDefault()
        dernier.focus()
      } else if (!event.shiftKey && actif === dernier) {
        event.preventDefault()
        premier.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      retour.current?.focus()
    }
  }, [actif])

  return ref
}
