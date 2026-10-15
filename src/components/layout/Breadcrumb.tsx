import { Link, useLocation } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { filDariane } from '@/data/navigation'
import { useJsonLd, schemaFilDariane } from '@/hooks/useSeo'
import { useLangue } from '@/i18n/contexteLangue'

interface Props {
  /** Titre réel de la page courante : écrase le libellé du dernier segment. */
  titreFinal?: string
  className?: string
}

/**
 * Fil d'Ariane des pages profondes.
 *
 * Le fil affiché et le JSON-LD sont calculés **par la même fonction** : deux
 * implémentations finiraient par diverger, et un fil d'Ariane mentant est pire qu'un
 * fil absent. Les données structurées ne sont écrites que sur les pages profondes :
 * inutile sur une page racine.
 */
export function Breadcrumb({ titreFinal, className }: Props) {
  const { langue, l } = useLangue()
  const { pathname } = useLocation()
  const fragments = filDariane(pathname)

  const dernier = fragments[fragments.length - 1]
  const avecTitre = titreFinal
    ? [...fragments.slice(0, -1), { libelle: { fr: titreFinal, en: titreFinal }, to: dernier.to }]
    : fragments

  const base = `${window.location.origin}${import.meta.env.BASE_URL}`
  useJsonLd(schemaFilDariane(avecTitre, langue, base))

  return (
    <nav aria-label={l({ fr: "Fil d'Ariane", en: 'Breadcrumb' })} className={className}>
      <ol className="label-caps flex flex-wrap items-center gap-1 text-ink-500">
        {avecTitre.map((fragment, index) => {
          const courant = index === avecTitre.length - 1
          return (
            <li key={`${fragment.to}-${index}`} className="flex items-center gap-1">
              {courant ? (
                <span aria-current="page">{l(fragment.libelle)}</span>
              ) : (
                <>
                  <Link
                    to={fragment.to}
                    className="inline-flex min-h-11 items-center underline-offset-4 transition-colors hover:text-ink-900 hover:underline"
                  >
                    {l(fragment.libelle)}
                  </Link>
                  <ChevronRight aria-hidden className="size-3 opacity-50" />
                </>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
