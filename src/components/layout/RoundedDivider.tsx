import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { cn } from '@/lib/cn'

interface RoundedDividerProps {
  className?: string
}

export function RoundedDivider({ className }: RoundedDividerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  })
  const radius = useTransform(scrollYProgress, [0, 1], ['1.5rem', '38vw'])

  return (
    <div ref={ref} aria-hidden className={cn('relative -mb-px', className)}>
      <motion.div
        style={
          reducedMotion
            ? { borderTopLeftRadius: '3rem', borderTopRightRadius: '3rem' }
            : { borderTopLeftRadius: radius, borderTopRightRadius: radius }
        }
        className="h-14 w-full bg-night-900 sm:h-16"
      />
    </div>
  )
}
