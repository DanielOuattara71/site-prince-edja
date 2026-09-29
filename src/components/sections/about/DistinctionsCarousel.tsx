import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { Distinction } from '@/types'
import { DISTINCTIONS as SEED } from '@/data/distinctions'
import { useAdminStore } from '@/lib/adminStore'
import { DUR, EASE_EXPO } from '@/lib/motion'
import { cn } from '@/lib/cn'
import { Container } from '@/components/layout/Container'
import { SectionMarker } from '@/components/ui/SectionMarker'
import { Reveal } from '@/components/motion/Reveal'

function isPlaceholder(src: string): boolean {
  return src.includes('placeholder')
}

function Card({ d }: { d: Distinction }) {
  const placeholder = isPlaceholder(d.image)
  const [open, setOpen] = useState(false)
  return (
    <li className="group flex w-[88vw] max-w-[560px] shrink-0 snap-center flex-col overflow-hidden rounded-feature border border-sand-200/70 bg-white/80 backdrop-blur-sm transition duration-500 hover:-translate-y-0.5">
      {/* Photo entièrement visible — luxueuse mais non masquée */}
      <div className="relative aspect-[4/3] max-h-[62vh] overflow-hidden bg-sand-100 sm:aspect-[3/2]">
        {placeholder ? (
          <div className="grain flex h-full w-full flex-col items-center justify-center bg-night-900 p-8 text-center">
            <span className="rounded-full border border-gold-400/30 px-4 py-1.5">
              <span className="label-caps text-gold-400">{d.annee} · template</span>
            </span>
            <p className="mt-5 max-w-[18ch] font-display uppercase text-heading-sm leading-none text-cream-100/80">{d.titre}</p>
            <p className="mt-3 text-xs tracking-wide text-cream-100/60">Grande photo — remplace ce template</p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-full w-full"
            aria-label={`Agrandir ${d.titre} — plein écran`}
          >
            <img
              src={d.image}
              alt={d.titre}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 88vw, 560px"
              className="h-full w-full object-cover transition duration-700 ease-expo group-hover:scale-[1.03]"
            />
          </button>
        )}
        <span className="label-caps pointer-events-none absolute left-4 top-4 rounded-full border border-white/10 bg-night-900/50 px-3.5 py-1.5 text-cream-100/80 backdrop-blur-md">
          {d.annee}
        </span>
        {!placeholder && (
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-cream-100/80 px-3 py-1 text-[10px] font-semibold tracking-wide text-ink-700 opacity-0 backdrop-blur transition group-hover:opacity-100">
            Cliquer pour agrandir
          </span>
        )}
      </div>

      {open && !placeholder && (
        <button
          type="button"
          aria-label="Fermer l’agrandissement"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-night-900/85 p-4 backdrop-blur-sm lg:p-10"
        >
          <img src={d.image} alt={d.titre} className="max-h-[90vh] max-w-[92vw] rounded-2xl object-contain" />
        </button>
      )}

      <div className="flex flex-1 flex-col gap-3 p-7">
        <p className="label-caps flex items-center gap-2 text-leaf-600">
          <span aria-hidden className="size-1.5 rounded-full bg-gold-400" />
          {d.delivreePar ?? 'Distinction'}
        </p>
        <h3 className="font-display uppercase text-heading-sm leading-[0.95] text-ink-900 sm:text-heading-md">{d.titre}</h3>
        <p className="text-sm leading-relaxed text-ink-500">{d.description}</p>
        {d.url && (
          <a
            href={d.url}
            target="_blank"
            rel="noreferrer"
            className="mt-auto inline-flex items-center gap-1.5 pt-2 text-sm font-semibold text-ink-700 underline-offset-4 hover:text-clay-600 hover:underline"
          >
            Voir la source →
          </a>
        )}
      </div>
    </li>
  )
}

export function DistinctionsCarousel({ distinctions }: { distinctions?: Distinction[] }) {
  const reduced = useReducedMotion()
  const ref = useRef<HTMLDivElement>(null)
  const store = useAdminStore()
  const [items, setItems] = useState<Distinction[]>(() => distinctions ?? SEED)
  const [index, setIndex] = useState(0)

  // charge depuis localStorage (éditable admin) si disponible
  useEffect(() => {
    if (distinctions) return
    try {
      const v = store.distinctions.get()
      if (v.length) setItems(v)
    } catch {
      /* ignore */
    }
  }, [distinctions, store])

  const scrollTo = (i: number) => {
    const el = ref.current
    if (!el) return
    const target = Math.max(0, Math.min(items.length - 1, i))
    const child = el.children[target] as HTMLElement | undefined
    if (child) child.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', inline: 'center', block: 'nearest' })
    setIndex(target)
  }

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    const center = el.scrollLeft + el.clientWidth / 2
    let best = 0
    let bestDist = Number.POSITIVE_INFINITY
    Array.from(el.children).forEach((child, i) => {
      const c = child as HTMLElement
      const cc = c.offsetLeft + c.clientWidth / 2
      const d = Math.abs(cc - center)
      if (d < bestDist) {
        bestDist = d
        best = i
      }
    })
    setIndex(best)
  }

  if (!items.length) {
    return (
      <section aria-label="Mes distinctions" className="section-y bg-sand-50">
        <Container>
          <p className="text-ink-500">Aucune distinction ajoutée.</p>
        </Container>
      </section>
    )
  }

  if (reduced) {
    return (
      <section aria-label="Mes distinctions" className="section-y bg-sand-50">
        <Container>
          <SectionMarker num="03" eyebrow={<>Mes distinctions</>} />
          <h2 className="mt-4 max-w-3xl font-display uppercase text-display-lg">
            Des moments qui comptent<span aria-hidden className="text-clay-500">.</span>
          </h2>
          <p className="mt-3 max-w-2xl text-body-lg text-ink-500">Photos et récits de moments forts, ajoutés depuis l’admin.</p>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((d) => (
              <Card key={d.id} d={d} />
            ))}
          </ul>
        </Container>
      </section>
    )
  }

  return (
    <section aria-label="Mes distinctions" className="section-y overflow-hidden bg-sand-50">
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <SectionMarker num="03" eyebrow={<>Mes distinctions</>} />
              <h2 className="mt-4 max-w-3xl font-display uppercase text-display-lg">
                Des moments qui comptent<span aria-hidden className="text-clay-500">.</span>
              </h2>
              <p className="mt-3 max-w-2xl text-body-lg text-ink-500">
                Photos et récits de moments forts — templates remplaçables depuis l’espace admin.
              </p>
            </div>
            <div className="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                aria-label="Précédent"
                onClick={() => scrollTo(index - 1)}
                className="flex size-11 items-center justify-center rounded-full border border-sand-200 bg-white text-ink-700 hover:bg-ink-900 hover:text-cream-100"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Suivant"
                onClick={() => scrollTo(index + 1)}
                className="flex size-11 items-center justify-center rounded-full border border-sand-200 bg-white text-ink-700 hover:bg-ink-900 hover:text-cream-100"
              >
                <ChevronRight className="size-5" />
              </button>
            </div>
          </div>
        </Reveal>
      </Container>

      <Reveal delay={0.12} y={24}>
        <div className="relative mt-10">
          <motion.div
            ref={ref}
            aria-roledescription="carousel"
            onScroll={onScroll}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: DUR.reveal, ease: EASE_EXPO, delay: 0.08 }}
            className={cn(
              'flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 scrollbar-none lg:px-8',
              'scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            )}
          >
            <span aria-hidden className="shrink-0 basis-6 lg:basis-8" />
            {items.map((d, i) => (
              <motion.div
                key={d.id}
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: DUR.reveal, ease: EASE_EXPO, delay: 0.14 + i * 0.06 }}
              >
                <Card d={d} />
              </motion.div>
            ))}
            <span aria-hidden className="shrink-0 basis-6 lg:basis-8" />
          </motion.div>

          <Reveal delay={0.22} y={12} className="mt-6 flex items-center justify-center gap-3">
            <span className="tnum font-display text-sm tracking-wide text-ink-500">
              {String(index + 1).padStart(2, '0')} <span className="text-ink-300">/ {String(items.length).padStart(2, '0')}</span>
            </span>
            <span aria-hidden className="flex gap-1.5">
              {items.map((_, i) => (
                <span key={i} className={cn('h-1.5 rounded-full transition-all', i === index ? 'w-6 bg-clay-600' : 'w-1.5 bg-sand-200')} />
              ))}
            </span>
          </Reveal>
        </div>
      </Reveal>
    </section>
  )
}
