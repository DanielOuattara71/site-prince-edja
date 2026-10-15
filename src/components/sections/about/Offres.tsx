import { OFFRES } from '@/data/offres'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'

/** Les huit offres de collaboration du CDC. Libellés du CDC, descriptions à valider. */
export function Offres() {
  return (
    <Section tone="light" className="scroll-mt-32 bg-sand-150" id="offres">
      <Container className="space-y-12">
        <div className="space-y-2">
          <Eyebrow num="05">Les offres</Eyebrow>
          <h2 className="font-display uppercase text-display-lg">
            Huit façons de collaborer<span aria-hidden className="text-clay-500">.</span>
          </h2>
          <p className="max-w-2xl text-body text-ink-500">
            PROPOSITION à valider : les libellés viennent du cahier des charges, les
            descriptions sont à écrire avec la maison.
          </p>
        </div>

        <ul className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {OFFRES.map((offre) => (
            <li key={offre.titre} className="rounded-xl border border-sand-200 bg-sand-50 p-6">
              <h3 className="font-display uppercase text-heading-sm text-ink-900">
                {offre.titre}
              </h3>
              <p className="mt-2 text-body text-ink-500">{offre.texte}</p>
            </li>
          ))}
        </ul>
      </Container>
    </Section>
  )
}
