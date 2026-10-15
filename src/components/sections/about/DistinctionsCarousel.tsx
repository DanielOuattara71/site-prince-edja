import { useEffect, useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion, useReducedMotion } from 'motion/react'
import type { Distinction } from '@/types'
import { DISTINCTIONS as SEED } from '@/data/distinctions'
import { useAdminStore } from '@/lib/adminStore'
import { DUR, EASE_EXPO } from '@/lib/motion'
import { cn } from '@/lib/cn'
import { Container } from '@/components/layout/Container'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Reveal } from '@/components/motion/Reveal'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { usePiegeFocus } from '@/hooks/usePiegeFocus'

function isPlaceholder(src: string): boolean {
  return src.includes('placeholder')
}

function Card({ d }: { d: Distinction }) {
  const placeholder = isPlaceholder(d.image)
  const [open, setOpen] = useState(false)
  return (
    <article className="group relative h-full overflow-hidden rounded-[3px] border border-sand-200/70 bg-sand-50">
      {/*
        L'image occupe toute la carte ; les informations n'apparaissent qu'au survol,
        sous un voile encre. Le gabarit « photo à venir » garde son propre texte visible,
        car il n'a rien d'autre à montrer.
      */}
      <div className="relative aspect-[4/5] max-h-[70vh] overflow-hidden bg-sand-100">
        {placeholder ? (
          <div className="grain flex h-full w-full flex-col items-center justify-center bg-night-900 p-8 text-center">
            <span className="rounded-full border border-gold-400/30 px-4 py-1.5">
              <span className="label-caps text-gold-400">{d.annee} · template</span>
            </span>
            <p className="mt-5 max-w-[18ch] font-display uppercase text-heading-sm leading-none text-cream-100/80">
              {d.titre}
            </p>
            <p className="mt-3 text-caption tracking-wide text-cream-100/60">
              Grande photo, remplace ce template
            </p>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="h-full w-full"
            aria-label={`Agrandir ${d.titre} en plein écran`}
          >
            <img
              src={d.image}
              alt={d.titre}
              loading="lazy"
              decoding="async"
              sizes="(max-width: 640px) 88vw, 560px"
              className="h-full w-full object-cover transition duration-(--d-reveal) ease-expo group-hover:scale-[1.03] group-focus-within:scale-[1.03]"
            />
          </button>
        )}

        <span className="label-caps pointer-events-none absolute left-4 top-4 rounded-full border border-cream-100/10 bg-night-900/50 px-3.5 py-1.5 text-cream-100/80 backdrop-blur-md">
          {d.annee}
        </span>

        {/* Voile et informations : visibles au survol, au focus du clavier, et en
            permanence sur les écrans sans pointeur fin (pas de survol au doigt).
            Le gabarit garde son titre visible en permanence : il ne le répète donc
            pas dans le voile. */}
        <>
            <span
              aria-hidden
              className="absolute inset-0 bg-night-900/55 opacity-0 transition-opacity duration-(--d-base) group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100 motion-reduce:transition-none"
            />
            <span
              aria-hidden
              className="absolute inset-x-6 top-6 h-px origin-left scale-x-0 bg-gold-400 transition-transform duration-(--d-base) ease-expo group-hover:scale-x-100 group-focus-within:scale-x-100 pointer-coarse:scale-x-100 motion-reduce:transition-none"
            />
            <div className="pointer-events-none absolute inset-x-0 bottom-0 p-6">
              <div className="translate-y-2 opacity-0 transition-all duration-(--d-base) ease-expo group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:translate-y-0 group-focus-within:opacity-100 pointer-coarse:translate-y-0 pointer-coarse:opacity-100 motion-reduce:transition-none">
                <p className="label-caps flex items-center gap-2 text-cream-100">
                  <span aria-hidden className="size-1.5 rounded-full bg-gold-400" />
                  {d.delivreePar ?? 'Distinction'}
                </p>
                {!placeholder && (
                  <h3 className="mt-2 font-display uppercase text-heading-sm leading-[0.95] text-cream-100">
                    {d.titre}
                  </h3>
                )}
                <p className="mt-2 text-caption leading-relaxed text-cream-100/75">
                  {d.description}
                </p>
                {d.url && (
                  <a
                    href={d.url}
                    target="_blank"
                    rel="noreferrer"
                    className="pointer-events-auto mt-3 inline-flex items-center gap-1.5 text-caption font-semibold text-cream-100 underline-offset-4 hover:text-gold-400 hover:underline"
                  >
                    Voir la source →
                  </a>
                )}
              </div>
            </div>
            {!placeholder && (
              <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-cream-100/80 px-3 py-1 text-caption font-semibold tracking-wide text-ink-700 opacity-0 backdrop-blur transition group-hover:opacity-100 group-focus-within:opacity-100 pointer-coarse:opacity-100 motion-reduce:transition-none">
                Cliquer pour agrandir
              </span>
            )}
        </>
      </div>

      {open && !placeholder && <Agrandissement d={d} onFermer={() => setOpen(false)} />}
    </article>
  )
}

/**
 * Agrandissement plein écran d'une distinction.
 *
 * Même traitement que les autres surfaces modales du site (`BijouLightbox`,
 * `PanneauDemande`, `PanneauRecherche`) : dialogue annoncé, focus amené à
 * l'ouverture et rendu à la fermeture, Échap, arrière-plan verrouillé. La version
 * précédente était un simple bouton plein écran — aucun de ces points n'était traité.
 */
function Agrandissement({ d, onFermer }: { d: Distinction; onFermer: () => void }) {
  const surface = usePiegeFocus<HTMLDivElement>(true)
  useLockBodyScroll(true)
  const reduit = useReducedMotion()

  useEffect(() => {
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') onFermer()
    }
    document.addEventListener('keydown', surTouche)
    return () => document.removeEventListener('keydown', surTouche)
  }, [onFermer])

  return (
    <motion.div
      className="fixed inset-0 z-80 flex items-center justify-center bg-night-900/85 p-4 backdrop-blur-sm lg:p-10"
      initial={reduit ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: DUR.fast, ease: EASE_EXPO }}
    >
      <button
        type="button"
        aria-label="Fermer l’agrandissement"
        onClick={onFermer}
        className="absolute inset-0 cursor-zoom-out"
      />

      <div
        ref={surface}
        role="dialog"
        aria-modal="true"
        aria-label={d.titre}
        className="relative flex items-center justify-center"
      >
        <img
          src={d.image}
          alt={d.titre}
          className="max-h-[90vh] max-w-[92vw] rounded-md object-contain"
        />
      </div>
    </motion.div>
  )
}


/**
 * Entête de la section. Fourni par la page appelante : « Des moments qui comptent »
 * convient à la presse, pas à la page À propos, qui parle des distinctions.
 */
function Entete({ titre, lead }: { titre?: string; lead?: string }) {
  if (!titre) return null
  return (
    <div>
      <Eyebrow num="02">Mes distinctions</Eyebrow>
      <h2 className="mt-4 max-w-3xl font-display uppercase text-display-lg">
        {titre}
        <span aria-hidden className="text-clay-500">.</span>
      </h2>
      {lead && <p className="mt-3 max-w-2xl text-body-lg text-ink-500">{lead}</p>}
    </div>
  )
}

interface Props {
  /** Distinctions à afficher. Absent = celles de l'admin. */
  distinctions?: Distinction[]
  /** Titre de la section, fourni par la page appelante. */
  titre?: string
  /** Ligne d'appoint sous le titre. */
  lead?: string
  /** Espacement ou fond ajoutés par la page appelante. */
  className?: string
}

export function DistinctionsCarousel({ distinctions, titre, lead, className }: Props) {
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
      <section aria-label="Mes distinctions" className={cn("section-y bg-sand-50", className)}>
        <Container>
          <p className="text-ink-500">Aucune distinction ajoutée.</p>
        </Container>
      </section>
    )
  }

  if (reduced) {
    return (
      <section aria-label="Mes distinctions" className={cn("section-y bg-sand-50", className)}>
        <Container>
          <Entete titre={titre} lead={lead} />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((d) => (
              <Card key={d.id} d={d} />
            ))}
          </div>
        </Container>
      </section>
    )
  }

  return (
    <section aria-label="Mes distinctions" className={cn("section-y overflow-hidden bg-sand-50", className)}>
      <Container>
        <Reveal>
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Entete titre={titre} lead={lead} />
            <div className="hidden items-center gap-2 lg:flex">
              <button
                type="button"
                aria-label="Précédent"
                onClick={() => scrollTo(index - 1)}
                className="flex size-11 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-ink-700 hover:bg-ink-900 hover:text-cream-100"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                aria-label="Suivant"
                onClick={() => scrollTo(index + 1)}
                className="flex size-11 items-center justify-center rounded-full border border-sand-200 bg-sand-50 text-ink-700 hover:bg-ink-900 hover:text-cream-100"
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
              // La section est montée hors du Container de la page : la piste est déjà
              // pleine largeur, une gouttière suffit. Des marges négatives la
              // pousseraient au-delà de la fenêtre.
              'scroll-pl-4 px-4 sm:scroll-pl-6 sm:px-6',
              'flex snap-x snap-mandatory gap-[2px] overflow-x-auto pb-4',
              'scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
            )}
          >
            {items.map((d, i) => (
              <motion.div
                key={d.id}
                className="w-[calc(85vw-1px)] shrink-0 snap-start sm:w-[calc(33.333vw-2px)] lg:w-[calc(25vw-1px)]"
                initial={{ opacity: 0, y: 18, scale: 0.98 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: DUR.reveal, ease: EASE_EXPO, delay: 0.14 + i * 0.06 }}
              >
                <Card d={d} />
              </motion.div>
            ))}
          </motion.div>

          <Reveal delay={0.22} y={12} className="mt-6 flex items-center justify-center gap-3">
            <span className="tnum font-display text-caption tracking-wide text-ink-500">
              {String(index + 1).padStart(2, '0')} <span className="text-ink-500">/ {String(items.length).padStart(2, '0')}</span>
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
