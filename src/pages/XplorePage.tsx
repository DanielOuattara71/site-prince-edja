import { useSeo } from '@/hooks/useSeo'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { AlbumScroll } from '@/components/sections/xplore/AlbumScroll'
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
      <Section tone="dark" container={false} padded={false} className="pt-36 lg:pt-48 pb-0">
        <Container className="max-w-4xl space-y-6 pb-14 lg:pb-20">
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
        </Container>

        <div className="relative">
          <ParallaxImage
            src="/images/xplore/bandeau-foret.jpg"
            alt="La forêt de Taï — X'PLORE Côte d'Ivoire"
            ratio="21/9"
            range={8}
          />
          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-night-900/90 to-transparent" />
          <span className="label-caps absolute bottom-5 left-5 z-10 flex items-center gap-2 rounded-full bg-night-900/85 px-4 py-2 text-cream-100 backdrop-blur-sm lg:bottom-8 lg:left-10">
            <span aria-hidden className="size-1.5 rounded-full bg-gold-400" />
            Saison 1 · Six épisodes de 26 minutes
          </span>
        </div>
      </Section>

      <AlbumScroll />

      <FeaturedFilm />
      <GuidesGrid />
    </>
  )
}
