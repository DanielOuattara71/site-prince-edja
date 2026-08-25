import { useState } from 'react'
import { EPISODES } from '@/data/content'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Stagger } from '@/components/motion/Stagger'
import { FloatingPreview } from '@/components/motion/FloatingPreview'
import { FilmRow } from '@/components/cards/FilmRow'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { Button } from '@/components/ui/Button'

export function FilmsList() {
  const [activeImage, setActiveImage] = useState<string | null>(null)

  return (
    <Section tone="dark">
      <Container>
        <div className="mb-12 flex flex-col justify-between gap-8 sm:items-end lg:flex-row lg:items-end">
          <SectionHeading
            eyebrow="OHENE Prod"
            num="03"
            tone="dark"
            title={
              <>
                Des films qui changent
                <br />
                le regard<span aria-hidden className="text-clay-500">.</span>
              </>
            }
            lead="Six épisodes X’PLORE, une caméra à hauteur d’homme : la Côte d’Ivoire révélée aux Ivoiriens — et au monde."
          />
        </div>

        <div onMouseLeave={() => setActiveImage(null)} className="border-b border-cream-100/15">
          <Stagger>
            {EPISODES.map((episode) => (
              <FilmRow
                key={episode.slug}
                numero={episode.numero}
                titre={episode.titre}
                lieu={episode.lieu}
                pitch={episode.pitch}
                image={episode.image}
                to="/xplore"
                onEnter={() => setActiveImage(episode.image)}
                onLeave={() => setActiveImage(null)}
              />
            ))}
          </Stagger>
        </div>

        <div className="flex justify-center pt-14">
          <Button to="/taste-and-travel" variant="ghost-light">
            Taste & Travel — le film
          </Button>
        </div>

        <FloatingPreview src={activeImage} />
      </Container>
    </Section>
  )
}
