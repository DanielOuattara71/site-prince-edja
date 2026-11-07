import { Link, useLocation } from 'react-router'
import type { CompteDroits } from '@/auth/permissions'
import {
  BLOCS,
  dansOnglet,
  entreesVisibles,
  type EntreeVisible,
} from '@/components/layout/navigation'
import { t, type CleTraduction } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Menu à neuf entrées (U1) filtré par `peut()` : une entrée interdite est **absente**, pas
 * grisée. L'entrée reste surlignée dans n'importe lequel de ses onglets et de leurs pages.
 * Fond `forest-950`, texte crème : jamais de vert en texte sur fond sombre.
 */
export function BarreLaterale({
  compte,
  surNavigation,
}: {
  compte: CompteDroits
  surNavigation?: () => void
}) {
  const { pathname } = useLocation()
  const entrees = entreesVisibles(compte)
  const active = (entree: EntreeVisible) =>
    entree.onglets.some((o) => dansOnglet(o.chemin, pathname))

  const lien = (entree: EntreeVisible) => {
    const actif = active(entree)
    const Icone = entree.icone
    return (
      <Link
        to={entree.chemin}
        onClick={surNavigation}
        aria-current={actif ? 'page' : undefined}
        className={cn(
          'flex min-h-11 items-center gap-3 rounded-md border-l-2 px-3 text-body text-cream-100 transition-colors duration-(--d-fast) hover:bg-forest-900',
          actif ? 'border-gold-400 bg-forest-900 font-semibold' : 'border-transparent',
        )}
      >
        <Icone aria-hidden className="size-5 shrink-0" />
        {entree.libelle}
      </Link>
    )
  }

  const hors = entrees.filter((e) => e.bloc === null)
  return (
    <div className="space-y-5 px-3 py-5">
      <ul className="space-y-0.5">
        {hors.map((entree) => (
          <li key={entree.cle}>{lien(entree)}</li>
        ))}
      </ul>
      {BLOCS.map((bloc) => {
        const visibles = entrees.filter((e) => e.bloc === bloc)
        if (visibles.length === 0) return null
        return (
          <div key={bloc} className="space-y-1">
            <h2 className="label-caps px-3 pb-1 text-cream-100/80">
              {t(`menu.groupe.${bloc}` as CleTraduction)}
            </h2>
            <ul className="space-y-0.5">
              {visibles.map((entree) => (
                <li key={entree.cle}>{lien(entree)}</li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
