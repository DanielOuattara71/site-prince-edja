import { Archive, CircleCheck, CircleDashed, Clock, Eye, PencilLine } from 'lucide-react'
import { t, type CleTraduction } from '@/i18n/fr'
import { cn } from '@/lib/cn'
import type { EtatAffiche } from '@/lib/statuts'

/**
 * Pastille d'état (section 5) : icône **et** libellé, jamais la couleur seule. Les quatre
 * statuts réels, plus « programmé » et « à fournir », dérivés (D-18).
 *
 * @example
 * <PastilleStatut etat={etatAffiche(article.statut, article.publieLe)} />
 */
const STYLES: Record<EtatAffiche, { classes: string; Icone: typeof Eye }> = {
  brouillon: { classes: 'bg-sand-200 text-ink-900 border-sand-200', Icone: PencilLine },
  en_relecture: { classes: 'bg-gold-300/40 text-ink-900 border-gold-300', Icone: Eye },
  publie: { classes: 'bg-sage-100 text-forest-900 border-sage-100', Icone: CircleCheck },
  programme: { classes: 'bg-sand-50 text-forest-900 border-forest-900', Icone: Clock },
  archive: { classes: 'bg-transparent text-ink-500 border-sand-300', Icone: Archive },
  a_fournir: {
    classes: 'bg-transparent text-clay-700 border-dashed border-clay-600',
    Icone: CircleDashed,
  },
}

export function PastilleStatut({
  etat,
  complement,
  className,
}: {
  etat: EtatAffiche
  /** Texte ajouté au libellé, par exemple le nombre de champs à fournir. */
  complement?: string
  className?: string
}) {
  const { classes, Icone } = STYLES[etat]
  return (
    <span
      className={cn(
        'inline-flex min-h-7 items-center gap-1.5 rounded-full border px-2.5 text-caption font-semibold whitespace-nowrap',
        classes,
        className,
      )}
    >
      <Icone aria-hidden className="size-3.5 shrink-0" />
      {t(`statut.${etat}` as CleTraduction)}
      {complement ? <span className="tnum">· {complement}</span> : null}
    </span>
  )
}
