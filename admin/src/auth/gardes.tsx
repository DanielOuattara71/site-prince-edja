import type { ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import { peut, type Action, type Ressource } from '@/auth/permissions'
import { useSession } from '@/auth/contexte-session'
import { Squelette } from '@/components/ui/Squelette'
import { AccesRefuse } from '@/app/pages-erreur'

/**
 * Gardes de route (section 8 du prompt) : une route interdite affiche « Accès refusé » (403),
 * jamais une redirection silencieuse. La vérité reste au serveur.
 */

/** Session obligatoire ; mot de passe à changer avant tout autre écran (section 8). */
export function RouteProtegee() {
  const { moi } = useSession()
  const location = useLocation()

  if (moi === undefined) return <Squelette plein />
  if (moi === null) {
    const retour = `${location.pathname}${location.search}`
    return <Navigate to={`/connexion?retour=${encodeURIComponent(retour)}`} replace />
  }
  if (moi.compte.doitChangerMotDePasse && location.pathname !== '/changer-mot-de-passe') {
    return <Navigate to="/changer-mot-de-passe" replace />
  }
  return <Outlet />
}

/** Écrans d'accès : une personne déjà connectée part vers le tableau de bord. */
export function RoutePublique() {
  const { moi } = useSession()
  if (moi === undefined) return <Squelette plein />
  if (moi && !moi.compte.doitChangerMotDePasse) return <Navigate to="/" replace />
  return <Outlet />
}

export function RouteAutorisee({
  action,
  ressource,
  children,
}: {
  action: Action
  ressource: Ressource
  children: ReactNode
}) {
  const { moi } = useSession()
  if (!peut(moi?.compte, action, ressource)) return <AccesRefuse />
  return children
}
