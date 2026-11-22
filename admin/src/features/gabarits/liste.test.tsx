import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app/App'
import { magasin } from '@/api/mocks/magasin'
import { TYPES_PAR_CONTEXTE } from '@/lib/etiquettes'
import { connecter, utiliserFauxServeur } from '@/test/faux-serveur'

/** C4 : recherche instantanée, trois filtres, pagination dans l'adresse (U4, ECRANS § 0.2). */

utiliserFauxServeur()
afterEach(() => {
  vi.useRealTimers()
  window.history.pushState({}, '', '/')
})

async function ouvrir(chemin: string) {
  await connecter('admin')
  window.history.pushState({}, '', chemin)
  render(<App />)
  return screen.findByRole('heading', { level: 1, name: 'Articles' })
}

/** 25 articles de plus, copies du premier, pour avoir plusieurs pages. */
function remplir(nombre: number) {
  const modele = magasin.articles[0]
  if (!modele) throw new Error('Jeu d’exemple absent.')
  for (let i = 0; i < nombre; i += 1) {
    magasin.articles.push({
      ...modele,
      id: `00000000-0000-4000-8000-${String(i).padStart(12, '0')}`,
      traductions: {
        fr: {
          ...(modele.traductions.fr ?? { titre: '', slug: '', extrait: '', corps: null }),
          titre: `Exemple ${i}`,
          slug: `exemple-${i}`,
        } as NonNullable<typeof modele.traductions.fr>,
      },
    })
  }
}

describe('liste : recherche et filtres', () => {
  it('la recherche part pendant la saisie, sans bouton « Chercher »', async () => {
    await ouvrir('/articles')
    expect(screen.queryByRole('button', { name: 'Chercher' })).toBeNull()
    fireEvent.change(screen.getByRole('searchbox', { name: /Rechercher/ }), {
      target: { value: 'pirogue' },
    })
    expect(window.location.search).toBe('')
    await waitFor(() => expect(window.location.search).toBe('?q=pirogue'), { timeout: 2000 })
  })

  it('tous les filtres sont en vue, sans « Plus de filtres » à chercher', async () => {
    await ouvrir('/articles')
    expect(screen.getByRole('combobox', { name: /^Statut/ })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: /^Catégorie/ })).toBeTruthy()
    expect(screen.getByRole('combobox', { name: /^Tri/ })).toBeTruthy()
    expect(screen.queryByText('Plus de filtres')).toBeNull()
  })

  it('un changement de filtre ramène à la page 1 et garde la taille ; « Effacer les filtres »', async () => {
    await ouvrir('/articles?page=2&taille=16')
    fireEvent.change(screen.getByLabelText(/^Statut/), { target: { value: 'brouillon' } })
    await waitFor(() => expect(window.location.search).toContain('statut=brouillon'))
    expect(window.location.search).not.toContain('page=')
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Effacer les filtres' })[0] as HTMLElement,
    )
    await waitFor(() => expect(window.location.search).toBe('?taille=16'))
  })
})

describe('liste : pagination', () => {
  it('« 1–N sur total », Précédent / Suivant, 8 / 12 / 16 / 24 par page dans l’adresse', async () => {
    remplir(21)
    await ouvrir('/articles')
    const total = magasin.articles.length
    const pagination = await screen.findByRole('navigation', { name: /^Pagination/ })
    expect(within(pagination).getByText(new RegExp(`^1–12 sur ${total}`))).toBeTruthy()
    fireEvent.click(within(pagination).getByRole('button', { name: /Suivant/ }))
    await waitFor(() => expect(window.location.search).toBe('?page=2'))
    expect(await within(pagination).findByText(new RegExp(`^13–${total} sur ${total}`))).toBeTruthy()
    fireEvent.click(within(pagination).getByRole('button', { name: /Précédent/ }))
    await waitFor(() => expect(window.location.search).toBe(''))
    act(() => {
      fireEvent.change(within(pagination).getByLabelText('Articles par page'), {
        target: { value: '24' },
      })
    })
    await waitFor(() => expect(window.location.search).toBe('?taille=24'))
    expect(await screen.findByText(new RegExp(`^1–${total} sur ${total}`))).toBeTruthy()
  })
})

describe('étiquettes par formulaire (U8)', () => {
  it('un bijou ne propose pas d’étiquette de format ; un article l’exige', () => {
    expect(TYPES_PAR_CONTEXTE.bijou).not.toContain('format')
    expect(TYPES_PAR_CONTEXTE.livre).not.toContain('format')
    expect(TYPES_PAR_CONTEXTE.article).toContain('format')
  })

  it('le formulaire d’un bijou n’affiche pas le groupe « Format »', async () => {
    await connecter('admin')
    window.history.pushState({}, '', '/bijoux/nouveau')
    render(<App />)
    await screen.findByRole('heading', { level: 1, name: 'Nouveau bijou' })
    const groupe = await screen.findByRole('group', { name: /^Étiquettes/ })
    expect(within(groupe).queryByRole('group', { name: 'Format' })).toBeNull()
    expect(within(groupe).getByRole('group', { name: 'Pays' })).toBeTruthy()
  })
})
