import { Container } from '@/components/layout/Container'
import { Section } from '@/components/layout/Section'
import { Reveal } from '@/components/motion/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useLangue } from '@/i18n/contexteLangue'

/**
 * Collaborations de la page d'accueil.
 *
 * Le CDC demande deux à trois études de cas. Aucune n'existe encore : la section pose
 * les trois emplacements et l'annonce, plutôt que de remplir avec du plausible. Les
 * logos partenaires ont la même règle : la rangée reste vide jusqu'aux fichiers.
 */
const EMPLACEMENTS = 3

export function Collaborations() {
  const { t } = useLangue()

  return (
    <Section tone="light">
      <Container>
        <SectionHeading
          eyebrow="Ils ont travaillé avec Prince"
          num="06"
          title={
            <>
              Collaboration
              <span aria-hidden className="text-clay-500">.</span>
            </>
          }
          lead="PROPOSITION à valider : trois études de cas, du brief au résultat."
        />

        <div className="mt-16 grid gap-8 lg:grid-cols-3">
          {Array.from({ length: EMPLACEMENTS }, (_, index) => (
            <Reveal key={index} delay={index * 0.08}>
              <article className="flex h-full flex-col overflow-hidden rounded-xl border border-sand-200">
                <div className="flex aspect-4/5 items-center justify-center bg-sand-200">
                  <span className="label-caps px-6 text-center text-ink-500">
                    {t('collab.imageAFournir')}
                  </span>
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <p className="font-display uppercase text-heading-sm text-ink-900">
                    {t('collab.casAFournir')}
                  </p>
                  <p className="text-caption text-ink-500">{t('collab.clientAFournir')}</p>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </Container>
    </Section>
  )
}
