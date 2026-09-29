import { useRef } from 'react'
import type { MotionValue } from 'motion/react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { cn } from '@/lib/cn'
import { DUR, EASE_EXPO } from '@/lib/motion'
import { formatChapitre } from '@/lib/format'

interface ChapiteauProps {
  numero: string
  nom: string
  intention: string
  motif: string
  accent: string
  /** Le Chapiteau long est réservé au comptoir consulté ; les versions courtes arrivent
   *  avec le nouveau hub `/boutique`, qui remplacera la page actuelle. */
  position: number
  total: number
  className?: string
}

/**
 * LE CHAPITEAU — l'annonce d'un comptoir, à l'entrée.
 *
 * C'est la seule chorégraphie scénique d'une page, et elle est volontairement unique :
 * une annonce qui se répète n'annonce plus rien. Le rituel tient en quatre temps —
 * le sol prend la couleur, le motif s'ouvre, le nom s'allume, le compteur arrive.
 *
 * La version longue est réservée au comptoir consulté (`110 vh`) ; tous les autres
 * passent en version courte (`50 vh`). Sans cette règle, quatre comptoirs coûtent
 * quatre-vingts écrans de scroll avant le premier produit.
 */
/**
 * Un mot du nom, allumé par la progression du scroll.
 *
 * Chaque mot a sa propre fenêtre : il s'allume quand le chapitre défile, et reste
 * allumé ensuite. C'est la mécanique relevée sur le manifeste du studio de référence —
 * une annonce pilotée par le geste du lecteur, pas par un compte à rebours.
 */
function Mot({
  mot,
  index,
  total,
  progres,
  reduit,
}: {
  mot: string
  index: number
  total: number
  progres: MotionValue<number>
  reduit: boolean
}) {
  const debut = 0.06 + (index / Math.max(1, total)) * 0.34
  const fin = debut + 0.16
  const opacite = useTransform(progres, [debut, fin], [0.12, 1])

  return (
    <span className="inline-block overflow-hidden align-bottom">
      <motion.span
        className="inline-block"
        // La progression du scroll dirige directement le style : c'est le geste du
        // lecteur qui allume le mot, pas une minuterie. Aucun `animate` concurrent,
        // qui contredirait la valeur de scroll.
        style={reduit ? { opacity: 1, y: 0 } : { opacity: opacite, y: 0 }}
      >
        {mot}
        {index < total - 1 ? ' ' : ''}
      </motion.span>
    </span>
  )
}

export function Chapiteau({
  numero,
  nom,
  intention,
  motif,
  accent,
  position,
  total,
  className,
}: ChapiteauProps) {
  const ref = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const mots = nom.split(' ')

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start start', 'end start'],
  })

  // Le filigrane et le texte glissent à des vitesses différentes : c'est ce qui donne
  // de la profondeur à une annonce qui, sinon, serait un simple titre qui apparaît.
  const derive = useTransform(scrollYProgress, [0, 1], ['0%', '-14%'])
  const hauteur = '110vh'

  return (
    <section
      ref={ref}
      aria-label={`${nom} — chapitre ${numero}`}
      className={cn('relative isolate overflow-hidden', className)}
      style={{ minHeight: hauteur }}
    >
      {/* Le motif s'ouvre en iris : c'est l'ouverture du comptoir. */}
      <motion.span
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          backgroundColor: accent,
          opacity: 0.1,
          WebkitMaskImage: `url(${motif})`,
          maskImage: `url(${motif})`,
          WebkitMaskSize: '180px 180px',
          maskSize: '180px 180px',
        }}
        initial={reducedMotion ? undefined : { clipPath: 'circle(12% at 50% 50%)' }}
        animate={{ clipPath: 'circle(140% at 50% 50%)' }}
        transition={{ duration: DUR.reveal, ease: EASE_EXPO }}
      />

      <motion.div
        className="flex h-full min-h-[inherit] flex-col justify-center px-5 py-28 sm:px-8 lg:px-16"
        style={reducedMotion ? undefined : { y: derive }}
      >
        <div className="flex items-baseline gap-4">
          {/* L'or reste un matériau : c'est le filet qui le porte, pas un chiffre de 12 px.
              Le contrat réserve l'or en texte aux chiffres d'au moins 24 px — le filigrane,
              lui, y a droit : il fait cinq fois la taille de l'écran. */}
          <span className="data-mono text-xs">{numero}</span>
          <span aria-hidden className="h-px w-10 opacity-70" style={{ backgroundColor: accent }} />
          <span className="data-mono text-xs opacity-60">{formatChapitre(position, total)}</span>
        </div>

        {/* Le chiffre en filigrane : présent, jamais lu. */}
        <span
          aria-hidden
          className="pointer-events-none absolute -top-[6vh] right-0 font-display text-[clamp(9rem,26vw,20rem)] leading-none opacity-[0.06]"
          style={{ color: accent }}
        >
          {numero}
        </span>

        <h1 className="mt-8 max-w-5xl font-title text-display-lg leading-[0.96]">
          {mots.map((mot, i) => (
            <Mot
              key={`${mot}-${i}`}
              mot={mot}
              index={i}
              total={mots.length}
              progres={scrollYProgress}
              reduit={Boolean(reducedMotion)}
            />
          ))}
        </h1>

        <p className="mt-7 max-w-2xl font-quote text-body-lg italic opacity-80">{intention}</p>
      </motion.div>
    </section>
  )
}
