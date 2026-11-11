import { useEffect, useSyncExternalStore } from 'react'
import { useSearchParams } from 'react-router'
import { lirePage } from '@/lib/catalogue'

/**
 * Page d'une liste, gardée dans l'adresse (`?page=N`). La page 1 n'écrit pas `page=1` ; une
 * valeur invalide vaut 1 ; une page au-delà de la dernière est ramenée à la dernière par
 * `useCorrigerPage`, sans entrée d'historique (remplacement).
 */
export function usePagination() {
  const [params] = useSearchParams()
  const page = lirePage(params.get('page'))

  /** Recherche (`?…`) de la page `n`, les autres paramètres conservés. */
  const recherchePage = (n: number) => {
    const suivante = new URLSearchParams(params)
    if (n <= 1) suivante.delete('page')
    else suivante.set('page', String(n))
    const texte = suivante.toString()
    return texte ? `?${texte}` : ''
  }

  return { page, recherchePage }
}

/** Remplace l'adresse quand la page réelle diffère de celle demandée (invalide, hors limite, `page=1`). */
export function useCorrigerPage(pageReelle: number) {
  const [params, setParams] = useSearchParams()
  const brute = params.get('page')
  const attendue = pageReelle <= 1 ? null : String(pageReelle)
  useEffect(() => {
    if (brute === attendue) return
    setParams(
      (actuelle) => {
        const suivante = new URLSearchParams(actuelle)
        if (attendue === null) suivante.delete('page')
        else suivante.set('page', attendue)
        return suivante
      },
      { replace: true },
    )
  }, [brute, attendue, setParams])
}

const REQUETE_LARGE = '(min-width: 1536px)'

function abonner(rappel: () => void) {
  if (typeof window === 'undefined' || !window.matchMedia) return () => {}
  const media = window.matchMedia(REQUETE_LARGE)
  media.addEventListener('change', rappel)
  return () => media.removeEventListener('change', rappel)
}

/** Vrai sur un écran d'au moins 1536 px (24 produits par page au lieu de 12). */
export function useEcranLarge(): boolean {
  return useSyncExternalStore(
    abonner,
    () =>
      typeof window !== 'undefined' && window.matchMedia
        ? window.matchMedia(REQUETE_LARGE).matches
        : false,
    () => false,
  )
}
