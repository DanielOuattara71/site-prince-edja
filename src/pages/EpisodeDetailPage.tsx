import { useParams } from 'react-router'
import { EPISODES } from '@/data/content'
import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'

export default function EpisodeDetailPage() {
  const { slug } = useParams()
  const episode = EPISODES.find((item) => item.slug === slug)

  useSeo({
    title: episode
      ? `${episode.titre} · ${episode.lieu} — X'PLORE`
      : 'Épisode — X\'PLORE Côte d’Ivoire',
    description: episode?.pitch,
  })

  if (!episode) {
    return (
      <Section tone="dark">
        <Container className="space-y-4 pt-24 lg:pt-36">
          <h1 className="font-display uppercase text-display-lg">Épisode introuvable.</h1>
          <Button to="/xplore" variant="ghost-light">
            Retour à la série
          </Button>
        </Container>
      </Section>
    )
  }

  return (
    <Section tone="dark" className="pt-36 lg:pt-48">
      <Container className="max-w-3xl space-y-6">
        <Eyebrow num={episode.numero} tone="dark">
          Film · {episode.lieu}
        </Eyebrow>
        <h1 className="font-display uppercase text-display-lg">{episode.titre}</h1>
        <p className="text-body-lg text-cream-100/70">{episode.pitch}</p>
        <p className="label-caps text-gold-400">
          Fiche complète en construction — projection bientôt annoncée
        </p>
        <div className="flex flex-wrap gap-4 pt-2">
          <Button href={`mailto:contact@ohenetour.com?subject=Projection%20${encodeURIComponent(episode.titre)}`}>
            Être informé de la projection
          </Button>
          <Button to="/xplore" variant="ghost-light">
            Tous les épisodes
          </Button>
        </div>
      </Container>
    </Section>
  )
}
