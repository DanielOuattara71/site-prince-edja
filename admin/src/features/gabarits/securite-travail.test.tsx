import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app/App'
import { IDS_EXEMPLE } from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'

/** C5 : enregistrement automatique (U6), ce qui manque (U7), conflit de version (ECRANS § 0.3). */

utiliserFauxServeur()
afterEach(() => {
  vi.useRealTimers()
  window.history.pushState({}, '', '/')
})

const ID = IDS_EXEMPLE.articleBrouillon
const article = () => magasin.articles.find((a) => a.id === ID)

async function ouvrir(role: RoleEssai) {
  await connecter(role)
  window.history.pushState({}, '', `/articles/${ID}`)
  render(<App />)
  await screen.findByRole('heading', { level: 1, name: /brouillon sans texte alternatif/ })
}

describe('sécurité du travail', () => {
  it('enregistre seul un brouillon modifié au bout de 30 s, et dit « Enregistré à HH:MM »', async () => {
    // Seule la minuterie de 30 s est simulée : le faux serveur garde ses délais réels.
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    await ouvrir('editeur')
    fireEvent.change(document.getElementById('traductions.fr.extrait') as HTMLElement, {
      target: { value: 'Exemple : résumé saisi' },
    })
    expect(screen.getByText('Modifications non enregistrées')).toBeTruthy()
    vi.advanceTimersByTime(30_000)
    await waitFor(() => expect(article()?.traductions.fr?.extrait).toBe('Exemple : résumé saisi'))
    expect(await screen.findByText(/^Enregistré à \d{2}:\d{2}$/)).toBeTruthy()
    // Un brouillon reste un brouillon : l'enregistrement automatique ne publie jamais.
    expect(article()?.statut).toBe('brouillon')
  }, 30_000)

  it('la liste « Il manque » mène au champ', async () => {
    await ouvrir('editeur')
    const liste = (await screen.findByText(/^Il manque, pour publier/)).parentElement as HTMLElement
    const liens = within(liste).getAllByRole('link')
    expect(liens.length).toBeGreaterThan(0)
    const resume = liens.find((l) => l.getAttribute('href') === '#traductions.fr.extrait')
    expect(resume).toBeTruthy()
    fireEvent.click(resume as HTMLElement)
    await waitFor(() => expect(document.activeElement?.id).toBe('traductions.fr.extrait'))
  }, 20_000)

  it('conflit de version : fenêtre « Quelqu’un a modifié ce contenu », Recharger', async () => {
    await ouvrir('admin')
    const courant = article()
    if (!courant) throw new Error('Jeu d’exemple absent.')
    courant.version += 1
    fireEvent.change(document.getElementById('traductions.fr.extrait') as HTMLElement, {
      target: { value: 'Exemple : ma version' },
    })
    fireEvent.click(screen.getAllByRole('button', { name: /^Enregistrer/ })[0] as HTMLElement)
    const fenetre = await screen.findByRole('dialog', { name: 'Quelqu’un a modifié ce contenu' })
    expect(within(fenetre).getByRole('button', { name: 'Copier mon texte' })).toBeTruthy()
    fireEvent.click(within(fenetre).getByRole('button', { name: 'Recharger' }))
    await waitFor(() =>
      expect(screen.queryByRole('dialog', { name: 'Quelqu’un a modifié ce contenu' })).toBeNull(),
    )
    expect((document.getElementById('traductions.fr.extrait') as HTMLTextAreaElement).value).toBe(
      '',
    )
  }, 20_000)
})
