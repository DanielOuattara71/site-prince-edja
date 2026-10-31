import { ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { t } from '@/i18n/fr'

/**
 * Fil d'Ariane : `nav` nommée, liste ordonnée, page courante marquée `aria-current`
 * (section 10). Le dernier élément n'est pas un lien.
 *
 * @example
 * <FilAriane elements={[{ libelle: 'Articles', chemin: '/articles' }, { libelle: article.titre }]} />
 */
export interface ElementFilAriane {
  libelle: string
  chemin?: string
}

export function FilAriane({ elements }: { elements: ElementFilAriane[] }) {
  return (
    <nav aria-label={t('filAriane.libelle')} className="mb-3">
      <ol className="flex flex-wrap items-center gap-1 text-caption text-ink-700">
        <li className="flex items-center gap-1">
          <Link
            to="/"
            className="inline-flex min-h-8 items-center underline-offset-4 hover:underline"
          >
            {t('accueil.titre')}
          </Link>
        </li>
        {elements.map((element, index) => {
          const dernier = index === elements.length - 1
          return (
            <li key={`${element.libelle}-${index}`} className="flex items-center gap-1">
              <ChevronRight aria-hidden className="size-3.5" />
              {element.chemin && !dernier ? (
                <Link
                  to={element.chemin}
                  className="inline-flex min-h-8 items-center underline-offset-4 hover:underline"
                >
                  {element.libelle}
                </Link>
              ) : (
                <span
                  aria-current={dernier ? 'page' : undefined}
                  className="font-semibold text-ink-900"
                >
                  {element.libelle}
                </span>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
