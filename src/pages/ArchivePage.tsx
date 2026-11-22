import { ARCHIVE, NAVIGATION_ARCHIVE } from '@/acces/projets'
import { libelleFiabilite } from '@/lib/fiabilite'
import { PROJETS } from '@/acces/projets'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { couvertureProjet } from '@/lib/visuels'

const PROJET_ARCHIVE = PROJETS.find((projet) => projet.slug === 'archive-dafrique')
import { useSeo } from '@/hooks/useSeo'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { Button } from '@/components/ui/Button'

export default function ArchivePage() {
  const { l } = useLangue()

  useSeo({
    title: 'Archive d’Afrique · Projets & Histoires · Prince Edja',
    description:
      'Bibliothèque de mémoires : personnages, événements, traditions, objets, lieux, photographies et récits oraux.',
  })

  return (
    <>
      <Section tone="dark" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        {PROJET_ARCHIVE?.image || PROJET_ARCHIVE?.bandeau ? (
          <div className="relative mb-10">
            <ParallaxImage
              src={couvertureProjet(PROJET_ARCHIVE)}
              alt={PROJET_ARCHIVE?.titre ?? 'Archive d’Afrique'}
              range={8}
              className="h-[70svh] lg:h-svh"
            />
            <div aria-hidden className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night-900/90 to-transparent" />
          </div>
        ) : null}
        <Container className="space-y-6">
          <Eyebrow tone="dark">Archive d’Afrique</Eyebrow>
          <h1 className="font-display uppercase text-display-lg text-cream-100">
            Ce que nous ne racontons pas disparaît
            <span aria-hidden className="text-clay-500">
              .
            </span>
          </h1>
          <p className="max-w-2xl text-body-lg text-cream-100/75">
            {l({
              fr: 'Personnages, événements, traditions, objets, lieux, photographies et récits oraux. Chaque entrée cite ses sources et distingue l’histoire documentée, la mémoire orale et l’interprétation.',
              en: 'People, events, traditions, objects, places, photographs and oral accounts. Each entry cites its sources and distinguishes documented history, oral memory and interpretation.',
            })}
          </p>
        </Container>
      </Section>

      <Section tone="light">
        <Container className="space-y-10">
          <div className="flex flex-wrap items-center justify-between gap-6">
            <div className="space-y-2">
              <Eyebrow>La bibliothèque</Eyebrow>
              <h2 className="font-display uppercase text-display-lg">
                Naviguer par
                <span aria-hidden className="text-clay-500">
                  .
                </span>
              </h2>
            </div>
            {/* Les facettes sont annoncées comme telles. Habillées en puces cliquables
                (bordure, 44 px, semibold) sans aucune action, elles promettaient un
                filtre qui n'existe pas : elles deviennent des étiquettes. */}
            <div className="flex flex-wrap gap-2">
              {NAVIGATION_ARCHIVE.map((entree) => (
                <span
                  key={entree}
                  className="label-caps rounded-full bg-sand-200/70 px-4 py-2 text-ink-700"
                >
                  {entree}
                </span>
              ))}
            </div>
            <p className="max-w-md text-caption text-ink-500">
              {l({
                fr: 'Ces axes s’activeront lorsque les entrées porteront les informations correspondantes.',
                en: 'These axes will switch on when entries carry the matching information.',
              })}
            </p>
          </div>

          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ARCHIVE.map((entree) => {
              // Une entrée de la bibliothèque n'est rendue que si elle porte du contenu ;
              // les squelettes du CDC restent annoncés, sans texte inventé.
              const vide = entree.texte.trim() === '' && entree.sources.length === 0
              return (
                <Reveal key={entree.slug}>
                  <article
                    className={`flex h-full flex-col gap-4 rounded-xl p-6 ${
                      vide ? 'border border-dashed border-sand-300' : 'border border-sand-200 bg-sand-50'
                    }`}
                  >
                    <div className="space-y-2">
                      <p className="label-caps text-ink-500">{entree.categorie}</p>
                      <h3 className="font-display uppercase text-heading-sm text-ink-900">
                        {entree.titre}
                      </h3>
                      {entree.epoque ? (
                        <p className="text-caption text-ink-500">{entree.epoque}</p>
                      ) : null}
                      {entree.fiabilite ? (
                        <p className="label-caps inline-flex rounded-full bg-sand-200/70 px-3 py-1 text-ink-700">
                          {l(libelleFiabilite(entree.fiabilite))}
                        </p>
                      ) : null}
                    </div>
                    {vide ? (
                      <p className="label-caps text-ink-500">
                        {l({ fr: 'À venir', en: 'Coming soon' })}
                      </p>
                    ) : (
                      <div className="space-y-3 border-t border-sand-200 pt-3">
                        {entree.texte.trim() ? (
                          <p className="text-body text-ink-700">{entree.texte}</p>
                        ) : null}
                        {entree.sources.length > 0 ? (
                          <div className="space-y-1">
                            <p className="label-caps text-ink-500">
                              {l({ fr: 'Sources', en: 'Sources' })}
                            </p>
                            <ul className="list-disc space-y-1 pl-5 text-caption text-ink-700">
                              {entree.sources.map((source) => (
                                <li key={source}>{source}</li>
                              ))}
                            </ul>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </article>
                </Reveal>
              )
            })}
          </Stagger>

          <div className="rounded-xl border border-sand-200 bg-sand-100 p-8">
            <h2 className="font-display uppercase text-heading-md">Rigueur éditoriale</h2>
            <p className="mt-3 max-w-2xl text-body text-ink-700">
              {l({
                fr: 'Trois niveaux sont distingués sur chaque entrée : l’histoire documentée (sources citées), la mémoire orale (récits recueillis) et l’interprétation (lecture de la maison). Une entrée sans source n’est pas publiée.',
                en: 'Three levels are distinguished on each entry: documented history (cited sources), oral memory (collected accounts) and interpretation (the house’s reading). An entry without sources is not published.',
              })}
            </p>
            <div className="mt-6">
              <Button to="/contact" variant="dark">
                {l({ fr: 'Proposer une entrée ou une source', en: 'Submit an entry or a source' })}
              </Button>
            </div>
          </div>
        </Container>
      </Section>
    </>
  )
}
