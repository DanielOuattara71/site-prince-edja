import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface TagProps {
  children: ReactNode
  tone?: 'light' | 'dark' | 'sage'
}

export function Tag({ children, tone = 'light' }: TagProps) {
  return (
    <span
      className={cn(
        'label-caps inline-flex items-center rounded-full px-3 py-1',
        tone === 'light'
          ? 'bg-sand-200/70 text-ink-700'
          : tone === 'sage'
            ? 'bg-sage-100 text-leaf-600 ring-1 ring-sage-300'
            : 'bg-night-800 text-cream-100/80',
      )}
    >
      {children}
    </span>
  )
}
