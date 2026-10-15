import { Link, useParams } from 'react-router'
import { DESTINATIONS } from '@/data/destinations'
import { EPISODES, BIJOUX } from '@/data/content'
import { useSeo } from '@/hooks/useSeo'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { LazyImage } from '@/components/media/LazyImage'
import { BlocNewsletter } from '@/components/newsletter/BlocNewsletter'

/** Ce que la page destination doit porter et que les données n'ont pas encore. */
const SECTIONS_A_FOURNIR = [
  'Photos',
  'Histoire du lieu',
  'Personnages',
  'Carnet de route',
  'Bonnes adresses',
]

export default function DestinationPage() {
  const { slug } = useParams<{ slug: string }>()
  const { l, t } = useLangue()

  const destination = DESTINATIONS.find((item) => item.slug === slug)
  const episode = EPISODES.find((item) => item.slug === destination?.episodeSlug)

  useSeo({
    title: destination
      ? `${destination.nom} · X'PLORE Côte d'Ivoire`
      : 'Destination · X\'PLORE',
    description: episode?.pitch,
    indexable: Boolean(episode),
  })

  if (!destination || !episode) {
    return (
      <Section tone="light" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="space-y-4">
          <h1 className="font-display uppercase text-display-lg">Destination introuvable.</h1>
          <Button to="/xplore" variant="dark">
            Retour à la série
          </Button>
        </Container>
      </Section>
    )
  }

  /** Passerelle vers le Shop : les pièces dont le thème rejoint celui de l'épisode. */
  const produitsLies = BIJOUX.filter(
    (bijou) =>
      episode.tags.theme?.some((theme) => bijou.culture.includes(theme)) ||
      bijou.tags.theme?.some((theme) => episode.tags.theme?.includes(theme)),
  ).slice(0, 3)

  return (
    <>
      <Section tone="dark" padded={false} container={false} className="relative pt-32 pb-20 lg:pt-44 lg:pb-28">
        <div aria-hidden className="absolute inset-0">
          <img src={episode.image} alt="" className="h-full w-full object-cover" />
          <div className="overlay-cinema absolute inset-0" />
          <div className="overlay-hero-scrim absolute inset-0" />
        </div>
        <Container className="relative space-y-6">
          <Breadcrumb className="[&_a]:text-cream-100/60 [&_span]:text-cream-100/80" />
          <Eyebrow num={episode.numero} tone="dark">
            Étape {destination.nom}
          </Eyebrow>
          <h1 className="font-display uppercase text-display-lg text-cream-100">
            {destination.nom}
          </h1>
          <p className="max-w-2xl text-body-lg text-cream-100/80">{episode.pitch}</p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button to={`/xplore/${episode.slug}`} variant="primary">
              Voir le film
            </Button>
            {destination.guide && (
              <Button href={destination.guide} external variant="ghost-light">
                Télécharger le guide
              </Button>
            )}
          </div>
        </Container>
      </Section>

      <Section tone="light">
        <Container className="space-y-10">
          <div className="space-y-2">
            <Eyebrow num="01">Le lieu</Eyebrow>
            <h2 className="font-display uppercase text-display-lg">
              Ce que le territoire raconte
              <span aria-hidden className="text-clay-500">.</span>
            </h2>
          </div>
          <p className="max-w-2xl text-body-lg text-ink-700">
            {l({
              fr: 'Histoire, personnages, carnet et bonnes adresses seront fournis par la maison. La page est prête à les recevoir sans changement de code.',
              en: 'History, characters, travel notes and recommendations will be provided by the house. The page is ready to receive them without code changes.',
            })}
          </p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {SECTIONS_A_FOURNIR.map((section) => (
              <li
                key={section}
                className="rounded-xl border border-dashed border-sand-300 px-5 py-4 text-body text-ink-500"
              >
                {section} · {t('preuves.aFournir')}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      {produitsLies.length > 0 && (
        <Section tone="light" className="bg-sand-150">
          <Container className="space-y-10">
            <div className="space-y-2">
              <Eyebrow num="02">Passerelle</Eyebrow>
              <h2 className="font-display uppercase text-display-lg">
                Objets liés à l’étape
                <span aria-hidden className="text-clay-500">.</span>
              </h2>
            </div>
            <ul className="grid grid-cols-2 gap-1 sm:grid-cols-3">
              {produitsLies.map((bijou) => (
                <li key={bijou.slug}>
                  <Link
                    to={`/boutique/${bijou.slug}`}
                    className="group block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600"
                  >
                    <LazyImage
                      src={bijou.image}
                      alt={bijou.nom}
                      ratio="4/5"
                      className="overflow-hidden rounded-md bg-sand-200"
                    />
                    <p className="mt-3 px-3 font-display text-[11px] uppercase leading-none tracking-[0.18em] text-ink-900">
                      {bijou.nom}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          </Container>
        </Section>
      )}

      <BlocNewsletter />
    </>
  )
}
