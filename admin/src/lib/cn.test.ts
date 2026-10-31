import { describe, expect, it } from 'vitest'
import { cn } from '@/lib/cn'

describe('cn', () => {
  it('garde la couleur et la taille du thème dans un même appel', () => {
    expect(cn('text-ink-900', 'text-caption')).toBe('text-ink-900 text-caption')
  })

  it('laisse la dernière couleur gagner', () => {
    expect(cn('text-ink-900', 'text-clay-600')).toBe('text-clay-600')
  })
})
