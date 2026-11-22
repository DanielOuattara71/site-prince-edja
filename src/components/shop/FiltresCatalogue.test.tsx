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
  it('10 produits en page 1 : compteur présent, une seule page', () => {
    rendre()
    expect(total).toBe(10)
    expect(pages).toBe(1)
    expect(
      screen.getByRole('heading', { level: 3, name: new RegExp(`${total} produits`) }),
    ).toBeTruthy()
    // Une seule page : pas de navigation pages.
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull()
    expect(adresse).toBe('')
  })

  it('page hors limite : ramenée à la dernière', async () => {
    rendre('?page=99')
    await waitFor(() => expect(adresse).toBe(''))
    expect(screen.getByRole('heading', { level: 3, name: new RegExp(`${total} produits`) })).toBeTruthy()
  })

  it('valeur invalide ou page=1 : page 1, et l’adresse est nettoyée', async () => {
    rendre('?page=abc')
    await waitFor(() => expect(adresse).toBe(''))
    cleanup()
    rendre('?page=1&type=bijou')
    await waitFor(() => expect(adresse).toBe('?type=bijou'))
  })

  it('un changement de filtre reste dans l’adresse', async () => {
    rendre('?tri=nom')
    fireEvent.change(screen.getByLabelText('Type'), { target: { value: 'bijou' } })
    await waitFor(() => expect(adresse).toBe('?tri=nom&type=bijou'))
    expect(screen.getByRole('heading', { level: 3, name: /10 produits/ })).toBeTruthy()
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

  it('une seule page : pas de pagination, et « ?page=2 » retombe sur la page 1', async () => {
    rendre('?page=2')
    await waitFor(() => expect(adresse).toBe(''))
    expect(screen.queryByRole('navigation', { name: 'Pagination' })).toBeNull()
    expect(screen.getByRole('heading', { level: 3, name: /10 produits/ })).toBeTruthy()
  })

  it('effectifs par catégorie sur le catalogue complet', () => {
    rendre()
    const options = within(screen.getByLabelText('Catégorie'))
      .getAllByRole('option')
      .map((o) => o.textContent)
    expect(options.some((o) => /^Bijoux & accessoires \(\d+\)$/.test(o ?? ''))).toBe(true)
  })
})
