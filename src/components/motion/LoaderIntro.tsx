import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import {
  EASE_EXPO,
  EASE_QUART,
  introAlreadyPlayed,
  markIntroDone,
} from '@/lib/motion'
import { SITE } from '@/data/site'

const WORD_MS = 520
const BRAND_MS = 750
const TOTAL_MS = SITE.tagline.length * WORD_MS + BRAND_MS + 120

type Phase = 'words' | 'brand'

export function LoaderIntro() {
  const reducedMotion = useReducedMotion()
  const [done, setDone] = useState(() => reducedMotion === true || introAlreadyPlayed())
  const [phase, setPhase] = useState<Phase>('words')
  const [index, setIndex] = useState(0)

  useEffect(() => {
    if (done) return

    const timers: ReturnType<typeof setTimeout>[] = []
    SITE.tagline.forEach((_, i) => {
      if (i > 0) timers.push(setTimeout(() => setIndex(i), i * WORD_MS))
    })
    timers.push(
      setTimeout(() => setPhase('brand'), SITE.tagline.length * WORD_MS),
      setTimeout(() => {
        markIntroDone()
        setDone(true)
      }, TOTAL_MS),
    )

    return () => timers.forEach(clearTimeout)
  }, [done])

  if (done) return null

  return (
    <AnimatePresence>
      <motion.div
        key="loader"
        role="status"
        aria-label="Chargement du site Prince Edja"
        tabIndex={-1}
        onKeyDown={(event) => {
          if (event.key === 'Tab') event.preventDefault()
        }}
        exit={{ y: '-100%' }}
        transition={{ duration: 0.75, ease: EASE_QUART }}
        className="grain fixed inset-0 z-[70] flex flex-col items-center justify-center bg-night-900 text-cream-100"
      >
        <div className="relative flex h-28 items-center overflow-hidden">
          <AnimatePresence mode="wait">
            {phase === 'words' ? (
              <motion.p
                key={`word-${index}`}
                initial={{ y: '70%', opacity: 0 }}
                animate={{ y: '0%', opacity: 1 }}
                exit={{ y: '-70%', opacity: 0 }}
                transition={{ duration: WORD_MS / 1000 - 0.06, ease: EASE_QUART }}
                className="font-display uppercase text-display-lg"
              >
                {SITE.tagline[index]}
                <span aria-hidden className="text-gold-400">.</span>
              </motion.p>
            ) : (
              <motion.h2
                key="brand"
                initial={{ y: '110%' }}
                animate={{ y: '0%' }}
                transition={{ duration: 0.6, ease: EASE_EXPO }}
                className="font-display uppercase text-heading-md tracking-wide text-cream-100"
              >
                {SITE.name}
                <span aria-hidden className="text-clay-500">.</span>
              </motion.h2>
            )}
          </AnimatePresence>
        </div>

        <div
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-gold-400"
          style={{
            animation: `pe-progress ${TOTAL_MS}ms linear forwards`,
          }}
        />

        <motion.div
          aria-hidden
          className="absolute inset-x-0 top-full h-[12vh]"
          style={{ borderRadius: '0 0 100% 100%', background: '#14100B' }}
        />
      </motion.div>
    </AnimatePresence>
  )
}
