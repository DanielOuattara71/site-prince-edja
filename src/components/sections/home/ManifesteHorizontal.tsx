import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'

export function ManifesteHorizontal() {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const xTitle = useTransform(scrollYProgress, [0, 1], ['10vw', '-34vw'])
  const xLead = useTransform(scrollYProgress, [0, 1], ['-18vw', '12vw'])

  if (reducedMotion) {
    return (
      <section ref={ref} className="section-y bg-sand-50" aria-label="Manifeste">
        <h2 className="mx-auto max-w-5xl px-6 font-display uppercase text-display-lg text-ink-900">
          L’Afrique n’est pas une destination<span aria-hidden className="text-clay-500">.</span>
        </h2>
        <p className="mx-auto mt-6 max-w-3xl px-6 font-quote italic text-heading-sm text-ink-500">
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
      <motion.h2
        style={{ x: xTitle }}
        className="whitespace-nowrap font-display uppercase text-display-lg text-ink-900 lg:text-display-xl"
      >
        L’Afrique n’est pas une destination<span aria-hidden className="text-clay-500">.</span>
      </motion.h2>
      <motion.p
        style={{ x: xLead }}
        className="mt-8 whitespace-nowrap pl-[24vw] font-quote italic text-body-lg text-ink-500 lg:text-heading-sm"
      >
        C’est une multitude de mondes.
      </motion.p>
    </section>
  )
}
