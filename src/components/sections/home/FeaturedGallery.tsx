import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { GALLERY, GALLERY_QUOTE } from '@/data/gallery'
import { cn } from '@/lib/cn'
import { Container } from '@/components/layout/Container'
import { Reveal } from '@/components/motion/Reveal'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { LazyImage } from '@/components/media/LazyImage'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Button } from '@/components/ui/Button'
import type { GalleryItem } from '@/types'

function GalleryCard({ item, className }: { item: GalleryItem; className?: string }) {
  return (
    <Link
      to={item.to}
      className={cn('group relative block overflow-hidden rounded-2xl', className)}
    >
      <ParallaxImage
        src={item.src}
        alt={item.alt}
        ratio={item.ratio}
        range={item.speed}
        zoomOnHover
      />
      {item.label && (
        <span className="label-caps absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-night-900/85 px-4 py-2 text-cream-100 backdrop-blur-sm">
          <span aria-hidden className="size-1.5 rounded-full bg-gold-400" />
          {item.label}
        </span>
      )}
      <span
        aria-hidden
        className="absolute bottom-4 right-4 z-10 flex size-10 translate-y-2 items-center justify-center rounded-full bg-cream-100 text-ink-900 opacity-0 transition-all duration-(--d-base) ease-expo group-hover:translate-y-0 group-hover:opacity-100"
      >
        <ArrowUpRight className="size-4" />
      </span>
    </Link>
  )
}

export function FeaturedGallery() {
  const [itemA, itemB, itemC, itemD, itemE, itemWide] = GALLERY

  return (
    <section aria-label="Galerie" className="bg-sand-50 pb-36 pt-24 lg:pt-32">
      <Container>
        <SectionHeading
          eyebrow="Carnet de route"
          num="02"
          title={
            <>
              Chaque image est une route
              <span aria-hidden className="text-clay-500">.</span>
            </>
          }
          lead="Films, bijoux, portraits : un aperçu du voyage en images — cliquez pour suivre la route."
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="grain flex h-full flex-col gap-8 rounded-2xl bg-night-900 p-8 text-cream-100 lg:p-10">
              <p className="label-caps text-gold-400">Revue de presse</p>
              <blockquote className="flex-1 font-quote italic leading-snug text-heading-sm">
                {GALLERY_QUOTE.texte}
              </blockquote>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <LazyImage
                    src={GALLERY_QUOTE.avatar}
                    alt={`Logo ou visuel ${GALLERY_QUOTE.source}`}
                    className="size-12 shrink-0 rounded-full"
                  />
                  <div>
                    <p className="font-display uppercase text-heading-sm">
                      {GALLERY_QUOTE.source}
                    </p>
                    <p className="label-caps text-cream-100/50">{GALLERY_QUOTE.date}</p>
                  </div>
                </div>
                <ArrowLink href={GALLERY_QUOTE.url} external tone="light" className="shrink-0">
                  Lire
                </ArrowLink>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08} className="lg:col-span-7">
            <GalleryCard item={itemA} className="h-full" />
          </Reveal>

          <Reveal className="lg:col-span-7">
            <GalleryCard item={itemB} />
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-5">
            <GalleryCard item={itemC} className="h-full" />
          </Reveal>

          <Reveal className="lg:col-span-5">
            <GalleryCard item={itemD} className="h-full" />
          </Reveal>
          <Reveal delay={0.08} className="lg:col-span-7">
            <GalleryCard item={itemE} />
          </Reveal>

          <Reveal className="lg:col-span-12">
            <GalleryCard item={itemWide} />
          </Reveal>
        </div>

        <Reveal className="relative z-10 mx-auto -mt-14 max-w-xl">
          <div className="flex flex-col items-center justify-between gap-4 rounded-3xl bg-sand-100 p-4 pl-8 shadow-xl ring-1 ring-sand-200 sm:flex-row sm:rounded-full">
            <p className="text-button font-semibold text-ink-900">
              Un projet, une histoire à raconter ?
            </p>
            <Button to="/contact" variant="primary" magnetic={false}>
              Parlons-en
            </Button>
          </div>
        </Reveal>
      </Container>
    </section>
  )
}
