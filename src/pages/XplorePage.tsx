import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { EpisodesIndex } from '@/components/sections/xplore/EpisodesIndex'
import { FeaturedFilm } from '@/components/sections/xplore/FeaturedFilm'
import { GuidesGrid } from '@/components/sections/xplore/GuidesGrid'

export default function XplorePage() {
  useSeo({
    title: "X'PLORE Côte d'Ivoire — Prince Edja",
    description:
      'Série documentaire : six routes, six histoires, une caméra à hauteur d’homme pour révéler la Côte d’Ivoire aux Ivoiriens — et au monde.',
  })

  return (
    <>
      <Section tone="dark" className="pt-36 lg:pt-48">
        <Container>
          <div className="max-w-4xl space-y-6">
            <Eyebrow num="02" tone="dark">
              Série documentaire · Saison 1
            </Eyebrow>
            <h1 className="font-display uppercase text-display-lg">
              Six routes. Six histoires
              <span aria-hidden className="text-clay-500">.</span>
            </h1>
            <Reveal delay={0.1}>
              <blockquote className="border-l-2 border-gold-400 pl-6 font-quote italic leading-snug text-heading-sm text-cream-100 sm:text-heading-md">
                « On protège ce que l’on a vu. X’PLORE montre avant de convaincre. »
              </blockquote>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="max-w-2xl text-body-lg text-cream-100/70">
                La nature, la mémoire, les lieux et celles et ceux qui leur donnent un sens. Chaque
                épisode de 26 minutes prend la route et revient avec un récit de cinéma.
              </p>
            </Reveal>
          </div>

          <div className="mt-20">
            <EpisodesIndex />
          </div>
        </Container>
      </Section>

      <FeaturedFilm />
      <GuidesGrid />
    </>
  )
}
