import { Link, useParams } from 'react-router'
import { useSeo, useJsonLd } from '@/hooks/useSeo'
import { descriptionEpisode } from '@/lib/descriptions'
import { EPISODES } from '@/acces/projets'
import { useLangue } from '@/i18n/contexteLangue'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'
import { Breadcrumb } from '@/components/layout/Breadcrumb'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { Reveal } from '@/components/motion/Reveal'
import { BlocNewsletter } from '@/components/newsletter/BlocNewsletter'

/*
 * Sections du gabarit que les données ne portent pas encore : trailer, synopsis long, note
 * d'intention, personnages, making-of, presse, crédits. Elles ne sont plus annoncées sur la page
 * (texte d'atelier, audit V2-03, décision § 8.5) : elles y entreront avec leur contenu.
 */

export default function EpisodeDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const episode = EPISODES.find((item) => item.slug === slug)
  const { t } = useLangue()

  useSeo({
    title: episode
      ? `${episode.titre} · ${episode.lieu} · X'PLORE`
      : 'Épisode · X\'PLORE Côte d’Ivoire',
    description: episode ? descriptionEpisode(episode) : undefined,
  })

  useJsonLd(
    episode
      ? {
          '@context': 'https://schema.org',
          '@type': 'Movie',
          name: episode.titre,
          description: episode.pitch,
          inLanguage: 'fr',
          genre: 'Documentaire',
          contentLocation: { '@type': 'Place', name: episode.lieu },
        }
      : null,
  )

  if (!episode) {
    return (
      <Section tone="dark" padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="space-y-4">
          <h1 className="font-display uppercase text-display-lg text-cream-100">
            Épisode introuvable.
          </h1>
          <Button to="/xplore" variant="ghost-light">
            Retour à la série
          </Button>
        </Container>
      </Section>
    )
  }

  return (
    <>
      <Section
        tone="dark"
        padded={false}
        container={false}
        className="relative pt-32 pb-20 lg:pt-44 lg:pb-28"
      >
        <div aria-hidden className="absolute inset-0">
          <ParallaxImage
            src={episode.image}
            alt=""
            priority
            range={5}
            className="absolute inset-0 h-[120%] w-full"
          />
          <div className="overlay-cinema absolute inset-0" />
          <div className="overlay-hero-scrim absolute inset-0" />
        </div>

        <Container className="relative space-y-6">
          <Breadcrumb className="[&_a]:text-cream-100/60 [&_span]:text-cream-100/80" />
          <Eyebrow num={episode.numero} tone="dark">
            Film · {episode.lieu}
          </Eyebrow>
          <h1 className="font-display uppercase text-display-lg text-cream-100">
            {episode.titre}
          </h1>
          <p className="max-w-2xl text-body-lg text-cream-100/80">{episode.pitch}</p>
          <p className="label-caps text-cream-100/60">
            {['Documentaire', episode.tags.annee, episode.tags.pays?.[0]]
              .filter(Boolean)
              .join(' · ')}
          </p>
        </Container>
      </Section>

      {/* Territoire : la carte dit où le film a été tourné. */}
      <Section tone="light">
        <Container className="space-y-8">
          <div className="space-y-2">
            <Eyebrow>Territoire</Eyebrow>
            <h2 className="font-display uppercase text-display-lg">
              {episode.lieu}
              <span aria-hidden className="text-clay-500">.</span>
            </h2>
          </div>
          <TerritoireEpisode lieu={episode.lieu} />
        </Container>
      </Section>

      {/* Le guide reste le seul document téléchargeable existant. */}
      {episode.guide && (
        <Section tone="light" className="bg-sand-150">
          <Container>
            <Reveal>
              <div className="flex flex-col items-start justify-between gap-6 rounded-xl border border-sand-200 bg-sand-50 p-8 sm:flex-row sm:items-center">
                <div className="space-y-2">
                  <Eyebrow>Carnet</Eyebrow>
                  <h2 className="font-display uppercase text-heading-md">
                    Le guide de l’étape
                  </h2>
                </div>
                <Button href={episode.guide} external variant="dark">
                  Télécharger le guide
                </Button>
              </div>
            </Reveal>
          </Container>
        </Section>
      )}

      <Section tone="light">
        <Container className="space-y-8">
          <div className="space-y-2">
            <Eyebrow>Ce projet</Eyebrow>
            <h2 className="font-display uppercase text-display-lg">
              Le voir, le programmer, le soutenir
              <span aria-hidden className="text-clay-500">.</span>
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button to="/contact" variant="primary">
              Programmer le film
            </Button>
            <Button
              href="mailto:contact@ohenetour.com?subject=Demande%20de%20dossier%20-%20X'PLORE"
              external
              variant="dark"
            >
              Demander le dossier
            </Button>
            <Button to="/contact" variant="ghost-dark">
              Sponsoriser
            </Button>
            <Button to="/contact" variant="ghost-dark">
              Être informé
            </Button>
          </div>
        </Container>
      </Section>

      <BlocNewsletter />

      {episode.guide && (
        <p className="sr-only">
          <Link to="/xplore">{t('nav.etiquette')}</Link>
        </p>
      )}
    </>
  )
}

/** Carte miniature du lieu de l'épisode. La carte complète est sur la page X'PLORE. */
function TerritoireEpisode({ lieu }: { lieu: string }) {
  const { l } = useLangue()

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-center">
      <p className="max-w-2xl text-body-lg text-ink-700">
        {l({
          fr: `Contexte culturel, environnemental et historique de ${lieu} : à rédiger avec la maison. La carte interactive de Côte d’Ivoire regroupe les six étapes de la saison.`,
          en: `Cultural, environmental and historical context of ${lieu}: to be written with the house. The interactive map of Côte d'Ivoire gathers the six stops of the season.`,
        })}
      </p>
      <Link
        to="/xplore"
        className="group inline-flex min-h-11 items-center gap-2 text-button font-semibold text-clay-600"
      >
        {l({ fr: 'Voir la carte des étapes', en: 'View the map of stops' })}
      </Link>
    </div>
  )
}
