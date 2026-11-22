import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { magasin } from '@/api/mocks/magasin'
import { violationsGraves } from '@/test/axe'
import { connecter, utiliserFauxServeur } from '@/test/faux-serveur'

/**
 * Étape 8 (revue) : la boîte de réception ouvre le message dans un panneau, sans redirection,
 * et les deux actions principales (marquer comme lu, supprimer) passent par le même écran.
 */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(chemin: string) {
  await connecter('admin')
  window.history.pushState({}, '', chemin)
  return render(<App />)
}

describe('messages — fiche', () => {
  it('un clic sur un message ouvre le panneau ; le texte est lisible ; axe', async () => {
    const { container } = await ouvrir('/messages')
    const ligne = (await screen.findAllByRole('button', { name: /Lire le message de/ }))[0]!
    fireEvent.click(ligne)
    const dialogue = await screen.findByRole('dialog')
    expect(within(dialogue).getByRole('heading', { name: 'Exemple Visiteur' })).toBeTruthy()
    expect(within(dialogue).getByRole('link', { name: 'visiteur@exemple.test' })).toBeTruthy()
    expect(within(dialogue).getByText('Exemple — demande de renseignements')).toBeTruthy()
    expect(within(dialogue).getByText(/un message/)).toBeTruthy()
    expect(await violationsGraves(container)).toEqual([])
  })

  it('« Marquer comme lu » met le message à « lu » et ferme le panneau s’il est libre', async () => {
    await ouvrir('/messages')
    const ligne = (
      await screen.findAllByRole('button', { name: /Lire le message de : Exemple Visiteur$/ })
    )[0]
    if (!ligne) throw new Error('ligne absente')
    fireEvent.click(ligne)
    const dialogue = await screen.findByRole('dialog')
    fireEvent.click(within(dialogue).getByRole('button', { name: /Marquer comme lu/ }))
    await waitFor(() =>
      expect(magasin.messages.find((m) => m.id.endsWith('0a01'))?.statut).toBe('lu'),
    )
    // Fermer via le bouton « Fermer » rend la place à la liste.
    const fermer = within(dialogue).getAllByRole('button', { name: 'Fermer' })[0]
    if (!fermer) throw new Error('fermeture absente')
    fireEvent.click(fermer)
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
  })

  it('la suppression demande confirmation puis retire le message de la liste', async () => {
    await ouvrir('/messages')
    const ligne = (
      await screen.findAllByRole('button', { name: /Lire le message de : Exemple Visiteur$/ })
    )[0]
    if (!ligne) throw new Error('ligne absente')
    fireEvent.click(ligne)
    const dialogue = await screen.findByRole('dialog')
    fireEvent.click(within(dialogue).getByRole('button', { name: 'Supprimer le message' }))
    const confirmation = await screen.findByRole('dialog', { name: 'Supprimer ce message ?' })
    fireEvent.click(within(confirmation).getByRole('button', { name: 'Supprimer le message' }))
    await waitFor(() =>
      expect(magasin.messages.find((m) => m.id.endsWith('0a01'))).toBeUndefined(),
    )
  })

  it('un message de collaboration affiche entreprise, pays et type de collaboration', async () => {
    await ouvrir('/messages')
    const ligne = (
      await screen.findAllByRole('button', { name: /Lire le message de : Exemple Collaboration/ })
    )[0]
    if (!ligne) throw new Error('ligne absente')
    fireEvent.click(ligne)
    const dialogue = await screen.findByRole('dialog')
    expect(within(dialogue).getByText('Exemple SA')).toBeTruthy()
    expect(within(dialogue).getByText('Exemple')).toBeTruthy()
    expect(within(dialogue).getByText('Exemple : partenariat')).toBeTruthy()
    expect(within(dialogue).getByText('Exemple : printemps')).toBeTruthy()
    expect(within(dialogue).getByText('Exemple : à relancer.')).toBeTruthy()
  })
})
