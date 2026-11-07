import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { magasin } from '@/api/mocks/magasin'
import { IDS_EXEMPLE } from '@/api/mocks/donnees'
import { utiliserFauxServeur, connecter, type RoleEssai } from '@/test/faux-serveur'
import { violationsGraves } from '@/test/axe'

/**
 * Étape 10 — tags : liste en lecture, création admin ; RG-08 vérifié par le faux serveur.
 * L’entrée du menu est réservée aux administrateurs (action `creer`) : l’écran affiche donc
 * « Accès refusé » pour un éditeur, sans bouton d’administration.
 */
utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}

describe('tags (étape 10)', () => {
  it('un éditeur consulte sans bouton d’administration', async () => {
    const { container } = await ouvrir('editeur', '/tags')
    expect(await screen.findByRole('heading', { level: 1, name: /Accès refusé/ })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Nouvelle étiquette' })).toBeNull()
    expect(await violationsGraves(container)).toEqual([])
  })

  it('un admin crée un tag', async () => {
    const { container } = await ouvrir('admin', '/tags')
    expect(await screen.findByRole('heading', { level: 1, name: 'Étiquettes' })).toBeTruthy()
    fireEvent.click(await screen.findByRole('button', { name: 'Nouvelle étiquette' }))
    fireEvent.change(screen.getByRole('textbox', { name: /^Code/ }), {
      target: { value: 'exemple-tag' },
    })
    fireEvent.change(screen.getByRole('textbox', { name: /^Libellé \(FR\)/ }), {
      target: { value: 'Exemple pour la rédaction' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(await screen.findAllByText('exemple-tag')).not.toHaveLength(0)
    expect(magasin.tags.some((tag) => tag.code === 'exemple-tag')).toBe(true)
    expect(await violationsGraves(container)).toEqual([])
  })

  it('supprimer un tag encore utilisé est refusé (RG-08)', async () => {
    await ouvrir('admin', '/tags')
    expect(await screen.findAllByText('article')).not.toHaveLength(0)
    fireEvent.click(screen.getAllByRole('button', { name: 'Supprimer « article »' })[0]!)
    fireEvent.click(screen.getByRole('button', { name: /^Supprimer$/ }))
    expect(await screen.findByRole('alert')).toBeTruthy()
    expect(magasin.tags.some((tag) => tag.id === IDS_EXEMPLE.tagFormat)).toBe(true)
  })
})
