import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { useLangue } from '@/i18n/contexteLangue'
import { fenetrePages } from '@/lib/catalogue'
import { cn } from '@/lib/cn'

/**
 * Pagination (SCHEMAS § 12.2) : « Précédent », numéros avec fenêtre (1 … 4 5 [6] 7 8 … 20),
 * « Suivant ». Ce sont des liens : chaque page a son adresse, partageable et lisible par les
 * moteurs. `nav aria-label="Pagination"`, page courante `aria-current="page"`, cibles de 44 px,
 * clavier natif. Sous 640 px : « Précédent », « Page 2 sur 8 », « Suivant ».
 */
export function Pagination({
  page,
  totalPages,
  recherchePage,
}: {
  page: number
  totalPages: number
  /** Recherche (`?…`) qui mène à la page `n`. */
  recherchePage: (n: number) => string
}) {
  const { t } = useLangue()
  if (totalPages <= 1) return null

  const base =
    'inline-flex min-h-11 min-w-11 items-center justify-center gap-1 rounded-full px-3 text-caption font-semibold transition-colors duration-(--d-fast)'
  const actif = 'border border-sand-300 text-ink-900 hover:bg-sand-200'
  const inactif = 'border border-sand-200 text-ink-500 cursor-not-allowed'

  const fleche = (cible: number, libelle: string, sens: 'avant' | 'apres') => {
    const contenu = (
      <>
        {sens === 'avant' ? <ChevronLeft aria-hidden className="size-4" /> : null}
        {libelle}
        {sens === 'apres' ? <ChevronRight aria-hidden className="size-4" /> : null}
      </>
    )
    const possible = cible >= 1 && cible <= totalPages
    return possible ? (
      <Link to={{ search: recherchePage(cible) }} className={cn(base, actif)}>
        {contenu}
      </Link>
    ) : (
      <span aria-disabled="true" className={cn(base, inactif)}>
        {contenu}
      </span>
    )
  }

  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between gap-2 sm:justify-center"
    >
      {fleche(page - 1, t('pagination.precedent'), 'avant')}
      <p className="text-caption text-ink-700 sm:hidden">
        {t('pagination.page')} {page} {t('pagination.sur')} {totalPages}
      </p>
      <ul className="hidden items-center gap-1 sm:flex">
        {fenetrePages(page, totalPages).map((n, i) =>
          n === 'ellipse' ? (
            <li key={`ellipse-${i}`} aria-hidden className="px-1 text-caption text-ink-500">
              …
            </li>
          ) : (
            <li key={n}>
              <Link
                to={{ search: recherchePage(n) }}
                aria-current={n === page ? 'page' : undefined}
                aria-label={`${t('pagination.page')} ${n}`}
                className={cn(
                  base,
                  n === page ? 'bg-ink-900 text-cream-100' : 'text-ink-900 hover:bg-sand-200',
                )}
              >
                {n}
              </Link>
            </li>
          ),
        )}
      </ul>
      {fleche(page + 1, t('pagination.suivant'), 'apres')}
    </nav>
  )
}
