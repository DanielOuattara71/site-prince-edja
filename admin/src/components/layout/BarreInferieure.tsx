import { Gem, Inbox, Menu, Newspaper, type LucideIcon } from 'lucide-react'
import { Link, useLocation } from 'react-router'
import type { CompteDroits } from '@/auth/permissions'
import { dansOnglet, entreesVisibles } from '@/components/layout/navigation'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Barre inférieure sur mobile (U11) : quatre raccourcis — Journal, Boutique, Boîte de réception,
 * Plus. « Plus » ouvre le menu complet (neuf lignes). Un raccourci que le rôle ne peut pas ouvrir
 * n'est pas affiché. Cibles de 44 px au moins ; masquée sur grand écran.
 */
const RACCOURCIS: { cle: string; icone: LucideIcon }[] = [
  { cle: 'journal', icone: Newspaper },
  { cle: 'boutique', icone: Gem },
  { cle: 'reception', icone: Inbox },
]

export function BarreInferieure({
  compte,
  surPlus,
  plusOuvert,
}: {
  compte: CompteDroits
  surPlus: () => void
  plusOuvert: boolean
}) {
  const { pathname } = useLocation()
  const visibles = entreesVisibles(compte)
  const classe = (actif: boolean) =>
    cn(
      'flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 px-1 text-caption font-semibold',
      actif ? 'text-cream-100' : 'text-cream-100/80 hover:text-cream-100',
    )

  return (
    <nav
      aria-label={t('menu.raccourcis')}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-forest-900 bg-forest-950 pb-[env(safe-area-inset-bottom)] lg:hidden"
    >
      <ul className="flex">
        {RACCOURCIS.map(({ cle, icone: Icone }) => {
          const entree = visibles.find((e) => e.cle === cle)
          if (!entree) return null
          const actif = entree.onglets.some((o) => dansOnglet(o.chemin, pathname))
          return (
            <li key={cle} className="flex flex-1">
              <Link
                to={entree.chemin}
                aria-current={actif ? 'page' : undefined}
                className={classe(actif)}
              >
                <Icone aria-hidden className="size-5" />
                {entree.libelle}
              </Link>
            </li>
          )
        })}
        <li className="flex flex-1">
          <button
            type="button"
            aria-expanded={plusOuvert}
            aria-controls="tiroir-navigation"
            onClick={surPlus}
            className={classe(false)}
          >
            <Menu aria-hidden className="size-5" />
            {t('menu.plus')}
          </button>
        </li>
      </ul>
    </nav>
  )
}
