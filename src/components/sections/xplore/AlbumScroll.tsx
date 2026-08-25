import { useRef, useState } from 'react'
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { MoveRight } from 'lucide-react'
import { EPISODES } from '@/data/content'
import type { Episode } from '@/types'
import { cn } from '@/lib/cn'
import { Button } from '@/components/ui/Button'

const COUNT = EPISODES.length

function Panel({ episode, index }: { episode: Episode; index: number }) {
  const alignRight = index % 2 === 1

  return (
    <article className="relative h-full w-screen shrink-0 overflow-hidden">
      <img
        src={episode.image}
        alt=""
        loading={index === 0 ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        className={cn(
          'absolute inset-0',
          alignRight
            ? 'bg-gradient-to-l from-night-900/90 via-night-900/30 to-transparent'
            : 'bg-gradient-to-r from-night-900/90 via-night-900/30 to-transparent',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute top-1/2 -translate-y-1/2 select-none font-display uppercase leading-none text-cream-100/10 text-[26vw]',
          alignRight ? 'left-0' : 'right-0',
        )}
      >
        {episode.numero}
      </span>

      <div
        className={cn(
          'relative z-10 flex h-full max-w-2xl flex-col justify-center gap-5 px-5 sm:px-8 lg:px-16 xl:px-20',
          alignRight && 'ml-auto text-right',
        )}
      >
        <p className="label-caps text-gold-400">
          Film {episode.numero} · {episode.lieu}
        </p>
        <h3 className="font-display uppercase text-cream-100 text-display-lg lg:text-display-xl">
          {episode.titre}
        </h3>
        <p className="text-body-lg text-cream-100/80">{episode.pitch}</p>
        <div className={cn('pt-2', alignRight && 'flex justify-end')}>
          <Button to={`/xplore/${episode.slug}`} variant="ghost-light">
            Voir l’épisode
          </Button>
        </div>
      </div>
    </article>
  )
}

export function AlbumScroll() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end'],
  })
  const x = useTransform(scrollYProgress, [0, 1], ['0vw', `-${(COUNT - 1) * 100}vw`])
  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0])
  const [index, setIndex] = useState(0)

  useMotionValueEvent(scrollYProgress, 'change', (value) => {
    setIndex(Math.min(COUNT - 1, Math.max(0, Math.floor(value * COUNT))))
  })

  if (reducedMotion) {
    return (
      <section aria-label="Album des épisodes" className="bg-night-900">
        {EPISODES.map((episode, index) => (
          <div key={episode.slug} className="h-screen">
            <Panel episode={episode} index={index} />
          </div>
        ))}
      </section>
    )
  }

  return (
    <section
      ref={sectionRef}
      aria-label="Album des épisodes — feuilletez en scrollant"
      className="relative bg-night-900"
      style={{ height: `${COUNT * 100}vh` }}
    >
      <div className="grain sticky top-0 h-screen overflow-hidden">
        <motion.div style={{ x }} className="flex h-full w-full">
          {EPISODES.map((episode, index) => (
            <Panel key={episode.slug} episode={episode} index={index} />
          ))}
        </motion.div>

        <div className="absolute inset-x-0 bottom-0 z-20 h-0.5 bg-cream-100/15">
          <motion.div
            style={{ scaleX: scrollYProgress }}
            className="h-full origin-left bg-gold-400"
          />
        </div>

        <p
          aria-hidden
          className="tnum absolute bottom-6 left-5 z-20 font-display uppercase text-heading-sm text-cream-100 lg:left-10"
        >
          {String(index + 1).padStart(2, '0')}
          <span className="text-cream-100/50"> / {String(COUNT).padStart(2, '0')}</span>
        </p>

        <motion.p
          style={{ opacity: hintOpacity }}
          className="label-caps absolute bottom-6 left-1/2 z-20 hidden -translate-x-1/2 items-center gap-2 text-cream-100/70 md:flex"
        >
          Scroll pour feuilleteer
          <MoveRight aria-hidden className="size-4 text-gold-400" />
        </motion.p>
      </div>
    </section>
  )
}
