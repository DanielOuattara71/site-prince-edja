import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TagProps {
  children: ReactNode
  tone?: 'light' | 'dark'
}

export function Tag({ children, tone = 'light' }: TagProps) {
  return (
    <span
      className={cn(
        'label-caps inline-flex items-center rounded-full px-3 py-1',
        tone === 'light' ? 'bg-sand-200/70 text-ink-700' : 'bg-night-800 text-cream-100/80',
      )}
    >
      {children}
    </span>
  )
}
