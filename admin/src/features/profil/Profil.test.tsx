import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { utiliserFauxServeur, connecter, type RoleEssai } from '@/test/faux-serveur'
import { violationsGraves } from '@/test/axe'

/**
 * Étape 9 — profil : les informations du compte connecté et le raccourci vers le
 * changement de mot de passe sont visibles sans exposer d’action interdite.
 */
utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}

describe('profil (étape 9)', () => {
  it('affiche les informations du compte et le lien de changement de mot de passe', async () => {
    const { container } = await ouvrir('admin', '/profil')
    expect(await screen.findByRole('heading', { name: 'Profil' })).toBeTruthy()
    expect(screen.getByText('admin@exemple.test')).toBeTruthy()
    expect(screen.getAllByText('Administrateur').length).toBeGreaterThanOrEqual(1)
    expect(
      screen.getByRole('link', { name: /Changer mon mot de passe/ }).getAttribute('href'),
    ).toBe('/changer-mot-de-passe')
    expect(await violationsGraves(container)).toEqual([])
  })
})
