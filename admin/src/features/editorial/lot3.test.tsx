import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { archive, pages, presse, univers } from '@/api/endpoints/editorial'
import type { ErreurApi } from '@/api/erreurs'
import { IDS_LOT3 } from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'
import {
  valeursDepuis,
  versModification,
  type ContenuDeclaratif,
  type SourceFormulaire,
} from '@/features/gabarits/declaratif'
import { violationsGraves } from '@/test/axe'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'
import { SPEC_ARCHIVE, SPEC_PAGES } from './specs'

/** Étape 7 : distinctions, presse, archive, univers, jalons, offres, pages (section 13). */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

const echec = (promesse: Promise<unknown>) =>
  promesse.then(
    () => null,
    (e: unknown) => e as ErreurApi,
  )

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}
const titre = (nom: string | RegExp) => screen.findByRole('heading', { level: 1, name: nom })

describe('conversions', () => {
  it('une source sans adresse part à null ; les blocs d’une page vont dans sa traduction', () => {
    const [entree] = magasin.archive
    const [accueil] = magasin.pages
    if (!entree || !accueil) throw new Error('Jeu d’exemple absent.')
    const valeurs = valeursDepuis(SPEC_ARCHIVE, entree as unknown as ContenuDeclaratif)
    valeurs['sources'] = [
      { libelle: 'Exemple : archives', url: ' ', type: 'ecrite' },
    ] satisfies SourceFormulaire[]
    expect(
      versModification(SPEC_ARCHIVE, valeurs, entree as unknown as ContenuDeclaratif)['sources'],
    ).toEqual([{ libelle: 'Exemple : archives', url: null, type: 'ecrite' }])
    const page = valeursDepuis(SPEC_PAGES, accueil as unknown as ContenuDeclaratif)
    ;(page['blocs'] as Record<string, Record<string, string>>)['fr'] = {
      'accueil.manifeste': 'Exemple',
    }
    const corps = versModification(SPEC_PAGES, page, accueil as unknown as ContenuDeclaratif)
    expect(corps).not.toHaveProperty('blocs')
    expect(corps['traductions']).toMatchObject({
      fr: { blocs: { 'accueil.manifeste': 'Exemple' } },
    })
  })
})

describe('règles simulées', () => {
  it('une entrée d’archive sans source n’est pas publiable (règle du CDC)', async () => {
    await connecter('editeur')
    const a = await archive.lire(IDS_LOT3.archive)
    expect(a.champsAFournir).toContain('sources')
    const avecTexte = await archive.modifier(a.id, {
      fiabilite: 'documentee',
      traductions: { fr: { titre: 'Exemple — entrée', texte: 'Exemple : texte.' } },
      version: a.version,
    })
    const refus = await echec(
      archive.transition(a.id, { vers: 'en_relecture', version: avecTexte.version }),
    )
    expect(refus?.code).toBe('RG-03')
    const avecSource = await archive.modifier(a.id, {
      sources: [{ libelle: 'Exemple : témoignage', url: null, type: 'orale' }],
      version: avecTexte.version,
    })
    const soumis = await archive.transition(a.id, {
      vers: 'en_relecture',
      version: avecSource.version,
    })
    expect(soumis.contenu).toMatchObject({ statut: 'en_relecture' })
  })

  it('une seule parution à la une ; un univers sans lien ne se soumet pas', async () => {
    await connecter('admin')
    const premiere = await presse.lire(IDS_LOT3.presse)
    await presse.modifier(premiere.id, { aLaUne: true, version: premiere.version })
    const seconde = await presse.creer({
      source: 'Exemple — autre média',
      aLaUne: true,
      traductions: { fr: { titre: 'Exemple — seconde' } },
    })
    expect(seconde.aLaUne).toBe(true)
    expect((await presse.lire(premiere.id)).aLaUne).toBe(false)
    const u = await univers.lire(IDS_LOT3.univers)
    const refus = await echec(
      univers.transition(u.id, { vers: 'en_relecture', version: u.version }),
    )
    expect(refus?.code).toBe('RG-03')
  })

  it('pages : ensemble fermé ; une clé de bloc inconnue est refusée', async () => {
    await connecter('admin')
    const creation = await echec(pages.creer({ traductions: { fr: { titre: 'Exemple' } } }))
    expect(creation?.status).toBe(403)
    const [accueil] = magasin.pages
    if (!accueil) throw new Error('Jeu d’exemple absent.')
    const inconnue = await echec(
      pages.modifier(accueil.id, {
        traductions: { fr: { titre: 'Exemple', blocs: { 'cle.inventee': 'x' } } },
        version: accueil.version,
      }),
    )
    expect(inconnue?.code).toBe('VALIDATION')
  })
})

describe('écrans', () => {
  it('archive : le bloc des sources est mis en évidence ; ajouter une source l’enregistre', async () => {
    const { container } = await ouvrir('editeur', `/archive/${IDS_LOT3.archive}`)
    await titre('Exemple — entrée d’archive')
    expect(screen.getByText(/Aucune source : cette entrée ne pourra pas être publiée/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une source' }))
    fireEvent.change(screen.getByLabelText(/^Source 1/), {
      target: { value: 'Exemple : archives' },
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Enregistrer' })[0] as HTMLElement)
    await waitFor(() =>
      expect(magasin.archive[0]?.sources).toEqual([
        { libelle: 'Exemple : archives', url: null, type: 'ecrite' },
      ]),
    )
    expect(await violationsGraves(container)).toEqual([])
  })

  // Écran retiré du menu et des routes (C2) : test conservé, décision en C9 (docs/ELEMENTS-RETIRES.md).
  it.skip('pages : onze pages, ni création ni suppression ; les blocs de l’accueil se saisissent', async () => {
    await ouvrir('admin', '/pages')
    const tableau = await screen.findByRole('table', { name: 'Pages du site' })
    expect(within(tableau).getAllByRole('row')).toHaveLength(12)
    expect(screen.queryByRole('link', { name: /^Nouve/ })).toBeNull()
    expect(within(tableau).queryAllByRole('checkbox')).toHaveLength(0)
    fireEvent.click(within(tableau).getByRole('link', { name: 'Exemple — page accueil' }))
    await titre('Exemple — page accueil')
    fireEvent.change(screen.getByLabelText('accueil.manifeste (FR)'), {
      target: { value: 'Exemple : manifeste' },
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Enregistrer' })[0] as HTMLElement)
    await waitFor(() =>
      expect(magasin.pages.find((p) => p.cle === 'accueil')?.traductions.fr?.blocs).toEqual({
        'accueil.manifeste': 'Exemple : manifeste',
        'accueil.signature': '',
      }),
    )
  })

  it('distinctions, presse : listes et ordre d’affichage', async () => {
    for (const [chemin, nom] of [
      ['/distinctions', 'Distinctions'],
      ['/presse', 'Presse'],
    ] as const) {
      const { unmount } = await ouvrir('admin', chemin)
      expect(await screen.findByRole('table', { name: nom })).toBeTruthy()
      expect(screen.getByRole('button', { name: /Changer l’ordre d’affichage/ })).toBeTruthy()
      unmount()
    }
  })

  // Écrans retirés du menu et des routes (C2) : test conservé, décision en C9.
  it.skip('univers, jalons, offres : listes et ordre d’affichage', async () => {
    for (const [chemin, nom] of [
      ['/univers', 'Univers'],
      ['/jalons', 'Jalons'],
      ['/offres', 'Offres'],
    ] as const) {
      const { unmount } = await ouvrir('admin', chemin)
      expect(await screen.findByRole('table', { name: nom })).toBeTruthy()
      expect(screen.getByRole('button', { name: /Changer l’ordre d’affichage/ })).toBeTruthy()
      unmount()
    }
  })
})
