import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { SectionMarker } from '@/components/ui/SectionMarker'

interface SectionHeadingProps {
  eyebrow: string
  num?: string
  title: ReactNode
  lead?: string
  tone?: 'light' | 'dark'
  as?: 'h1' | 'h2'
  className?: string
}

/**
 * Titre de section éditorial. L'annonce (trait capillaire + étiquette qui glisse)
 * est assurée par `SectionMarker` : le titre ne s'affiche plus, il est annoncé.
 */
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
      <SectionMarker num={num} eyebrow={eyebrow} tone={tone === 'light' ? 'clair' : 'sombre'} />
      <Tag className="font-display uppercase text-display-lg">{title}</Tag>
      {lead && (
        <p className={cn('max-w-2xl text-body-lg', tone === 'light' ? 'text-ink-500' : 'text-cream-100/70')}>
          {lead}
        </p>
      )}
    </div>
  )
}
