import { createContext, useContext } from 'react'
import type { Moi } from '@/api/schemas/auth'

/**
 * Contexte de session. Séparé de son fournisseur (`FournisseurSession.tsx`) : un fichier
 * `.tsx` qui exporte autre chose qu'un composant casse le rechargement à chaud.
 */
export interface ValeurSession {
  /** `null` = aucune session ; `undefined` = pas encore vérifiée. */
  moi: Moi | null | undefined
  connecter: (email: string, motDePasse: string) => Promise<Moi>
  deconnecter: () => Promise<void>
  /** Relit `GET /auth/moi` (nouveau jeton CSRF, rôle éventuellement changé). */
  rafraichir: () => Promise<void>
}

export const ContexteSession = createContext<ValeurSession | null>(null)

export function useSession(): ValeurSession {
  const valeur = useContext(ContexteSession)
  if (!valeur) throw new Error('useSession doit être appelé sous <FournisseurSession>.')
  return valeur
}

export const CLE_SESSION = ['session'] as const

/**
 * Session tombée pendant le travail (`401` alors qu'une session existait, D-16) : l'écran
 * est verrouillé **sans démonter la page**, pour que le formulaire en cours survive à la
 * reconnexion. Vit dans le cache des requêtes : la déconnexion l'efface avec le reste.
 */
export const CLE_VERROU = ['session-verrou'] as const
