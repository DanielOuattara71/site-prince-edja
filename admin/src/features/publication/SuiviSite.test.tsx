import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { utiliserFauxServeur, connecter, type RoleEssai } from '@/test/faux-serveur'
import { violationsGraves } from '@/test/axe'

/**
 * Étape 9 — publication du site : l’écran affiche l’absence de mise à jour en attente et
 * propose la relance (`POST /site/reconstruire`).
 */
utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}

describe('publication du site (étape 9)', () => {
  it('sans mise à jour en attente : message, puis relance disponible', async () => {
    const { container } = await ouvrir('admin', '/publication')
    expect(await screen.findByRole('heading', { name: 'Publication' })).toBeTruthy()
    expect(await screen.findByText('Aucune mise à jour du site pour le moment.')).toBeTruthy()
    const relancer = screen.getByRole('button', {
      name: 'Relancer la mise à jour',
    }) as HTMLButtonElement
    expect(relancer.disabled).toBe(false)
    expect(await violationsGraves(container)).toEqual([])
  })
})
