import { DISTINCTIONS } from '@/acces/preuves'
import { Container } from '@/components/layout/Container'
import { useLangue } from '@/i18n/contexteLangue'

/**
 * « Mentions » — la grammaire de la capture (crédits type « special mentions »),
 * traduite en français, sur une seule ligne.
 *
 * La home porte déjà trois preuves (Preuves chiffrées, PressMarquee, page Presse) : on
 * n'ajoute pas un carrousel, une seule ligne typographique suffit, et elle ne dépend
 * d'aucune photo — la raison sociale et l'année suffisent, l'année la plus récente d'abord.
 */
export function MentionsDistinctions() {
  const { t } = useLangue()
  if (DISTINCTIONS.length === 0) return null

  const mentions = [...DISTINCTIONS].sort((a, b) => b.annee.localeCompare(a.annee))

  return (
    <section aria-label={t('mentions.etiquette')} className="border-b border-sand-200 bg-sand-50">
      <Container className="py-5 lg:py-6">
        <ul className="flex flex-wrap items-baseline gap-x-6 gap-y-2">
          {mentions.map((d) => (
            <li key={d.id} className="tnum flex items-baseline gap-2">
              <span className="font-display text-heading-sm text-clay-600">{d.annee}</span>
              <span className="text-caption text-ink-700">{d.titre}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  )
}
