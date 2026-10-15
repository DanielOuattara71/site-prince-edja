import { ARCHIVE, NAVIGATION_ARCHIVE } from '@/data/archive'
import { useSeo } from '@/hooks/useSeo'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Reveal } from '@/components/motion/Reveal'
import { Stagger } from '@/components/motion/Stagger'
import { Button } from '@/components/ui/Button'

export default function ArchivePage() {
  const { l, t } = useLangue()

  useSeo({
    title: 'Archive d’Afrique · Projets & Histoires · Prince Edja',
    description:
      'Bibliothèque de mémoires : personnages, événements, traditions, objets, lieux, photographies et récits oraux.',
  })

  return (
    <>
      <Section tone="dark" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="space-y-6">
          <Eyebrow num="02" tone="dark">
            Archive d’Afrique
          </Eyebrow>
          <h1 className="font-display uppercase text-display-lg text-cream-100">
            Ce que nous ne racontons pas disparaît
            <span aria-hidden className="text-clay-500">.</span>
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
              <Eyebrow num="01">La bibliothèque</Eyebrow>
              <h2 className="font-display uppercase text-display-lg">
                Naviguer par<span aria-hidden className="text-clay-500">.</span>
              </h2>
            </div>
            {/* Les facettes sont annoncées comme telles. Habillées en puces cliquables
                (bordure, 44 px, semibold) sans aucune action, elles promettaient un
                filtre qui n'existe pas : elles deviennent des étiquettes. */}
            <div className="flex flex-wrap gap-2">
              {NAVIGATION_ARCHIVE.map((entree) => (
                <span key={entree} className="label-caps rounded-full bg-sand-200/70 px-4 py-2 text-ink-700">
                  {entree}
                </span>
              ))}
            </div>
            <p className="max-w-md text-caption text-ink-500">
              {l({
                fr: 'Ces axes de navigation s’activeront avec les entrées de la bibliothèque.',
                en: 'These navigation axes will switch on with the library entries.',
              })}
            </p>
          </div>

          <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ARCHIVE.map((entree) => (
              <Reveal key={entree.slug}>
                <article className="flex h-full flex-col justify-between gap-4 rounded-xl border border-dashed border-sand-300 p-6">
                  <div className="space-y-2">
                    <p className="label-caps text-ink-500">{entree.categorie}</p>
                    <h3 className="font-display uppercase text-heading-sm text-ink-900">
                      {entree.titre}
                    </h3>
                  </div>
                  <p className="text-caption text-ink-500">
                    {l({
                      fr: 'Contenu et sources à fournir. Une entrée sans source n’est pas publiable.',
                      en: 'Content and sources to be provided. An entry without sources is not publishable.',
                    })}
                  </p>
                </article>
              </Reveal>
            ))}
          </Stagger>

          <div className="rounded-xl border border-sand-200 bg-sand-100 p-8">
            <h2 className="font-display uppercase text-heading-md">Rigueur éditoriale</h2>
            <p className="mt-3 max-w-2xl text-body text-ink-700">
              {l({
                fr: 'Trois niveaux sont distingués sur chaque entrée : l’histoire documentée (sources citées), la mémoire orale (récits recueillis) et l’interprétation (lecture de la maison). Le modèle de données rend une entrée sans source non publiable.',
                en: 'Three levels are distinguished on each entry: documented history (cited sources), oral memory (collected accounts) and interpretation (the house’s reading). The data model makes an entry without sources unpublishable.',
              })}
            </p>
            <p className="mt-4 text-caption text-ink-500">
              {l({
                fr: 'Aucun contenu historique n’est rédigé par le développeur : les textes et les sources viennent de la maison.',
                en: 'No historical content is written by the developer: texts and sources come from the house.',
              })}
            </p>
            <div className="mt-6">
              <Button to="/contact" variant="dark">
                {l({ fr: 'Proposer une entrée ou une source', en: 'Submit an entry or a source' })}
              </Button>
            </div>
          </div>

          <p className="sr-only">{t('legal.aFournir')}</p>
        </Container>
      </Section>
    </>
  )
}
