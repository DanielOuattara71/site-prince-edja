import type { CSSProperties, ReactNode } from 'react'
import { useReducedMotion } from 'motion/react'
import { cn } from '@/lib/cn'

interface MarqueeProps {
  children: ReactNode
  duration?: number
  reverse?: boolean
  className?: string
}

export function Marquee({ children, duration = 36, reverse = false, className }: MarqueeProps) {
  const reducedMotion = useReducedMotion()

  if (reducedMotion) {
    return (
      <div className={cn('overflow-x-auto', className)}>
        <div className="flex w-max items-center">{children}</div>
      </div>
    )
  }

  return (
    <div className={cn('group overflow-hidden', className)}>
      <div
        style={{ '--marquee-duration': `${duration}s` } as CSSProperties}
        className={cn('marquee-track flex w-max items-center', reverse && '[animation-direction:reverse]')}
      >
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
    </div>
  )
}
