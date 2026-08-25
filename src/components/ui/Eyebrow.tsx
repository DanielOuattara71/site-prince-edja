import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface EyebrowProps {
  children: ReactNode
  num?: string
  tone?: 'light' | 'dark'
  className?: string
}

export function Eyebrow({ children, num, tone = 'light', className }: EyebrowProps) {
  return (
    <p
      className={cn(
        'label-caps flex items-center gap-2.5',
        tone === 'light' ? 'text-ink-500' : 'text-cream-100/70',
        className,
      )}
    >
      {num && <span className="font-display tracking-normal text-gold-400">{num}</span>}
      {num && <span aria-hidden className="h-px w-6 bg-current opacity-50" />}
      <span>{children}</span>
    </p>
  )
}
