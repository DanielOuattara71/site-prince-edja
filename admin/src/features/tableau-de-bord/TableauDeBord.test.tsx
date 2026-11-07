import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { utiliserFauxServeur, connecter, type RoleEssai } from '@/test/faux-serveur'
import { violationsGraves } from '@/test/axe'

/**
 * Étape 9 — tableau de bord : les dernières modifications sont cliquables, et les
 * raccourcis d’administration n’apparaissent qu’aux comptes autorisés.
 */
utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}

describe('tableau de bord (étape 9)', () => {
  it('affiche les dernières modifications cliquables et l’espace Administration pour un admin', async () => {
    const { container } = await ouvrir('admin', '/')
    expect(await screen.findByRole('heading', { name: 'Tableau de bord' })).toBeTruthy()
    expect(await screen.findByRole('heading', { name: 'Activité récente' })).toBeTruthy()
    const administration = screen.getByRole('navigation', { name: 'Administration' })
    expect(within(administration).getByRole('link', { name: 'Comptes' }).getAttribute('href')).toBe(
      '/comptes',
    )
    expect(
      within(administration).getByRole('link', { name: 'Activité' }).getAttribute('href'),
    ).toBe('/activite')
    expect(await violationsGraves(container)).toEqual([])
  })

  it('un éditeur ne voit pas l’espace Administration', async () => {
    const { container } = await ouvrir('editeur', '/')
    expect(await screen.findByRole('heading', { name: 'Tableau de bord' })).toBeTruthy()
    expect(screen.queryByRole('navigation', { name: 'Administration' })).toBeNull()
    expect(await violationsGraves(container)).toEqual([])
  })
})

describe('tableau de bord (C7, ECRANS § 1)', () => {
  it('quatre blocs ; les cartes « À faire » mènent à la liste déjà filtrée', async () => {
    await ouvrir('admin', '/')
    for (const bloc of ['À faire', 'Dernière publication', 'Programmé', 'Activité récente'])
      expect(await screen.findByRole('heading', { level: 2, name: bloc })).toBeTruthy()
    const aFaire = screen.getByRole('heading', { level: 2, name: 'À faire' }).closest('section')
    const liens = within(aFaire as HTMLElement)
      .getAllByRole('link')
      .map((l) => l.getAttribute('href'))
    expect(liens).toEqual([
      '/articles?statut=en_relecture',
      '/messages?statut=non_lu',
      '/demandes?statut=nouvelle',
      '/articles?aFournir=true',
    ])
    // Aucun contenu programmé dans le jeu d'exemple : le bloc le dit.
    const programme = screen
      .getByRole('heading', { level: 2, name: 'Programmé' })
      .closest('section')
    expect(within(programme as HTMLElement).getByText('Rien à signaler')).toBeTruthy()
  })

  it('un éditeur ne voit pas les cartes des messages et des demandes', async () => {
    await ouvrir('editeur', '/')
    const aFaire = (await screen.findByRole('heading', { level: 2, name: 'À faire' })).closest(
      'section',
    )
    expect(within(aFaire as HTMLElement).getAllByRole('link')).toHaveLength(2)
  })

  it('le message d’accueil se ferme et ne revient plus (U12)', async () => {
    localStorage.clear()
    const { unmount } = await ouvrir('admin', '/')
    expect(
      await screen.findByRole('heading', { name: 'Bienvenue dans l’administration' }),
    ).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Fermer le message d’accueil' }))
    expect(screen.queryByRole('heading', { name: 'Bienvenue dans l’administration' })).toBeNull()
    unmount()
    await ouvrir('admin', '/')
    await screen.findByRole('heading', { level: 2, name: 'À faire' })
    expect(screen.queryByRole('heading', { name: 'Bienvenue dans l’administration' })).toBeNull()
  })
})
