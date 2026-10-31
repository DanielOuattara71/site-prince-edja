import { NavLink } from 'react-router'
import { peut, type CompteDroits } from '@/auth/permissions'
import { MENU } from '@/components/layout/navigation'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Menu filtré par `peut()` : une entrée interdite est **absente**, pas grisée (section 8).
 * Fond `forest-950`, texte crème : jamais de vert en texte sur fond sombre (section 5).
 */
export function BarreLaterale({
  compte,
  surNavigation,
}: {
  compte: CompteDroits
  surNavigation?: () => void
}) {
  const lien = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex min-h-11 items-center rounded-md border-l-2 px-3 text-body text-cream-100 transition-colors duration-(--d-fast) hover:bg-forest-900',
      isActive ? 'border-gold-400 bg-forest-900 font-semibold' : 'border-transparent',
    )

  return (
    <div className="space-y-6 px-3 py-6">
      <NavLink to="/" end className={lien} onClick={surNavigation}>
        {t('accueil.titre')}
      </NavLink>
      {MENU.map((groupe) => {
        const visibles = groupe.entrees.filter((entree) =>
          peut(compte, entree.action, entree.ressource),
        )
        if (visibles.length === 0) return null
        return (
          <div key={groupe.titre} className="space-y-1">
            <h2 className="label-caps px-3 pb-1 text-cream-100/80">{groupe.titre}</h2>
            <ul className="space-y-0.5">
              {visibles.map((entree) => (
                <li key={entree.chemin}>
                  <NavLink to={entree.chemin} className={lien} onClick={surNavigation}>
                    {entree.libelle}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
