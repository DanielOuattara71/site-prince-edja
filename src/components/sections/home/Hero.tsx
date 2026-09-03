import { motion, useReducedMotion } from 'motion/react'
import { ArrowDown } from 'lucide-react'
import { SITE } from '@/data/site'
import { introDelay, EASE_EXPO } from '@/lib/motion'
import { Container } from '@/components/layout/Container'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { TextRevealLines } from '@/components/motion/TextRevealLines'
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
    <section className="grain relative flex min-h-svh flex-col justify-end overflow-hidden bg-night-900 text-cream-100 lg:min-h-[92svh]">
      {/* Photo plein écran - plus visible */}
      <div aria-hidden className="absolute inset-0">
        <ParallaxImage src={SITE.heroImage} alt="" priority className="h-full w-full" />
        {/* Overlays allégés pour laisser respirer la photo */}
        <div className="overlay-hero-warm absolute inset-0 opacity-45" />
        <div className="overlay-cinema absolute inset-0 opacity-55" />
        <div className="overlay-hero-scrim absolute inset-0 opacity-85" />
      </div>

      {/* Filigrane GRIOT 2.0 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[18%] hidden select-none overflow-hidden lg:block"
      >
        <p className="font-display whitespace-nowrap text-center text-[clamp(9rem,18vw,20rem)] leading-none tracking-[-0.04em] text-cream-100/[0.035]">
          GRIOT 2.0
        </p>
      </div>

      <Container className="relative z-10 pt-28 pb-10 sm:pb-16 lg:pt-32">
        <div className="max-w-3xl space-y-6">
          <TextRevealLines
            as="h1"
            lines={['PRINCE EDJA']}
            delay={base + 0.22}
            className="font-display uppercase text-heading-md text-cream-100"
          />

          <motion.p
            {...(reducedMotion ? {} : enter(base + 0.4))}
            className="font-display uppercase text-heading-sm tracking-wide text-gold-400"
          >
            {SITE.tagline.join(' · ')}
          </motion.p>

          <motion.p
            {...(reducedMotion ? {} : enter(base + 0.55))}
            className="max-w-xl text-body-lg text-cream-100/80"
          >
            {SITE.role}
          </motion.p>

          <motion.div
            {...(reducedMotion ? {} : enter(base + 0.72))}
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
