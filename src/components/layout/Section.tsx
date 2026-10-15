import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'
import { Container } from '@/components/layout/Container'

interface SectionProps {
  children: ReactNode
  tone?: 'light' | 'dark'
  container?: boolean
  padded?: boolean
  className?: string
  /** Ancre de la section, pour les sommaires de page. */
  id?: string
}

/**
 * Une section de page.
 *
 * `tone` ne décide pas seulement de sa palette : `tone="dark"` pose
 * `data-theme-bare`, l'ancre que lit l'en-tête pour connaître le fond qu'il traverse.
 * Un nouvel héros sombre se déclare donc tout seul, sans mise à jour d'une liste.
 */
export function Section({
  children,
  tone = 'light',
  container = true,
  padded = true,
  className,
  id,
}: SectionProps) {
  return (
    <section
      id={id}
      data-theme-bare={tone === 'dark' ? 'dark' : 'light'}
      className={cn(
        padded && 'section-y',
        tone === 'dark' && 'grain bg-night-900 text-cream-100',
        className,
      )}
    >
      {container ? <Container>{children}</Container> : children}
    </section>
  )
}
