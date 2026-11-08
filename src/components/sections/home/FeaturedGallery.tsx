import { Link } from 'react-router'
import { GALLERY, GALLERY_QUOTE } from '@/acces/preuves'
import { cn } from '@/lib/cn'
import { Reveal } from '@/components/motion/Reveal'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { LazyImage } from '@/components/media/LazyImage'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { ArrowLink } from '@/components/ui/ArrowLink'
import { Button } from '@/components/ui/Button'
import { AfricanPattern } from '@/components/motifs/AfricanPattern'
import type { GalleryItem } from '@/types'

function GalleryCard({ item, className }: { item: GalleryItem; className?: string }) {
  return (
    <Link
      to={item.to}
      className={cn('group relative block overflow-hidden rounded-md', className)}
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
    </Link>
  )
}

export function FeaturedGallery() {
  const [itemA, itemB, itemC, itemD, itemE, itemWide] = GALLERY

  return (
    <section aria-label="Galerie" data-curseur="galerie" className="section-y bg-sand-50">
      {/* La galerie est pleine largeur : elle sort du `Container` (max-w-7xl) pour
          gagner le viewport, cadrée par les mêmes marges que les rangées bord à
          bord de la boutique (px-4 sm:px-6). Titre, grille et pastille partagent
          ces marges pour que les bords gauches restent alignés. */}
      <div className="mx-auto max-w-[80rem] px-4 sm:px-6">
        <SectionHeading
          eyebrow="Carnet de route"
          title={
            <>
              Chaque image est une route
              <span aria-hidden className="text-clay-500">.</span>
            </>
          }
          lead="Films, bijoux, portraits : un aperçu du voyage en images. Cliquez pour suivre la route."
        />
      </div>

      <div className="mx-auto mt-14 grid max-w-[80rem] gap-6 px-4 sm:px-6 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <div className="grain relative flex h-full flex-col gap-8 overflow-hidden rounded-xl bg-night-900 p-8 text-cream-100 lg:p-10">
              {/*
                Motif circulaire fourni, posé en crème très atténuée dans le coin libre
                de la carte. `-z-10` : dans la carte (qui est déjà une pile isolée via
                `grain`), il passe derrière le texte et le grain reste au-dessus.
              */}
              <AfricanPattern
                motif="circulaire-03"
                couleur="var(--color-cream-100)"
                opacite={0.07}
                className="-right-6 -top-6 -z-10 h-28 w-28 lg:h-36 lg:w-36"
              />
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
                    <p className="label-caps text-cream-100/60">{GALLERY_QUOTE.date}</p>
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

      <Reveal className="relative z-10 mx-auto -mt-14 max-w-[80rem] px-4 sm:px-6">
        <div className="mx-auto flex max-w-xl flex-col items-center justify-between gap-4 rounded-xl bg-sand-100 p-4 pl-8 border border-sand-200 sm:flex-row sm:rounded-full">
          <p className="text-button font-semibold text-ink-900">
            Un projet, une histoire à raconter ?
          </p>
          <Button to="/contact" variant="primary" magnetic={false}>
            Parlons-en
          </Button>
        </div>
      </Reveal>
    </section>
  )
}
