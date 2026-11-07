import { NavLink, useLocation } from 'react-router'
import { useSession } from '@/auth/contexte-session'
import { entreeDe, entreesVisibles } from '@/components/layout/navigation'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Barre d'onglets d'un groupe d'écrans (PROMPT-CORRECTION § 5.1) : affichée au-dessus de chaque
 * écran d'une entrée du menu qui a au moins deux onglets visibles pour ce compte. Ce sont des
 * liens (chaque onglet garde son adresse), l'onglet courant porte `aria-current="page"`.
 * Sur un petit écran la barre défile dans son propre cadre, jamais la page.
 */
export function GroupeEcrans() {
  const { moi } = useSession()
  const { pathname } = useLocation()
  const entree = entreeDe(pathname)
  if (!entree || !entree.barreOnglets) return null
  const visible = entreesVisibles(moi?.compte).find((e) => e.cle === entree.cle)
  if (!visible || visible.visibles.length < 2) return null

  return (
    <nav
      aria-label={`${t('menu.ongletsDe')} ${entree.libelle}`}
      className="-mx-4 mb-6 overflow-x-auto border-b border-sand-200 px-4 sm:mx-0 sm:px-0"
    >
      <ul className="flex min-w-max gap-1">
        {visible.visibles.map((onglet) => (
          <li key={onglet.chemin}>
            <NavLink
              to={onglet.chemin}
              className={({ isActive }) =>
                cn(
                  '-mb-px inline-flex min-h-11 items-center border-b-2 px-4 text-button font-semibold transition-colors duration-(--d-fast)',
                  isActive
                    ? 'border-clay-600 text-ink-900'
                    : 'border-transparent text-ink-700 hover:border-sand-300 hover:text-ink-900',
                )
              }
            >
              {onglet.libelle}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
