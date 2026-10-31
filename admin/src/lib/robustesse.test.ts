import { describe, expect, it } from 'vitest'
import { noterMotDePasse } from '@/lib/robustesse'

describe('jauge de robustesse (RG-18)', () => {
  it.each([
    ['', 0],
    ['court', 1],
    ['aaaaaaaaaaaaaaaa', 1],
    ['azerty-et-encore', 1],
    ['douze-caract', 2],
    ['Douze-caract1', 3],
    ['une phrase de seize', 3],
    ['une phrase de plus de vingt caractères', 4],
  ])('« %s » → %i', (motDePasse, niveau) => {
    expect(noterMotDePasse(motDePasse)).toBe(niveau)
  })
})
