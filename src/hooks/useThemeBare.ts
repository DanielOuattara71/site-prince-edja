import { useEffect, useState } from 'react'
import { useLocation } from 'react-router'

/**
 * Fond que la barre traverse, mesuré au lieu d'être deviné.
 *
 * Chaque section sombre porte `data-theme-bare="dark"` (posé par `Section`). Le hook
 * observe celles qui passent juste sous l'en-tête et en déduit le thème courant : un
 * nouvel héros sombre se déclare donc seul, sans mise à jour d'une liste de routes
 * oubliable. Les sections montées après coup — les pages arrivent en `lazy` — sont
 * rattrapées par un `MutationObserver`, et la route en dépendance remet l'état à zéro
 * à chaque navigation, ce qui vide au passage la carte des sections vues.
 *
 * @param amorce Thème de la première frame, avant que l'observation ne démarre.
 */
export function useThemeBare(amorce: boolean, hauteurBare = 96): boolean {
  const [sombre, setSombre] = useState(amorce)
  const { pathname } = useLocation()

  useEffect(() => {
    const vus = new Map<Element, boolean>()

    const evaluer = () => {
      let fonce = false
      for (const [element, estSombre] of vus) {
        if (estSombre && element.isConnected) fonce = true
      }
      setSombre(fonce)
    }

    // Bande située sous la barre seulement : ni la section plus haut dans la page,
    // ni plus bas. `-99%` en bas laisse environ 1 % de la fenêtre — une bande de
    // hauteur nulle n'est jamais franchie par l'observer, et une bande trop haute
    // laisserait la section du dessous annoncer son thème (c'était le cas avec
    // `-95%`, qui rendait la bande négative et le thème figé sur son amorce).
    const observer = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) {
            vus.set(entree.target, entree.target.getAttribute('data-theme-bare') === 'dark')
          } else {
            vus.delete(entree.target)
          }
        }
        evaluer()
      },
      { rootMargin: `-${hauteurBare}px 0px -99% 0px`, threshold: 0 },
    )

    const observees = new WeakSet<Element>()
    const scruter = () => {
      for (const section of document.querySelectorAll('[data-theme-bare]')) {
        if (!observees.has(section)) {
          observees.add(section)
          observer.observe(section)
        }
      }
    }

    scruter()

    // Les pages sont en `lazy` : sans cette écoute, leurs sections ne seraient jamais
    // présentées à l'observer et la barre garderait le thème de la page précédente.
    const mutations = new MutationObserver(scruter)
    mutations.observe(document.body, { childList: true, subtree: true })

    return () => {
      observer.disconnect()
      mutations.disconnect()
    }
  }, [pathname, hauteurBare])

  return sombre
}
