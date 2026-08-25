import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Eyebrow } from '@/components/ui/Eyebrow'

interface SectionHeadingProps {
  eyebrow: string
  num?: string
  title: ReactNode
  lead?: string
  tone?: 'light' | 'dark'
  as?: 'h1' | 'h2'
  className?: string
}

export function SectionHeading({
  eyebrow,
  num,
  title,
  lead,
  tone = 'light',
  as: Tag = 'h2',
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-3xl space-y-5', className)}>
      <Eyebrow num={num} tone={tone}>
        {eyebrow}
      </Eyebrow>
      <Tag className="font-display uppercase text-display-lg">{title}</Tag>
      {lead && (
        <p className={cn('max-w-2xl text-body-lg', tone === 'light' ? 'text-ink-500' : 'text-cream-100/70')}>
          {lead}
        </p>
      )}
    </div>
  )
}
