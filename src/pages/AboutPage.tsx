import { SITE } from '@/data/site'
import { DISTINCTIONS } from '@/data/distinctions'
import { MILESTONES } from '@/data/content'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Audience } from '@/components/sections/about/Audience'
import { Offres } from '@/components/sections/about/Offres'
import { EtudesCas } from '@/components/sections/about/EtudesCas'
import { FormulaireB2B } from '@/components/about/FormulaireB2B'

/** Ce que le CDC attend dans la timeline et que les données ne portent pas encore. */
const ETAPES_MANQUANTES = [
  'Formation',
  'Création de contenu',
  'OHENE',
  'Productions',
  'Conférences',
  'Projets actuels',
]

/** Les cinq engagements du CDC. PROPOSITION à valider : le CDC nomme les thèmes. */
const ENGAGEMENTS = [
  { titre: 'La culture', texte: 'PROPOSITION à valider : ce que le bloc doit dire de la culture.' },
  {
    titre: 'La transmission',
    texte: 'PROPOSITION à valider : ce que le bloc doit dire de la transmission.',
  },
  { titre: 'Le tourisme', texte: 'PROPOSITION à valider : ce que le bloc doit dire du tourisme.' },
  { titre: 'La mémoire', texte: 'PROPOSITION à valider : ce que le bloc doit dire de la mémoire.' },
  {
    titre: 'L’image du continent',
    texte: 'PROPOSITION à valider : ce que le bloc doit dire de l’image du continent.',
  },
]

/** Sommaire de la page : tout tient sur un seul écran, les sections restent atteignables. */
const SOMMAIRE = [
  { ancre: 'parcours', libelle: 'Le parcours' },
  { ancre: 'engagements', libelle: 'Ce que je défends' },
  { ancre: 'audience', libelle: 'Audience' },
  { ancre: 'offres', libelle: 'Offres' },
  { ancre: 'etudes-de-cas', libelle: 'Études de cas' },
  { ancre: 'collaborer', libelle: 'Collaborer' },
]

export default function AboutPage() {
  useSeo({
    title: 'À propos · Prince Edja',
    description:
      'Parcours, mission, audience, offres et collaborations de Prince Edja : briser les clichés, préserver la mémoire et faire du tourisme un pont entre les peuples.',
  })

  return (
    <>
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-6 lg:col-span-7">
              <Eyebrow num="01">Prince Edja</Eyebrow>
              <h1 className="font-display uppercase text-display-lg">
                Raconter l’Afrique depuis l’Afrique
                <span aria-hidden className="text-clay-500">.</span>
              </h1>
              <p className="max-w-xl text-body-lg text-ink-500">{SITE.role}</p>

              {/* Bio courte : 116 mots, dans la fourchette des 100 à 150 du CDC. */}
              <Stagger className="space-y-4">
                {SITE.bio.map((paragraphe) => (
                  <p key={paragraphe.slice(0, 24)} className="max-w-2xl text-body text-ink-700">
                    {paragraphe}
                  </p>
                ))}
              </Stagger>

              <Reveal delay={0.12}>
                <blockquote className="max-w-xl border-l-2 border-gold-400 pl-6 font-quote italic leading-snug text-heading-sm text-ink-900">
                  {SITE.mission}
                </blockquote>
              </Reveal>

              <div className="flex flex-wrap gap-3 pt-2">
                <Button to="/travailler-ensemble" variant="dark">
                  Travailler avec Prince
                </Button>
                <span className="inline-flex min-h-11 items-center rounded-md border border-sand-300 px-5 text-caption text-ink-500">
                  Bio à télécharger · fichier à fournir
                </span>
                <span className="inline-flex min-h-11 items-center rounded-md border border-sand-300 px-5 text-caption text-ink-500">
                  Press kit · fichier à fournir
                </span>
              </div>
            </div>

            <Reveal delay={0.15} className="lg:col-span-5">
              <ParallaxImage
                src={`${import.meta.env.BASE_URL}images/a-propos/portrait-edja.jpg`}
                alt="Prince Edja, storyteller et producteur audiovisuel"
                ratio="4/5"
                range={4}
                zoomOnHover
                // Premier élément peint de la page : en `lazy`, le plus grand contenu
                // arrivait après le défilement.
                priority
                className="rounded-t-[9rem] rounded-b-xl"
              />
              <p className="label-caps mt-4 text-center text-ink-500">{SITE.localisation}</p>
            </Reveal>
          </div>

          {/* Sommaire : la page réunit le parcours, l'audience, les offres, les études de
              cas et le formulaire. Sans lui, une page aussi longue deviendrait un
              défilement sans repère. */}
          <nav aria-label="Sommaire de la page" className="mt-16 border-t border-sand-200 pt-8">
            <ul className="flex flex-wrap gap-2">
              {SOMMAIRE.map((entree) => (
                <li key={entree.ancre}>
                  <a
                    href={`#${entree.ancre}`}
                    className="inline-flex min-h-11 items-center rounded-md border border-sand-300 px-4 text-caption font-semibold text-ink-700 transition-colors duration-(--d-fast) hover:bg-sand-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
                  >
                    {entree.libelle}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </Container>

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: 'Prince Edja',
              alternateName: 'Edja Kouamey Franck Arnaud',
              jobTitle: [
                'Storyteller',
                'Producteur audiovisuel',
                'Consultant en marketing touristique',
              ],
              email: `mailto:${SITE.email}`,
              address: { '@type': 'PostalAddress', addressLocality: 'Abidjan', addressCountry: 'CI' },
              sameAs: [SITE.linkedin],
              award: [
                ...MILESTONES.filter((m) => m.periode >= '2024').map((m) => m.titre),
                ...DISTINCTIONS.map((d) => d.titre),
              ],
            }),
          }}
        />
      </Section>

      <Section tone="light" className="scroll-mt-32" id="parcours">
        <Container>
          <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
            <div className="space-y-8 lg:col-span-5">
              <Eyebrow num="02">Le parcours</Eyebrow>
              <Reveal>
                <h2 className="font-display uppercase text-display-lg">
                  Onze ans au service du récit<span aria-hidden className="text-clay-500">.</span>
                </h2>
              </Reveal>
              <p className="text-body text-ink-500">
                Étapes encore à documenter : {ETAPES_MANQUANTES.join(', ')}. Aucune date ni
                aucun fait ne sera avancé sans source.
              </p>
            </div>

            <ol className="relative space-y-12 border-l border-sand-200 pl-8 lg:col-span-7">
              {MILESTONES.map((milestone, index) => {
                const isRecent =
                  milestone.periode.startsWith('2025') || milestone.periode.startsWith('2026')
                return (
                  <li key={`${milestone.periode}-${milestone.titre}`} className="relative">
                    <span
                      aria-hidden
                      className={
                        isRecent
                          ? 'absolute -left-[37px] top-1.5 size-2.5 rounded-full bg-leaf-600 ring-4 ring-sand-200'
                          : 'absolute -left-[37px] top-1.5 size-2.5 rounded-full bg-clay-500 ring-4 ring-sand-50'
                      }
                    />
                    <Reveal delay={index * 0.06}>
                      <p className="label-caps text-leaf-600">{milestone.periode}</p>
                      <h3 className="mt-2 font-display uppercase text-heading-sm text-ink-900">
                        {milestone.titre}
                      </h3>
                      <p className="mt-2 max-w-xl text-body text-ink-500">
                        {milestone.description}
                      </p>
                    </Reveal>
                  </li>
                )
              })}
            </ol>
          </div>
        </Container>
      </Section>

      <Section tone="light" className="scroll-mt-32 bg-sand-150" id="engagements">
        <Container className="space-y-8">
          <div className="space-y-2">
            <Eyebrow num="03">Ce que je défends</Eyebrow>
            <h2 className="font-display uppercase text-display-lg">
              Cinq engagements<span aria-hidden className="text-clay-500">.</span>
            </h2>
          </div>
          <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {ENGAGEMENTS.map((engagement) => (
              <div
                key={engagement.titre}
                className="rounded-xl border border-sand-200 bg-sand-50 p-6"
              >
                <h3 className="font-display uppercase text-heading-sm text-ink-900">
                  {engagement.titre}
                </h3>
                <p className="mt-2 text-body text-ink-500">{engagement.texte}</p>
              </div>
            ))}
          </Stagger>
        </Container>
      </Section>

      <Audience />
      <Offres />
      <EtudesCas />

      <Section tone="light" className="scroll-mt-32 bg-sand-150" id="collaborer">
        <Container className="space-y-10">
          <div className="space-y-2">
            <Eyebrow num="07">Collaborer</Eyebrow>
            <h2 className="font-display uppercase text-display-lg">
              Parlons de votre projet<span aria-hidden className="text-clay-500">.</span>
            </h2>
            <p className="max-w-2xl text-body text-ink-500">
              Entreprise, pays, type de collaboration, calendrier, budget optionnel et
              message. L'équipe répond directement.
            </p>
          </div>
          <FormulaireB2B />
        </Container>
      </Section>
    </>
  )
}
