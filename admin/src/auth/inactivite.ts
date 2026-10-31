import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useCallback } from 'react'
import { CLE_VERROU } from '@/auth/contexte-session'

/** L'avertissement d'inactivité paraît deux minutes avant l'échéance de la session (D-16). */
export const AVANCE_AVERTISSEMENT_MS = 2 * 60 * 1000

/**
 * Délais avant l'avertissement et avant l'échéance, calés sur `Moi.session.expireLe` :
 * aucune durée de session n'est codée dans l'admin.
 */
export function delaisSession(expireLe: string, maintenant: number) {
  const echeance = Date.parse(expireLe) - maintenant
  return {
    avantAvertissement: Math.max(0, echeance - AVANCE_AVERTISSEMENT_MS),
    avantEcheance: Math.max(0, echeance),
  }
}

/** Minutes restantes, arrondies au-dessus (« 2 minutes » jusqu'à la dernière seconde de la 2e). */
export function minutesRestantes(expireLe: string, maintenant: number): number {
  return Math.max(0, Math.ceil((Date.parse(expireLe) - maintenant) / 60_000))
}

/** État du verrou de session (voir `CLE_VERROU`). */
export function useVerrou() {
  const client = useQueryClient()
  const { data } = useQuery({
    queryKey: CLE_VERROU,
    queryFn: () => false,
    initialData: false,
    staleTime: Number.POSITIVE_INFINITY,
  })
  // Fonctions stables : elles servent de dépendances aux minuteries de l'avertissement.
  const verrouiller = useCallback(() => client.setQueryData(CLE_VERROU, true), [client])
  const deverrouiller = useCallback(() => client.setQueryData(CLE_VERROU, false), [client])
  return { verrouille: data, verrouiller, deverrouiller }
}
