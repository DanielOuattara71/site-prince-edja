import { useEffect } from 'react'
import { afterEach, describe, expect, it } from 'vitest'
import { cleanup, fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { MemoryRouter, useLocation } from 'react-router'
import { FiltresCatalogue } from './FiltresCatalogue'
import { FournisseurLangue } from '@/i18n/FournisseurLangue'
import { FournisseurDemande } from '@/lib/demande'
import { CATALOGUE } from '@/lib/catalogue'

/** Mission 2 : catalogue paginé, filtres et page dans l'adresse (SCHEMAS § 12.2). */

afterEach(cleanup)

let adresse = ''
function Adresse() {
  const { search } = useLocation()
  useEffect(() => {
    adresse = search
  }, [search])
  return null
}

function rendre(recherche = '') {
  return render(
    <FournisseurLangue>
      <FournisseurDemande>
        <MemoryRouter initialEntries={[`/boutique${recherche}`]}>
          <FiltresCatalogue />
          <Adresse />
        </MemoryRouter>
      </FournisseurDemande>
    </FournisseurLangue>,
  )
}

const total = CATALOGUE.length
const pages = Math.ceil(total / 12)

describe('catalogue paginé', () => {
  it('12 produits en page 1, compteur et « Page 1 sur N »', () => {
    rendre()
    expect(
      screen.getByRole('heading', { level: 3, name: new RegExp(`${total} produits`) }),
    ).toBeTruthy()
    expect(screen.getAllByText(`Page 1 sur ${pages}`).length).toBeGreaterThan(0)
    const nav = screen.getByRole('navigation', { name: 'Pagination' })
    expect(within(nav).getByRole('link', { name: 'Page 1' }).getAttribute('aria-current')).toBe(
      'page',
    )
    expect(within(nav).getByRole('link', { name: 'Page 2' }).getAttribute('href')).toBe(
      '/boutique?page=2',
    )
    expect(adresse).toBe('')
  })

  it('page hors limite : ramenée à la dernière, sans nouvelle entrée d’historique', async () => {
    rendre('?page=99')
    await waitFor(() => expect(adresse).toBe(`?page=${pages}`))
    expect(screen.getAllByText(`Page ${pages} sur ${pages}`).length).toBeGreaterThan(0)
  })

  it('valeur invalide ou page=1 : page 1, et l’adresse est nettoyée', async () => {
    rendre('?page=abc')
    await waitFor(() => expect(adresse).toBe(''))
    cleanup()
    rendre('?page=1&type=bijou')
    await waitFor(() => expect(adresse).toBe('?type=bijou'))
  })

  it('un changement de filtre revient à la page 1 et reste dans l’adresse', async () => {
    rendre('?page=2')
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'livre' } })
    await waitFor(() => expect(adresse).toBe('?type=livre'))
    const livres = CATALOGUE.filter((p) => p.type === 'livre').length
    expect(
      screen.getByRole('heading', { level: 3, name: new RegExp(`${livres} produits`) }),
    ).toBeTruthy()
  })

  it('un changement de tri revient aussi à la page 1', async () => {
    rendre('?page=2')
    fireEvent.change(screen.getByLabelText('Trier par'), { target: { value: 'prix-croissant' } })
    await waitFor(() => expect(adresse).toBe('?tri=prix-croissant'))
  })

  it('aucun résultat : message clair et « Effacer les filtres »', async () => {
    rendre('?q=introuvable-zzz')
    expect(screen.getByText('Aucun produit ne correspond à ces filtres.')).toBeTruthy()
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull()
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Effacer les filtres' })[0] as HTMLElement,
    )
    await waitFor(() => expect(adresse).toBe(''))
  })

  it('au changement de page : focus sur le titre de la liste et annonce « Page 2 sur N »', async () => {
    rendre()
    fireEvent.click(screen.getByRole('link', { name: /Suivant/ }))
    await waitFor(() => expect(adresse).toBe('?page=2'))
    const titre = screen.getByRole('heading', { level: 3, name: /produits/ })
    await waitFor(() => expect(document.activeElement).toBe(titre))
    expect(document.querySelector('[aria-live="polite"]')?.textContent).toBe(`Page 2 sur ${pages}`)
  })

  it('effectifs par catégorie sur le catalogue complet, même filtré', () => {
    rendre('?type=livre')
    const options = within(screen.getByLabelText('Catégorie'))
      .getAllByRole('option')
      .map((o) => o.textContent)
    expect(options.some((o) => /^Bijoux & accessoires \(\d+\)$/.test(o ?? ''))).toBe(true)
  })
})
