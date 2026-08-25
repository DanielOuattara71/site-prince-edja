import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Container } from '@/components/layout/Container'

interface SectionProps {
  children: ReactNode
  tone?: 'light' | 'dark'
  container?: boolean
  className?: string
}

export function Section({ children, tone = 'light', container = true, className }: SectionProps) {
  return (
    <section
      className={cn(
        'section-y',
        tone === 'dark' && 'grain bg-night-900 text-cream-100',
        className,
      )}
    >
      {container ? <Container>{children}</Container> : children}
    </section>
  )
}
