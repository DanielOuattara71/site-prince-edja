import { CONTACT_MOTIFS, UNIVERS } from '@/data/content'
import { SITE } from '@/data/site'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Breadcrumb } from '@/components/layout/Breadcrumb'

export default function TravaillerEnsemblePage() {
  useSeo({
    title: 'Travailler avec Prince · Prince Edja',
    description:
      'Partenariats de marque, prises de parole, productions audiovisuelles et conseil en destination. La réponse arrive sous 24 heures ouvrées.',
  })

  return (
    <>
      <Section tone="dark" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="space-y-8">
          <Breadcrumb className="text-cream-100/60" />

          <div className="space-y-5">
            <Eyebrow num="01" tone="dark">
              Travailler ensemble
            </Eyebrow>
            <h1 className="font-display uppercase text-display-lg text-cream-100">
              Travailler avec Prince
              <span aria-hidden className="text-clay-500">.</span>
            </h1>
            <p className="max-w-2xl text-body-lg text-cream-100/75">
              Six univers, une seule manière de faire : partir d'un récit vrai, puis
              décider s'il mérite un film, un circuit, une conférence ou un objet. Décris
              ton projet en quelques lignes. La réponse vient d'une personne, pas d'un
              formulaire.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button href={`mailto:${SITE.email}`} variant="primary">
              Écrire directement
            </Button>
            <Button to="/contact" variant="ghost-light">
              Formulaire de contact
            </Button>
          </div>
        </Container>
      </Section>

      <Section tone="light">
        <Container className="space-y-14">
          <div className="space-y-2">
            <Eyebrow num="02">Les univers</Eyebrow>
            <h2 className="font-display uppercase text-display-lg">
              Six maisons dans la maison
              <span aria-hidden className="text-clay-500">.</span>
            </h2>
          </div>

          <ul className="grid gap-10 lg:grid-cols-2">
            {UNIVERS.map((univers) => (
              <li key={univers.numero} className="space-y-3 border-t border-sand-200 pt-6">
                <p className="label-caps text-clay-600">{univers.numero}</p>
                <h3 className="font-display uppercase text-heading-sm">{univers.nom}</h3>
                <p className="text-body text-ink-500">{univers.pitch}</p>
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="light" className="bg-sand-100">
        <Container className="space-y-14">
          <div className="space-y-2">
            <Eyebrow num="02">Ce qu'on peut faire ensemble</Eyebrow>
            <h2 className="font-display uppercase text-display-lg">
              Trois terrains
              <span aria-hidden className="text-clay-500">.</span>
            </h2>
          </div>

          <ul className="grid gap-10 lg:grid-cols-3">
            {CONTACT_MOTIFS.map((motif) => (
              <li key={motif.numero} className="space-y-3 border-t border-sand-200 pt-6">
                <p className="label-caps text-clay-600">{motif.numero}</p>
                <h3 className="font-display uppercase text-heading-sm">{motif.titre}</h3>
                <p className="text-body text-ink-500">{motif.description}</p>
              </li>
            ))}
          </ul>

          <div className="space-y-3 border-t border-sand-200 pt-6">
            <p className="label-caps text-ink-500">Délai de réponse</p>
            <p className="max-w-2xl text-body-lg text-ink-700">
              Chaque demande reçoit une réponse humaine sous 24 heures ouvrées. Si le
              projet n'est pas le bon, on le dit, et on oriente vers quelqu'un pour qui
              il l'est.
            </p>
          </div>
        </Container>
      </Section>
    </>
  )
}
