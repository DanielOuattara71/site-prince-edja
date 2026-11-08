import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { magasin } from '@/api/mocks/magasin'
import { violationsGraves } from '@/test/axe'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'

/** E1 : hub Projets (photo de référence), listes par format, épisodes rattachés, Livres. */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}
const titre = (nom: string | RegExp) => screen.findByRole('heading', { level: 1, name: nom })

describe('hub Projets (ECRANS § 3.1)', () => {
  it('libellés exacts de la photo, compteurs, aucune violation axe', async () => {
    const { container } = await ouvrir('admin', '/projets')
    await titre('Projets')
    expect(
      screen.getByText('Créez et organisez vos projets, épisodes et leur affichage public.'),
    ).toBeTruthy()
    const creerProjet = screen.getByRole('link', { name: /Créer un projet/ })
    expect(creerProjet.textContent).toContain('Contenu, affiche, format, template')
    expect(creerProjet.getAttribute('href')).toBe('/projets/nouveau')
    expect(screen.getByRole('link', { name: /Créer un épisode/ }).textContent).toContain(
      'Affiche, synopsis, vidéo, destination',
    )
    expect(screen.getByRole('heading', { level: 2, name: 'Moteur de rendu public' })).toBeTruthy()
    expect(
      screen.getByText(
        'Chaque projet choisit son template ; tous les épisodes partagent un template unique.',
      ),
    ).toBeTruthy()
    // Trois templates, chacun avec son projet de référence (PROPOSITION-TEMPLATES-PROJETS § 4).
    for (const [carte, reference] of [
      ['Template Film', 'Comme X’PLORE'],
      ['Template Programme', 'Comme Taste & Travel'],
      ['Template Bibliothèque', 'Comme Archive d’Afrique'],
    ] as const) {
      const lien = screen.getByRole('link', { name: new RegExp(carte) })
      expect(lien.textContent).toContain(reference)
      expect(lien.getAttribute('href')).toMatch(/^\/projets\/liste\?template=/)
    }
    const episode = screen.getByRole('link', { name: /Template unique d'épisode/ })
    expect(episode.textContent).toContain('Utilisé par tous les projets')
    expect(episode.getAttribute('href')).toBe('/episodes')
    expect(screen.getByText('Les mises en page sont gérées dans le code du site.')).toBeTruthy()
    const donnees = screen.getByRole('heading', { level: 2, name: 'Données partagées' })
    const bloc = donnees.closest('section') as HTMLElement
    for (const puce of ['Destinations', 'Guides PDF', 'Villes', 'Archive'])
      expect(within(bloc).getByRole('link', { name: new RegExp(puce) })).toBeTruthy()
    // Un compteur par carte : le projet d'exemple utilise le template Film.
    await waitFor(() =>
      expect(screen.getByRole('link', { name: /Template Film/ }).textContent).toContain('1 projet'),
    )
    expect(await violationsGraves(container)).toEqual([])
  })

  it('une carte ouvre la liste de son template ; « Nouveau projet » garde le template', async () => {
    await ouvrir('admin', '/projets')
    fireEvent.click(await screen.findByRole('link', { name: /Template Programme/ }))
    expect(await titre('Template Programme')).toBeTruthy()
    expect(window.location.pathname).toBe('/projets/liste')
    const fil = screen.getByRole('navigation', { name: /Fil d’Ariane/ })
    expect(within(fil).getByRole('link', { name: 'Projets' }).getAttribute('href')).toBe('/projets')
    const creer = screen.getByRole('link', { name: 'Nouveau projet' })
    expect(creer.getAttribute('href')).toBe('/projets/nouveau?template=programme')
    fireEvent.click(creer)
    await titre('Nouveau projet')
    const programme = screen.getByRole('radio', { name: /Template Programme/ }) as HTMLInputElement
    expect(programme.checked).toBe(true)
    // Champs propres au template Programme : escales et programme ; pas de saison (Film).
    expect(screen.getByRole('group', { name: 'Escales' })).toBeTruthy()
    expect(screen.queryByLabelText(/^Saison/)).toBeNull()
  })
})

describe('templates de projet (PROPOSITION-TEMPLATES-PROJETS)', () => {
  it('le format propose un template sans l’imposer', async () => {
    await ouvrir('admin', '/projets/nouveau')
    await titre('Nouveau projet')
    fireEvent.change(screen.getByRole('combobox', { name: /^Format/ }), {
      target: { value: 'Émission' },
    })
    const proposition = await screen.findByText(/Proposé pour ce format/)
    expect(proposition.textContent).toContain('Template Programme')
    fireEvent.click(screen.getByRole('button', { name: 'Utiliser' }))
    expect(
      (screen.getByRole('radio', { name: /Template Programme/ }) as HTMLInputElement).checked,
    ).toBe(true)
  })

  it('changer de template dit ce qui apparaît et ce qui ne s’affiche plus, sans rien effacer', async () => {
    const projet = magasin.projets[0]
    if (!projet) throw new Error('Jeu d’exemple absent.')
    await ouvrir('admin', `/projets/${projet.id}`)
    fireEvent.click(await screen.findByRole('radio', { name: /Template Bibliothèque/ }))
    const alerte = await screen.findByText(/Changer de template ne supprime aucune donnée/)
    const bloc = alerte.parentElement as HTMLElement
    expect(bloc.textContent).toContain('Entrées documentées')
    expect(bloc.textContent).toContain('Carte des étapes')
  })

  it('un projet enregistré sans template prend celui de son format', async () => {
    const projet = magasin.projets[0]
    if (!projet) throw new Error('Jeu d’exemple absent.')
    delete projet.template
    projet.format = 'Archive'
    await ouvrir('admin', `/projets/${projet.id}`)
    expect(
      ((await screen.findByRole('radio', { name: /Template Bibliothèque/ })) as HTMLInputElement)
        .checked,
    ).toBe(true)
  })

  it('le template Programme exige une escale pour publier', async () => {
    await connecter('admin')
    const projet = magasin.projets[0]
    if (!projet) throw new Error('Jeu d’exemple absent.')
    const { projets } = await import('@/api/endpoints/editorial')
    const lu = await projets.lire(projet.id)
    const modifie = await projets.modifier(projet.id, {
      template: 'programme',
      version: lu.version,
    })
    // L'exigence entre dans « à compléter » : la liste « Il manque » la montre avant publication.
    expect(modifie.champsAFournir).toContain('escaleIds')
  })
})

describe('projets et épisodes (ECRANS § 3.3, § 3.4)', () => {
  it('un épisode créé depuis la fiche d’un projet lui est rattaché', async () => {
    const projet = magasin.projets[0]
    if (!projet) throw new Error('Jeu d’exemple absent.')
    await ouvrir('admin', `/projets/${projet.id}`)
    const bloc = await screen.findByRole('region', { name: 'Épisodes du projet' })
    const creer = await within(bloc).findByRole('link', { name: /Créer un épisode dans ce projet/ })
    expect(creer.getAttribute('href')).toBe(`/episodes/nouveau?projetId=${projet.id}`)
    fireEvent.click(creer)
    await titre('Nouvel épisode')
    await waitFor(() =>
      expect((screen.getByRole('combobox', { name: /^Projet/ }) as HTMLSelectElement).value).toBe(
        projet.id,
      ),
    )
  })
})

describe('Livres (ECRANS § 4.3)', () => {
  it('crée un livre avec une variante ; seules les catégories de produits sont proposées', async () => {
    await ouvrir('admin', '/livres/nouveau')
    await titre('Nouveau livre')
    const categorie = screen.getByRole('combobox', { name: /^Catégorie de produit/ })
    await waitFor(() => expect(within(categorie).getAllByRole('option').length).toBeGreaterThan(1))
    const options = within(categorie)
      .getAllByRole('option')
      .map((o) => o.textContent)
    expect(options).toContain('Livres & photographie')
    expect(options).not.toContain('Voyage')
    // La catégorie d'un livre est obligatoire dès l'enregistrement (comme côté back end).
    const livresPhoto = within(categorie)
      .getAllByRole('option')
      .find((o) => o.textContent === 'Livres & photographie') as HTMLOptionElement
    fireEvent.change(categorie, { target: { value: livresPhoto.value } })
    fireEvent.change(document.getElementById('reference') as HTMLElement, {
      target: { value: 'L01' },
    })
    fireEvent.change(document.getElementById('traductions.fr.titre') as HTMLElement, {
      target: { value: 'Exemple : carnet de route' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Ajouter une variante' }))
    fireEvent.change(document.getElementById('variantes.0.libelle') as HTMLElement, {
      target: { value: 'Broché' },
    })
    fireEvent.click(screen.getAllByRole('button', { name: /^Enregistrer/ })[0] as HTMLElement)
    await waitFor(() => expect(magasin.livres).toHaveLength(1))
    const livre = magasin.livres[0]
    expect(livre?.reference).toBe('L01')
    expect(livre?.categorieId).toBe(livresPhoto.value)
    expect(livre?.variantes).toHaveLength(1)
    expect(livre?.variantes[0]).toMatchObject({ libelle: 'Broché', prix: null, stock: null })
    expect(livre?.variantes[0]?.id).toBeTruthy()
  }, 30_000)

  it('la liste des livres est vide au départ et le dit', async () => {
    await ouvrir('editeur', '/livres')
    await titre('Livres')
    expect(await screen.findByText('Aucun contenu pour le moment.')).toBeTruthy()
  })
})
