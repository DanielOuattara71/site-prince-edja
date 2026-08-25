import type { ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { DUR, EASE_EXPO } from '@/lib/motion'
import { cn } from '@/lib/cn'

interface RevealProps {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
}

export function Reveal({ children, delay = 0, y = 32, className }: RevealProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.25 }}
      transition={{ duration: DUR.reveal, ease: EASE_EXPO, delay }}
      className={cn(className)}
    >
      {children}
    </motion.div>
  )
}
