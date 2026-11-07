import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { connecter, utiliserFauxServeur } from '@/test/faux-serveur'

/** C3 : un seul sélecteur de langue (U2) et l'adresse rangée dans « Avancé » (U3). */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function nouvelArticle() {
  await connecter('editeur')
  window.history.pushState({}, '', '/articles/nouveau')
  render(<App />)
  await screen.findByRole('heading', { level: 1, name: 'Nouvel article' })
}

describe('formulaire bilingue', () => {
  it('un seul jeu de langues, en haut du formulaire', async () => {
    await nouvelArticle()
    expect(screen.getAllByRole('group', { name: 'Langue du contenu' })).toHaveLength(1)
    // Plus aucun jeu d'onglets de langue par champ.
    expect(screen.queryByRole('tablist', { name: /^Langues :/ })).toBeNull()
  })

  it('changer de langue garde le texte de l’autre langue', async () => {
    await nouvelArticle()
    const langues = screen.getByRole('group', { name: 'Langue du contenu' })
    fireEvent.change(screen.getByLabelText(/^Titre \(FR\)/), {
      target: { value: 'Exemple : la pirogue' },
    })
    fireEvent.click(within(langues).getByRole('button', { name: /Anglais/ }))
    expect(screen.queryByLabelText(/^Titre \(FR\)/)).toBeNull()
    const titreEn = screen.getByLabelText(/^Titre \(EN\)/) as HTMLInputElement
    expect(titreEn.value).toBe('')
    fireEvent.click(within(langues).getByRole('button', { name: /Français/ }))
    expect((screen.getByLabelText(/^Titre \(FR\)/) as HTMLInputElement).value).toBe(
      'Exemple : la pirogue',
    )
  })

  it('l’adresse est tirée du titre et rangée dans « Avancé », repliée à la création', async () => {
    await nouvelArticle()
    fireEvent.change(screen.getByLabelText(/^Titre \(FR\)/), {
      target: { value: 'Exemple : la pirogue' },
    })
    const adresse = screen.getByLabelText(/^Adresse de la page \(FR\)/) as HTMLInputElement
    expect(adresse.value).toBe('exemple-la-pirogue')
    const repli = adresse.closest('details')
    expect(repli?.open).toBe(false)
    expect(within(repli as HTMLElement).getByText('Avancé')).toBeTruthy()
  })
})
