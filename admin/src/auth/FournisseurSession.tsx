import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect, useMemo, type ReactNode } from 'react'
import { surCsrfInvalide } from '@/api/client'
import { lireMoi, seConnecter, seDeconnecter } from '@/api/endpoints/auth'
import { aLeCode } from '@/api/erreurs'
import type { Moi } from '@/api/schemas/auth'
import { CLE_SESSION, ContexteSession, type ValeurSession } from '@/auth/contexte-session'

/**
 * Session de l'admin (section 6 du prompt, D-16).
 *
 * La source de vérité est `GET /auth/moi`, lue au démarrage. Le cookie `HttpOnly` reste
 * hors de portée du code ; le jeton CSRF est gardé en mémoire par `client.ts`.
 */
async function lireSession(): Promise<Moi | null> {
  try {
    return await lireMoi()
  } catch (erreur) {
    if (aLeCode(erreur, 'NON_AUTHENTIFIE')) return null
    throw erreur
  }
}

export function FournisseurSession({ children }: { children: ReactNode }) {
  const client = useQueryClient()
  const requete = useQuery({
    queryKey: CLE_SESSION,
    queryFn: lireSession,
    staleTime: Number.POSITIVE_INFINITY,
    retry: false,
  })

  const valeur = useMemo<ValeurSession>(
    () => ({
      moi: requete.data,
      async connecter(email, motDePasse) {
        const moi = await seConnecter(email, motDePasse)
        client.setQueryData(CLE_SESSION, moi)
        return moi
      },
      async deconnecter() {
        try {
          await seDeconnecter()
        } finally {
          // Aucune donnée d'un compte ne survit à sa déconnexion. La requête de session
          // reste dans le cache (son observateur y est abonné) et passe à `null`.
          client.removeQueries({ predicate: (cachee) => cachee.queryKey[0] !== CLE_SESSION[0] })
          client.setQueryData(CLE_SESSION, null)
        }
      },
      async rafraichir() {
        await client.invalidateQueries({ queryKey: CLE_SESSION })
      },
    }),
    [client, requete.data],
  )

  // Un `403 CSRF_INVALIDE` relit la session puis rejoue la requête une fois (D-16).
  useEffect(() => {
    surCsrfInvalide(async () => {
      await client.fetchQuery({ queryKey: CLE_SESSION, queryFn: lireSession })
    })
    return () => surCsrfInvalide(null)
  }, [client])

  if (requete.isError) throw requete.error
  return <ContexteSession.Provider value={valeur}>{children}</ContexteSession.Provider>
}
