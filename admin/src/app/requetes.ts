import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { estErreurApi } from '@/api/erreurs'
import { CLE_SESSION, CLE_VERROU } from '@/auth/contexte-session'

/**
 * Cache des données serveur (TanStack Query, section 6 du prompt).
 *
 * - Pas de nouvel essai sur une erreur du client (4xx) : elle ne changera pas toute seule.
 * - `401` pendant le travail : l'écran se verrouille sans rien démonter (D-16, D-38) ;
 *   sans session connue, retour à la connexion.
 * - `403` (hors CSRF) : le rôle a pu changer ; on relit `GET /auth/moi` (section 8).
 */
export function creerClientRequetes(): QueryClient {
  // Les caches réagissent aux erreurs en agissant sur le client qu'ils équipent.
  const reference: { client?: QueryClient } = {}

  const surErreur = (erreur: unknown) => {
    const client = reference.client
    if (!client || !estErreurApi(erreur)) return
    if (erreur.code === 'NON_AUTHENTIFIE') {
      if (client.getQueryData(CLE_SESSION)) client.setQueryData(CLE_VERROU, true)
      else client.setQueryData(CLE_SESSION, null)
    } else if (erreur.status === 403 && erreur.code !== 'CSRF_INVALIDE') {
      void client.invalidateQueries({ queryKey: CLE_SESSION })
    }
  }

  const client = new QueryClient({
    queryCache: new QueryCache({ onError: surErreur }),
    mutationCache: new MutationCache({ onError: surErreur }),
    defaultOptions: {
      queries: {
        retry: (echecs, erreur) => {
          const erreurClient = estErreurApi(erreur) && erreur.status >= 400 && erreur.status < 500
          return !erreurClient && echecs < 2
        },
        refetchOnWindowFocus: false,
      },
      mutations: { retry: false },
    },
  })
  reference.client = client
  return client
}
