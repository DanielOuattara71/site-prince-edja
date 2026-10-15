import { EPISODES } from '@/data/content'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'

export function FeaturedFilm() {
  const featured = EPISODES[0]

  return (
    <Section tone="dark">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-12">
          <Reveal className="lg:col-span-7">
            <div className="relative overflow-hidden rounded-md">
              <ParallaxImage
                src={featured.image}
                alt={`Affiche du film ${featured.titre}`}
                ratio="16/9"
                range={3}
              />
              {/* Pas de glyphe de lecture : il n'y a pas de lecteur sur cette page, et
                  un bouton « play » qui ne joue rien est une promesse creuse. */}
            </div>
          </Reveal>

          <Reveal delay={0.12} className="lg:col-span-5">
            <div className="space-y-5">
              <Eyebrow num={featured.numero} tone="dark">
                Film · {featured.lieu}
              </Eyebrow>
              <h2 className="font-display uppercase text-display-lg">{featured.titre}</h2>
              <p className="text-body-lg text-cream-100/70">{featured.pitch}</p>
              <p className="text-body text-cream-100/60">
                Un film nature et mémoire, pensé avec une ambition visuelle internationale.
              </p>
              <Button
                href={`mailto:contact@ohenetour.com?subject=${encodeURIComponent(`Projection · ${featured.titre}`)}`}
                variant="primary"
              >
                Être informé de la projection
              </Button>
            </div>
          </Reveal>
        </div>
      </Container>
    </Section>
  )
}
