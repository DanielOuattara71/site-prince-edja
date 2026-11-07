import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { magasin } from '@/api/mocks/magasin'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'
import { violationsGraves } from '@/test/axe'

/**
 * Lot 4 (§ 9.9, § 9.13, § 9.16) : galerie, études de cas, partenaires, pages légales. Les familles
 * éditoriales vivent du cadre déclaratif ; les pages légales sont un ensemble fermé.
 */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}
const titre = (nom: string | RegExp) => screen.findByRole('heading', { level: 1, name: nom })

describe('lot 4 — écrans éditoriaux', () => {
  // C6 : `/galerie` devient l'onglet « Sur le site » (ECRANS § 5.2) — photos fixes, puis une
  // galerie par emplacement, ordonnable. Les trois images d'exemple s'y retrouvent.
  it('sur le site : photos fixes, galeries de l’accueil et de la boutique ordonnables', async () => {
    const { container } = await ouvrir('admin', '/galerie')
    await titre('Sur le site')
    expect(await screen.findByRole('heading', { level: 2, name: 'Photos fixes' })).toBeTruthy()
    expect(await screen.findByRole('button', { name: 'Changer — Accueil — héros' })).toBeTruthy()
    const accueil = await screen.findByRole('list', {
      name: 'Ordre d’affichage sur le site — Galerie de l’accueil',
    })
    const boutique = magasin.galerie.filter((g) => g.emplacement === 'boutique').length
    const nombreAccueil = magasin.galerie.length - boutique
    expect(within(accueil).getAllByRole('listitem')).toHaveLength(nombreAccueil)
    expect(await violationsGraves(container)).toEqual([])
  })

  // Écran retiré du menu et des routes (C2) : test conservé, décision en C9 (docs/ELEMENTS-RETIRES.md).
  it.skip('études de cas : liste des études, ordre d’affichage déclarable', async () => {
    const { container } = await ouvrir('admin', '/etudes-cas')
    const tableau = await screen.findByRole('table', { name: 'Études de cas' })
    expect(within(tableau).getAllByRole('row').length).toBeGreaterThanOrEqual(2)
    expect(screen.getByRole('button', { name: /Changer l’ordre d’affichage/ })).toBeTruthy()
    expect(await violationsGraves(container)).toEqual([])
  })

  it('partenaires : liste des partenaires avec leur lien', async () => {
    const { container } = await ouvrir('admin', '/partenaires')
    const tableau = await screen.findByRole('table', { name: 'Partenaires' })
    expect(within(tableau).getAllByRole('row').length).toBeGreaterThanOrEqual(2)
    expect(await violationsGraves(container)).toEqual([])
  })

  it('pages légales : ensemble fermé, création refusée, fiche consultable', async () => {
    const { container } = await ouvrir('admin', '/pages-legales')
    const tableau = await screen.findByRole('table', { name: 'Pages légales' })
    expect(within(tableau).getAllByRole('row').length).toBe(6) // entête + cinq pages
    expect(screen.queryByRole('link', { name: /^Nouv/ })).toBeNull()
    fireEvent.click(within(tableau).getByRole('link', { name: /Exemple — mentions/ }))
    await titre('Exemple — mentions legales')
    expect(await violationsGraves(container)).toEqual([])
  })
})
