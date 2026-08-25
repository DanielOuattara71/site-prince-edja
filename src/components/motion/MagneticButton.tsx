import type { ReactNode } from 'react'
import { motion, useReducedMotion, useSpring } from 'motion/react'
import { useHasFinePointer } from '@/hooks/useMediaQuery'
import { cn } from '@/lib/cn'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  strength?: number
  maxShift?: number
}

export function MagneticButton({
  children,
  className,
  strength = 0.25,
  maxShift = 10,
}: MagneticButtonProps) {
  const finePointer = useHasFinePointer()
  const reducedMotion = useReducedMotion()
  const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.2 })
  const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.2 })

  if (!finePointer || reducedMotion) {
    return <div className={className}>{children}</div>
  }

  const handleMove = (event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect()
    const dx = (event.clientX - (rect.left + rect.width / 2)) * strength
    const dy = (event.clientY - (rect.top + rect.height / 2)) * strength
    x.set(Math.max(-maxShift, Math.min(maxShift, dx)))
    y.set(Math.max(-maxShift, Math.min(maxShift, dy)))
  }

  const reset = () => {
    x.set(0)
    y.set(0)
  }

  return (
    <motion.div
      style={{ x, y }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      className={cn('inline-block', className)}
    >
      {children}
    </motion.div>
  )
}
