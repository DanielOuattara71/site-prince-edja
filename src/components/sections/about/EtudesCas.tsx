import { ETAPES_CAS } from '@/data/offres'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'

/**
 * Template d'étude de cas (CDC T-122) et media kit (T-123).
 *
 * Aucune étude de cas n'est rédigée : le template existe, le squelette est marqué à
 * fournir, et le media kit attend son fichier. Remplir ces deux blocs ne demande aucun
 * changement de code.
 */
export function EtudesCas() {
  const { l } = useLangue()

  return (
    <Section tone="light" className="scroll-mt-32" id="etudes-de-cas">
      <Container className="space-y-12">
        <div className="space-y-2">
          <Eyebrow num="06">Études de cas</Eyebrow>
          <h2 className="font-display uppercase text-display-lg">
            Un projet, de bout en bout<span aria-hidden className="text-clay-500">.</span>
          </h2>
          <p className="max-w-2xl text-body text-ink-500">
            Le template demande huit sections. Aucune étude de cas n'est encore rédigée :
            le squelette est posé, marqué à fournir.
          </p>
        </div>

        <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {ETAPES_CAS.map((etape, index) => (
            <li key={etape} className="flex items-baseline gap-3 border-t border-sand-200 pt-4">
              <span aria-hidden className="font-display text-heading-sm text-clay-500">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="text-body text-ink-700">{etape}</span>
            </li>
          ))}
        </ol>

        <div className="rounded-xl border border-dashed border-sand-300 bg-sand-100 p-8 text-center">
          <p className="font-display uppercase text-heading-sm text-ink-900">
            Étude de cas à fournir
          </p>
          <p className="mx-auto mt-2 max-w-xl text-body text-ink-500">
            Client, année, challenge, contenus, diffusion et résultats seront fournis par
            la maison, puis validés avant publication.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex min-h-11 items-center rounded-md border border-sand-300 px-5 text-caption text-ink-500">
            {l({
              fr: 'Media kit PDF · fichier à fournir',
              en: 'Media kit PDF · file to be provided',
            })}
          </span>
        </div>
      </Container>
    </Section>
  )
}
