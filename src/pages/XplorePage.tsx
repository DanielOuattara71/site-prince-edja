import { useSeo } from '@/hooks/useSeo'
import { lazy, Suspense } from 'react'
import { Section } from '@/components/layout/Section'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { AlbumScroll } from '@/components/sections/xplore/AlbumScroll'
import { FeaturedFilm } from '@/components/sections/xplore/FeaturedFilm'
import { GuidesGrid } from '@/components/sections/xplore/GuidesGrid'
import { DESTINATIONS } from '@/data/destinations'

// Leaflet (~40 Ko + sa feuille de style) n'est chargé que sur cette page : la carte
// n'existe nulle part ailleurs, le reste du site ne paie rien.
const CarteParcours = lazy(() =>
  import('@/components/xplore/CarteParcours').then((m) => ({ default: m.CarteParcours })),
)

export default function XplorePage() {
  useSeo({
    title: "X'PLORE Côte d'Ivoire · Prince Edja",
    description:
      'Série documentaire : six routes, six histoires, une caméra à hauteur d’homme pour révéler la Côte d’Ivoire aux Ivoiriens et au monde.',
  })

  return (
    <>
      <Section tone="dark" container={false} padded={false} className="pt-32 pb-20 lg:pt-44 lg:pb-28">
        <Container className="max-w-3xl space-y-6">
          <Eyebrow tone="dark">
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
            src={`${import.meta.env.BASE_URL}images/xplore/bandeau-foret.jpg`}
            alt="La forêt de Taï, X'PLORE Côte d'Ivoire"
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

      <Section tone="light" className="bg-sand-150">
        <Container className="space-y-8">
          <div className="space-y-2">
            <Eyebrow>La carte</Eyebrow>
            <h2 className="font-display uppercase text-display-lg">
              Six étapes, une saison
              <span aria-hidden className="text-clay-500">.</span>
            </h2>
            <p className="max-w-2xl text-body text-ink-500">
              Les six étapes de la saison, sur la carte de la Côte d'Ivoire. Cliquez sur
              une étape pour ouvrir sa fiche. Les saisons suivantes s'ajouteront au même
              réseau.
            </p>
          </div>
          <Suspense
            fallback={
              <div
                aria-hidden
                className="cadre-carte w-full rounded-md border border-sand-200 bg-sand-100"
              />
            }
          >
            <CarteParcours etapes={DESTINATIONS} />
          </Suspense>
        </Container>
      </Section>

      <AlbumScroll />

      <FeaturedFilm />
      <GuidesGrid />
    </>
  )
}
