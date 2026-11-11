import { afterEach, describe, expect, it, vi } from 'vitest'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router'
import JournalPage from '@/pages/JournalPage'
import HistoiresPage from '@/pages/HistoiresPage'
import { FournisseurLangue } from '@/i18n/FournisseurLangue'
import { ARTICLES } from '@/acces/journal'
import { categoriesAffichees, slugCategorie } from '@/lib/categories'

/**
 * Règle du client (06/11/2026) : les catégories du site, et ses filtres, sont celles de l'admin —
 * visibles, non vides, dans son ordre.
 */
afterEach(cleanup)

// Les révélations au défilement (Motion) s'appuient sur IntersectionObserver, absent de jsdom.
vi.stubGlobal(
  'IntersectionObserver',
  class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return []
    }
  },
)

describe('categoriesAffichees', () => {
  const categories = [
    { famille: 'projet' as const, nom: 'Film', visible: true },
    { famille: 'projet' as const, nom: 'Tourisme', visible: true },
    { famille: 'projet' as const, nom: 'Histoire', visible: true },
    { famille: 'projet' as const, nom: 'Patrimoine', visible: false },
    { famille: 'article' as const, nom: 'Voyage', visible: true },
  ]

  it('garde l’ordre de l’admin, ne montre ni les catégories vides ni les masquées', () => {
    const r = categoriesAffichees('projet', ['Tourisme', 'Film', 'Film', 'Patrimoine'], categories)
    expect(r).toEqual([
      { slug: 'film', nom: 'Film', compte: 2 },
      { slug: 'tourisme', nom: 'Tourisme', compte: 1 },
    ])
  })

  it('une catégorie créée dans l’admin apparaît dès qu’un contenu la porte', () => {
    expect(categoriesAffichees('projet', ['Histoire'], categories)).toEqual([
      { slug: 'histoire', nom: 'Histoire', compte: 1 },
    ])
  })

  it('adresse : sans accents ni ponctuation', () => {
    expect(slugCategorie('Éditions X’PLORE')).toBe('editions-xplore')
  })
})

function rendre(page: React.ReactNode) {
  return render(
    <FournisseurLangue>
      <MemoryRouter>{page}</MemoryRouter>
    </FournisseurLangue>,
  )
}

describe('filtres des pages publiques', () => {
  it('Journal : seules les catégories qui ont des articles sont proposées', () => {
    rendre(<JournalPage />)
    const portees = new Set(ARTICLES.map((a) => a.categorie))
    for (const nom of portees) expect(screen.getByRole('button', { name: nom })).toBeTruthy()
    // « Voyage » est une catégorie de l'admin, mais aucun article ne la porte encore.
    if (!portees.has('Voyage')) expect(screen.queryByRole('button', { name: 'Voyage' })).toBeNull()
  })

  it('Histoires : les filtres sont les catégories de projets (Film, Tourisme, Patrimoine)', () => {
    rendre(<HistoiresPage />)
    for (const nom of ['Film', 'Tourisme', 'Patrimoine'])
      expect(screen.getByRole('button', { name: nom })).toBeTruthy()
    // Les anciens filtres écrits en dur ne sont plus là.
    expect(screen.queryByRole('button', { name: 'Documentaires' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Tourisme' }))
    expect(screen.getByRole('button', { name: 'Tourisme' }).getAttribute('aria-pressed')).toBe(
      'true',
    )
    expect(screen.getByRole('heading', { level: 3, name: 'Taste & Travel' })).toBeTruthy()
  })
})
