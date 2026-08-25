import { motion, useReducedMotion } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { SITE } from '@/data/site'
import { introDelay, EASE_EXPO } from '@/lib/motion'
import { Container } from '@/components/layout/Container'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { TextRevealLines } from '@/components/motion/TextRevealLines'
import { Eyebrow } from '@/components/ui/Eyebrow'
import { Button } from '@/components/ui/Button'

export function Hero() {
  const reducedMotion = useReducedMotion()
  const base = introDelay()

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, ease: EASE_EXPO, delay },
  })

  return (
    <section className="grain relative flex min-h-svh flex-col justify-end overflow-hidden bg-night-900 text-cream-100">
      <div aria-hidden className="absolute inset-0">
        <ParallaxImage src={SITE.heroImage} alt="" priority className="h-full w-full" />
        <div className="overlay-cinema absolute inset-0" />
        <div className="overlay-vignette absolute inset-0" />
      </div>

      <Container className="relative z-10 pt-36 pb-20 sm:pb-28">
        <div className="space-y-6">
          <motion.div {...(reducedMotion ? {} : enter(base))}>
            <Eyebrow tone="dark">Griot 2.0 — Abidjan</Eyebrow>
          </motion.div>

          <TextRevealLines
            as="h1"
            lines={['PRINCE EDJA']}
            delay={base + 0.15}
            className="font-display uppercase text-display-xl"
          />

          <TextRevealLines
            lines={[SITE.tagline.join(' · ')]}
            delay={base + 0.4}
            className="font-quote italic text-body-lg text-gold-400"
          />

          <motion.p
            {...(reducedMotion ? {} : enter(base + 0.55))}
            className="max-w-xl text-body-lg text-cream-100/80"
          >
            {SITE.role}
          </motion.p>

          <motion.div
            {...(reducedMotion ? {} : enter(base + 0.7))}
            className="flex flex-wrap gap-4 pt-2"
          >
            <Button to="/a-propos" variant="primary">
              Découvrir le parcours
            </Button>
            <Button to="/contact" variant="ghost-light">
              Parlons-en
            </Button>
          </motion.div>
        </div>
      </Container>

      {!reducedMotion && (
        <motion.span
          aria-hidden
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', delay: base }}
          className="absolute right-6 bottom-6 z-10 hidden md:block lg:right-10"
        >
          <ArrowDown className="size-5 text-cream-100/60" />
        </motion.span>
      )}
    </section>
  )
}
