import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { magasin } from '@/api/mocks/magasin'
import { violationsGraves } from '@/test/axe'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'

/** E1 : liste des projets, cartes de création, listes par format, épisodes rattachés, Livres. */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}
const titre = (nom: string | RegExp) => screen.findByRole('heading', { level: 1, name: nom })

describe('liste des projets', () => {
  it('« Nouveau projet » garde le template choisi dans le filtre', async () => {
    await ouvrir('admin', '/projets/liste?template=programme')
    expect(await titre('Liste des projets')).toBeTruthy()
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

describe('création depuis la liste des projets', () => {
  it('les deux cartes « Créer » sont en tête de /projets', async () => {
    const { container } = await ouvrir('admin', '/projets')
    expect(await titre('Liste des projets')).toBeTruthy()
    const creerProjet = screen.getByRole('link', { name: /Créer un projet/ })
    expect(creerProjet.textContent).toContain('Contenu, affiche, format, template')
    expect(creerProjet.getAttribute('href')).toBe('/projets/nouveau')
    const creerEpisode = screen.getByRole('link', { name: /Créer un épisode/ })
    expect(creerEpisode.textContent).toContain('Affiche, synopsis, vidéo, destination')
    expect(creerEpisode.getAttribute('href')).toBe('/episodes/nouveau')
    expect(await violationsGraves(container)).toEqual([])
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

  it('le template est bloqué dès qu’un projet existe', async () => {
    const projet = magasin.projets[0]
    if (!projet) throw new Error('Jeu d’exemple absent.')
    await ouvrir('admin', `/projets/${projet.id}`)
    // Le projet a un template assigné : le choix est bloqué et un message le dit.
    expect(await screen.findByText(/Verrouillé — le template est assigné au projet et ne change plus./)).toBeTruthy()
    const radios = screen.getAllByRole('radio', { name: /Template \w+/ }) as HTMLInputElement[]
    expect(radios.every((r) => r.disabled)).toBe(true)
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
  it.each([
    ['bibliotheque', 'Entrées de la bibliothèque', 'Nouvelle entrée d’archive', 'archive'],
    ['programme', 'Escales du programme', 'Villes', '/villes'],
  ] as const)('un projet %s ne propose pas de créer un épisode', async (template, libelleBloc, lien, chemin) => {
    const projet = magasin.projets[0]
    if (!projet) throw new Error('Jeu d’exemple absent.')
    const precedent = projet.template
    projet.template = template
    try {
      await ouvrir('admin', `/projets/${projet.id}`)
      const bloc = await screen.findByRole('region', { name: libelleBloc })
      expect(within(bloc).getByRole('link', { name: lien }).getAttribute('href')).toContain(chemin)
      expect(screen.queryByRole('region', { name: 'Épisodes du projet' })).toBeNull()
      expect(screen.queryByRole('link', { name: /Ajouter un épisode/ })).toBeNull()
    } finally {
      projet.template = precedent
    }
  })

  it('un épisode créé depuis la fiche d’un projet lui est rattaché', async () => {
    const projet = magasin.projets[0]
    if (!projet) throw new Error('Jeu d’exemple absent.')
    await ouvrir('admin', `/projets/${projet.id}`)
    const bloc = await screen.findByRole('region', { name: 'Épisodes du projet' })
    const creer = await within(bloc).findByRole('link', { name: /Ajouter un épisode/ })
    expect(creer.getAttribute('href')).toBe(`/episodes/nouveau?projetId=${projet.id}`)
    fireEvent.click(creer)
    await titre('Nouvel épisode')
    await waitFor(() =>
      expect((screen.getByRole('combobox', { name: /^Projet/ }) as HTMLSelectElement).value).toBe(
        projet.id,
      ),
    )
  })

  it('la suppression d’un projet avec épisodes est refusée et dit combien', async () => {
    const projet = magasin.projets[0]
    if (!projet) throw new Error('Jeu d’exemple absent.')
    // Le mock applique RG-32 comme le back end réel : un épisode rattaché empêche la suppression.
    magasin.episodes.push({
      ...structuredClone(magasin.episodes[0]!),
      id: '00000000-0000-4000-8000-000000000f99',
      projetId: projet.id,
    })
    const nombre = magasin.episodes.filter((e) => e.projetId === projet.id).length

    await ouvrir('admin', '/projets/liste')
    // Ouvrir le dialogue de suppression sur la carte du projet, puis confirmer.
    fireEvent.click(await screen.findByRole('button', { name: 'Supprimer' }))
    const dialogue = await screen.findByRole('dialog', { name: 'Supprimer ce projet ?' })
    fireEvent.click(within(dialogue).getByRole('button', { name: 'Supprimer' }))

    const refus = await screen.findByRole('alert', { name: 'Ce projet contient des épisodes' })
    expect(refus.textContent).toContain('Ce projet contient des épisodes')
    expect(refus.textContent).toContain(String(nombre))
    expect(screen.queryByRole('dialog')).toBeNull()
    const lien = within(refus).getByRole('link', { name: 'Voir les épisodes de ce projet' })
    expect(lien.getAttribute('href')).toBe(`/episodes?projetId=${projet.id}`)
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
    fireEvent.click(screen.getByRole('button', { name: 'Créer le livre' }))
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
