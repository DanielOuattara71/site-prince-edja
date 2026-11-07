import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import {
  bijouxInitiaux,
  ID_CREATEUR_EXEMPLE,
  ID_CREATEUR_PRINCIPAL,
  IDS_EXEMPLE,
} from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'
import { violationsGraves } from '@/test/axe'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'
import {
  schemaFormulaireBijou,
  valeursDepuisBijou,
  valeursVides,
  versEntree,
  versModification,
} from './valeurs'

/**
 * Étape 6 : boutique — mode « sur demande », prix masqué, créateur principal protégé
 * (section 13 du prompt admin).
 */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}
const titre = (nom: string | RegExp) => screen.findByRole('heading', { level: 1, name: nom })

describe('valeurs du formulaire de bijou', () => {
  const [brouillon] = bijouxInitiaux()
  if (!brouillon) throw new Error('Jeu d’exemple absent.')

  it('vide reste vide : ni poids, ni édition, ni prix inventés ; prixConfirme réservé à l’admin', () => {
    const valeurs = valeursVides()
    valeurs.numero = '05'
    valeurs.categorieId = IDS_EXEMPLE.categorieBijoux
    valeurs.traductions.fr.nom = 'Exemple'
    valeurs.prixConfirme = true
    const entree = versEntree(valeurs, false)
    expect(entree).toMatchObject({ poids: null, edition: null, atelier: null })
    expect(entree).not.toHaveProperty('prixConfirme')
    expect(versEntree(valeurs, true).prixConfirme).toBe(true)
    expect(versModification(valeursDepuisBijou(brouillon), brouillon)).not.toHaveProperty(
      'prixConfirme',
    )
  })

  it('refuse une édition dont le numéro dépasse le tirage, et un poids négatif', () => {
    const valeurs = valeursDepuisBijou(brouillon)
    valeurs.editionNumero = '9'
    valeurs.editionTotal = '3'
    valeurs.poids = '-2'
    const lu = schemaFormulaireBijou.safeParse(valeurs)
    expect(lu.success ? [] : lu.error.issues.map((i) => i.path.join('.'))).toEqual([
      'editionNumero',
      'poids',
    ])
  })
})

describe('bijoux', () => {
  it('liste : prix « sur demande », pas de filtre créateur hors multi-vendeurs ; axe', async () => {
    const { container } = await ouvrir('editeur', '/bijoux')
    const tableau = await screen.findByRole('table', { name: 'Bijoux' })
    expect(within(tableau).getAllByText('Sur demande').length).toBeGreaterThan(0)
    expect(screen.queryByLabelText('Créateur', { selector: 'select' })).toBeNull()
    expect(await violationsGraves(container)).toEqual([])
  })

  it('fiche : aperçu « sur demande », sélecteur de créateur masqué, prix confirmable par l’admin seulement', async () => {
    await ouvrir('editeur', `/bijoux/${IDS_EXEMPLE.bijouPublie}`)
    await titre(/Exemple — bracelet/)
    expect(screen.queryByLabelText(/Créateur du produit/)).toBeNull()
    expect(screen.getByRole('switch', { name: /Prix confirmé/ })).toHaveProperty('disabled', true)
    expect(screen.getByText(/Seul un administrateur confirme un prix/)).toBeTruthy()
    fireEvent.click(screen.getByRole('tab', { name: 'Aperçu' }))
    expect(await screen.findByText('Sur demande')).toBeTruthy()
  })

  it('variantes : la référence par défaut ; pas de stock hors vente en ligne', async () => {
    await ouvrir('admin', `/bijoux/${IDS_EXEMPLE.bijouBrouillon}`)
    await titre(/Exemple — pendentif/)
    expect(screen.getByText(/Variante 01-1/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: /Modifier 01-1/ }))
    const dialogue = await screen.findByRole('dialog', { name: 'Variante 01-1' })
    expect(within(dialogue).queryByLabelText(/^Stock/)).toBeNull()
    fireEvent.change(within(dialogue).getByLabelText(/^Prix \(FCFA\)/), {
      target: { value: '45000' },
    })
    fireEvent.click(within(dialogue).getByRole('button', { name: 'Enregistrer la variante' }))
    await waitFor(() =>
      expect(
        magasin.bijoux.find((b) => b.id === IDS_EXEMPLE.bijouBrouillon)?.variantes[0]?.prix,
      ).toBe(45000),
    )
    // Le prix est saisi mais pas confirmé : le site affiche toujours « sur demande ».
    fireEvent.click(screen.getByRole('tab', { name: 'Aperçu' }))
    expect(await screen.findByText('Sur demande')).toBeTruthy()
  })
})

describe('créateurs', () => {
  it('le principal est marqué « Plateforme », ni désactivable ni supprimable (RG-21)', async () => {
    const { container } = await ouvrir('admin', `/createurs/${ID_CREATEUR_PRINCIPAL}`)
    await titre('Prince Edja')
    expect(screen.getByText(/Créateur principal de la plateforme/)).toBeTruthy()
    expect(screen.getByRole('switch', { name: /Actif/ })).toHaveProperty('disabled', true)
    expect(screen.queryByRole('button', { name: /Supprimer le créateur|Désactiver/ })).toBeNull()
    expect(await violationsGraves(container)).toEqual([])
  })

  it('un créateur sans produit se supprime ; la liste marque le principal', async () => {
    await ouvrir('admin', '/createurs')
    const tableau = await screen.findByRole('table', { name: 'Créateurs' })
    expect(within(tableau).getByText('plateforme')).toBeTruthy()
    fireEvent.click(within(tableau).getByRole('link', { name: /créateur invité/ }))
    await titre(/créateur invité/)
    expect(screen.getByRole('button', { name: 'Supprimer le créateur' })).toBeTruthy()
    expect(magasin.createurs.some((c) => c.id === ID_CREATEUR_EXEMPLE)).toBe(true)
  })

  it('l’écran des créateurs est réservé aux admins (section 9)', async () => {
    await ouvrir('editeur', `/createurs/${ID_CREATEUR_PRINCIPAL}`)
    expect(await screen.findByRole('heading', { level: 1, name: /Accès refusé/ })).toBeTruthy()
  })
})

describe('catégories', () => {
  it('trois sections ; huit catégories de produits avec leur nombre d’éléments ; axe', async () => {
    const { container } = await ouvrir('admin', '/categories')
    await titre('Catégories')
    for (const section of ['Articles', 'Projets', 'Produits (bijoux et livres)'])
      expect(screen.getByRole('heading', { level: 2, name: section })).toBeTruthy()
    const liste = await screen.findByRole('list', {
      name: 'Ordre des catégories — Produits (bijoux et livres)',
    })
    expect(within(liste).getAllByRole('listitem')).toHaveLength(8)
    expect(within(liste).getByText(/^2 élément\(s\)/)).toBeTruthy()
    const articles = await screen.findByRole('list', { name: 'Ordre des catégories — Articles' })
    expect(within(articles).getAllByRole('listitem')).toHaveLength(8)
    // Catégories de projets de départ (décision du client) : Film, Tourisme, Patrimoine.
    const projets = await screen.findByRole('list', { name: 'Ordre des catégories — Projets' })
    expect(
      within(projets)
        .getAllByRole('listitem')
        .map((li) => li.textContent),
    ).toEqual([
      expect.stringContaining('Film'),
      expect.stringContaining('Tourisme'),
      expect.stringContaining('Patrimoine'),
    ])
    expect(within(liste).getByRole('button', { name: 'Modifier « Mode »' })).toBeTruthy()
    expect(await violationsGraves(container)).toEqual([])
  })

  it('l’admin crée une catégorie ; l’adresse suit le nom', async () => {
    await ouvrir('admin', '/categories')
    fireEvent.click(
      await screen.findByRole('button', { name: 'Ajouter — Produits (bijoux et livres)' }),
    )
    const dialogue = await screen.findByRole('dialog', { name: 'Nouvelle catégorie' })
    fireEvent.change(within(dialogue).getByLabelText(/^Nom \(FR\)/), {
      target: { value: 'Exemple : Perles' },
    })
    expect((within(dialogue).getByLabelText(/^Adresse/) as HTMLInputElement).value).toBe(
      'exemple-perles',
    )
    fireEvent.click(within(dialogue).getByRole('button', { name: 'Enregistrer' }))
    await waitFor(() => expect(magasin.categories).toHaveLength(20))
    expect(magasin.categories.at(-1)?.famille).toBe('produit')
    expect(await screen.findByText('Exemple : Perles')).toBeTruthy()
  })
})
