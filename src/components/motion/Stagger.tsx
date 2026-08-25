import { Children, type ReactNode } from 'react'
import { motion, useReducedMotion } from 'motion/react'
import { itemUp, STAGGER_STEP } from '@/lib/motion'
import { cn } from '@/lib/cn'

interface StaggerProps {
  children: ReactNode
  className?: string
  staggerStep?: number
  delayChildren?: number
}

export function Stagger({
  children,
  className,
  staggerStep = STAGGER_STEP,
  delayChildren = 0,
}: StaggerProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: staggerStep, delayChildren } },
      }}
      className={cn(className)}
    >
      {Children.map(children, (child) =>
        child ? <motion.div variants={itemUp}>{child}</motion.div> : null,
      )}
    </motion.div>
  )
}
