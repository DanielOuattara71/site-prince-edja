import { describe, expect, it } from 'vitest'
import { render } from '@testing-library/react'
import { EPISODES } from '@/acces/projets'
import { GuidesGrid } from './GuidesGrid'

/** Les guides PDF viennent de l'admin (décision du client, 06/11/2026). */
describe('GuidesGrid', () => {
  it('aucun guide livré : aucune section, aucun lien vers un fichier absent', () => {
    expect(EPISODES.some((episode) => episode.guide)).toBe(false)
    const { container } = render(<GuidesGrid />)
    expect(container.innerHTML).toBe('')
  })
})
