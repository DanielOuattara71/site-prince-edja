import { createContext, useContext } from 'react'

/**
 * Notifications de l'admin. Contexte séparé de son fournisseur (`FournisseurNotifications`)
 * pour le rechargement à chaud.
 */
export interface Notification {
  id: number
  ton: 'succes' | 'erreur'
  message: string
  /** Référence de la requête (`requeteId`) d'une erreur, pour le support. */
  reference?: string | undefined
}

export interface ValeurNotifications {
  /** Annoncée poliment, retirée seule au bout de quelques secondes. */
  succes: (message: string) => void
  /** Annoncée immédiatement, reste affichée jusqu'à sa fermeture. */
  erreur: (message: string, reference?: string) => void
  retirer: (id: number) => void
}

export const ContexteNotifications = createContext<ValeurNotifications | null>(null)

export function useNotifications(): ValeurNotifications {
  const valeur = useContext(ContexteNotifications)
  if (!valeur) throw new Error('useNotifications doit être appelé sous <FournisseurNotifications>.')
  return valeur
}

/** Durée d'affichage d'un succès. Une erreur ne disparaît jamais seule (section 10). */
export const DUREE_SUCCES_MS = 6000
