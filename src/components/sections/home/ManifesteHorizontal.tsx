import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

export function ManifesteHorizontal() {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const xLead = useTransform(scrollYProgress, [0, 1], ['-6vw', '6vw'])

  if (reducedMotion) {
    return (
      <section ref={ref} className="section-y bg-sand-50" aria-label="Manifeste">
        <h2 className="mx-auto max-w-5xl px-6 font-display uppercase text-display-lg text-ink-900">
          L’Afrique n’est pas une destination<span aria-hidden className="text-clay-500">.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-3xl px-6 font-quote italic text-heading-sm text-leaf-600">
          C’est une multitude de mondes.
        </p>
      </section>
    )
  }

  return (
    <section
      ref={ref}
      aria-label="Manifeste"
      className="section-y overflow-hidden bg-sand-50"
    >
      {/*
        Le titre ne se translate plus. En `display-xl` (jusqu'à 192 px) avec
        `whitespace-nowrap`, la phrase dépassait plusieurs fois la fenêtre et
        l'`overflow-hidden` la rognait : le titre structurel de la section n'était pas
        lisible. Il rejoint les mesures de la version « mouvement réduit », et seul le
        chapeau glisse encore — un déplacement court, qui reste dans le cadre.
      */}
      <h2 className="mx-auto max-w-5xl px-6 font-display uppercase text-display-lg text-ink-900">
        L’Afrique n’est pas une destination<span aria-hidden className="text-clay-500">.</span>
      </h2>
      <motion.p
        style={{ x: xLead }}
        className="mx-auto mt-6 max-w-3xl px-6 font-quote italic text-heading-sm text-leaf-600"
      >
        C’est une multitude de mondes.
      </motion.p>
    </section>
  )
}
