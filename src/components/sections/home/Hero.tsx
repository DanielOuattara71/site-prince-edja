import { motion, useReducedMotion } from 'motion/react'
import { SITE } from '@/data/site'
import { useLangue } from '@/i18n/contexteLangue'
import { introDelay, EASE_EXPO } from '@/lib/motion'
import { Container } from '@/components/layout/Container'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { TextRevealLines } from '@/components/motion/TextRevealLines'
import { AfricanPattern } from '@/components/motifs/AfricanPattern'
import { Button } from '@/components/ui/Button'

export function Hero() {
  const { t } = useLangue()
  const reducedMotion = useReducedMotion()
  const base = introDelay()

  const enter = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.75, ease: EASE_EXPO, delay },
  })

  return (
    <section
      data-theme-bare="dark"
      className="grain relative flex min-h-svh flex-col justify-end overflow-hidden bg-night-900 text-cream-100 lg:min-h-[92svh]"
    >
      {/* Photo plein écran - plus visible */}
      <div aria-hidden className="absolute inset-0">
        <ParallaxImage
          src={SITE.heroImage}
          srcSet={SITE.heroSrcSet}
          sizes={SITE.heroSizes}
          alt=""
          priority
          className="h-full w-full"
        />
        {/*
          Deux voiles, plus quatre. Le film noir global (`overlay-cinema`) assombrissait
          toute l'image à 55 % : la photo ne se lisait plus, et sa disparition suffit à
          établir le fond haut que la barre traverse. Restent la chaleur de marque,
          étalée sur la surface, et le scrim en bas — l'unique garde-fou de lisibilité
          du titre et de la citation.
        */}
        <div className="overlay-hero-warm absolute inset-0 opacity-25" />
        <div className="overlay-hero-scrim absolute inset-0 opacity-90" />
      </div>

      {/*
        Motif fourni, posé après la photo pour rester visible : un motif placé avant
        elle passe dessous et disparaît. Il reste sous le contenu (`z-10` sur le
        Container), en crème très atténuée sur le fond nuit.
      */}
      <AfricanPattern
        motif="lineaire-05"
        couleur="var(--color-cream-100)"
        opacite={0.07}
        className="right-0 top-16 hidden h-28 w-28 sm:block lg:top-20 lg:h-40 lg:w-40"
      />

      {/* Filigrane GRIOT 2.0 */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-[18%] hidden select-none overflow-hidden lg:block"
      >
        {/* `display-xl` et non un clamp écrit à la main : le filigrane entre dans
            l'échelle, et descend de 320 px à 192 px de haut. */}
        <p className="font-display whitespace-nowrap text-center text-display-xl leading-none tracking-[-0.04em] text-cream-100/[0.035]">
          GRIOT 2.0
        </p>
      </div>

      <Container className="relative z-10 pt-28 pb-10 sm:pb-16 lg:pt-32">
        <div className="max-w-3xl space-y-6">
          <TextRevealLines
            as="h1"
            lines={['PRINCE EDJA']}
            delay={base + 0.22}
            className="font-display uppercase text-display-lg leading-[0.92] text-cream-100"
          />

          <motion.p
            {...(reducedMotion ? {} : enter(base + 0.4))}
            className="font-display uppercase tracking-[0.18em] text-gold-400"
          >
            {SITE.signature}
          </motion.p>

          <motion.p
            {...(reducedMotion ? {} : enter(base + 0.55))}
            className="max-w-xl font-quote text-heading-sm italic text-cream-100 sm:text-heading-md"
          >
            {SITE.manifeste}
          </motion.p>

          <motion.div
            {...(reducedMotion ? {} : enter(base + 0.72))}
            className="flex flex-wrap gap-4 pt-2"
          >
            <Button to="/a-propos" variant="primary">
              {t('hero.ctaHistoire')}
            </Button>
            <Button to="/contact" variant="ghost-light">
              {t('hero.ctaTravailler')}
            </Button>
          </motion.div>
        </div>
      </Container>
    </section>
  )
}
