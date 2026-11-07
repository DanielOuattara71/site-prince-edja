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

  it('trois filtres en vue au plus ; les autres sont repliés sous « Plus de filtres »', async () => {
    await ouvrir('/articles')
    const plus = screen.getByText('Plus de filtres').closest('details') as HTMLDetailsElement
    expect(plus.open).toBe(false)
    // Statut et langues (la catégorie s'ajoute en E1) : hors du repli.
    for (const nom of [/^Statut/, /^Langues/]) {
      const champ = screen.getByRole('combobox', { name: nom })
      expect(plus.contains(champ)).toBe(false)
    }
    expect(plus.contains(screen.getByLabelText(/^Étiquette/))).toBe(true)
  })

  it('un changement de filtre ramène à la page 1 et garde la taille ; « Effacer les filtres »', async () => {
    await ouvrir('/articles?page=2&taille=50')
    fireEvent.change(screen.getByLabelText(/^Statut/), { target: { value: 'brouillon' } })
    await waitFor(() => expect(window.location.search).toBe('?taille=50&statut=brouillon'))
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Effacer les filtres' })[0] as HTMLElement,
    )
    await waitFor(() => expect(window.location.search).toBe('?taille=50'))
  })
})

describe('liste : pagination', () => {
  it('« 1–20 sur N », Précédent / Suivant, 20 / 50 / 100 par page dans l’adresse', async () => {
    remplir(25)
    await ouvrir('/articles')
    const total = magasin.articles.length
    const pagination = await screen.findByRole('navigation', { name: /^Pagination/ })
    expect(within(pagination).getByText(`1–20 sur ${total}`)).toBeTruthy()
    fireEvent.click(within(pagination).getByRole('button', { name: /Suivant/ }))
    await waitFor(() => expect(window.location.search).toBe('?page=2'))
    expect(await within(pagination).findByText(`21–${total} sur ${total}`)).toBeTruthy()
    fireEvent.click(within(pagination).getByRole('button', { name: /Précédent/ }))
    // La page 1 n'est pas écrite dans l'adresse.
    await waitFor(() => expect(window.location.search).toBe(''))
    act(() => {
      fireEvent.change(within(pagination).getByLabelText('Par page'), { target: { value: '50' } })
    })
    await waitFor(() => expect(window.location.search).toBe('?taille=50'))
    expect(await screen.findByText(`1–${total} sur ${total}`)).toBeTruthy()
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
