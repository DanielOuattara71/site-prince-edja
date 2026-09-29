import { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { EASE_EXPO } from '@/lib/motion'

interface SectionMarkerProps {
  /** Numéro de chapitre, en monospace (le seul or toléré sur fond clair : un chiffre). */
  num?: string
  eyebrow: ReactNode
  /** Le marqueur s'annonce une seule fois, puis se tient tranquille. */
  className?: string
  tone?: 'clair' | 'sombre'
}

/**
 * Le marqueur de section — niveau 3 de l'annonce.
 *
 * Le trait capillaire se trace de gauche à droite et l'étiquette glisse dans son masque :
 * la section prévient qu'elle arrive, au lieu de s'afficher brutalement.
 * Remplace l'`Eyebrow` nu dès qu'un bloc mérite d'être annoncé.
 */
export function SectionMarker({ num, eyebrow, className, tone = 'clair' }: SectionMarkerProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const visible = useInView(ref, { once: true, amount: 0.6 })
  const reducedMotion = useReducedMotion()

  const anime = visible || reducedMotion

  return (
    <motion.p
      ref={ref}
      initial={reducedMotion ? undefined : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.45, ease: EASE_EXPO }}
      className={cn('flex flex-wrap items-center gap-3', className)}
    >
      {num && <span className="data-mono text-xs text-gold-400">{num}</span>}

      <span
        aria-hidden
        className={cn(
          'hairline-draw h-px w-10',
          anime && 'hairline-drawn',
          tone === 'clair' ? 'text-ink-900/40' : 'text-cream-100/40',
        )}
      />

      <span
        className={cn(
          'label-caps overflow-hidden',
          tone === 'clair' ? 'text-ink-500' : 'text-cream-100/75',
        )}
      >
        <motion.span
          initial={reducedMotion ? undefined : { y: '105%' }}
          animate={{ y: anime ? '0%' : '105%' }}
          transition={{ duration: 0.55, ease: EASE_EXPO }}
          className="block will-change-transform"
        >
          {eyebrow}
        </motion.span>
      </span>
    </motion.p>
  )
}
