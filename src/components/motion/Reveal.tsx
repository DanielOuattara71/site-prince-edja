import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { EASE_EXPO } from '@/lib/motion'
import { cn } from '@/lib/cn'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}

/**
 * Révélation unique du projet : opacité + translation de 26 px, 800 ms expo.
 *
 * Les délais de cascade doivent venir de `delaiCyclique` (`@/lib/motion`) :
 * au-delà de quatre éléments en cascade, la révélation devient un spectacle et n'annonce plus rien.
 * En `prefers-reduced-motion`, le contenu est posé immédiatement, sans opacité intermédiaire.
 */
export function Reveal({ children, delay = 0, y = 26, className }: RevealProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.8, ease: EASE_EXPO, delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}

