import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { destinations, episodes, projets } from '@/api/endpoints/editorial'
import type { ErreurApi } from '@/api/erreurs'
import { IDS_EXEMPLE } from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'
import {
  schemaFormulaire,
  valeursDepuis,
  valeursVides,
  versEntree,
  versModification,
  type ContenuDeclaratif,
} from '@/features/gabarits/declaratif'
import { violationsGraves } from '@/test/axe'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'
import { SPEC_DESTINATIONS, SPEC_EPISODES } from './specs'

/** Étape 6 : épisodes, projets, villes, destinations sur le gabarit déclaratif (D-62). */

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

describe('conversions déclaratives', () => {
  it('vide reste vide : texte de crédibilité à null, nombre à null, jamais 0', () => {
    const valeurs = valeursVides(SPEC_EPISODES)
    valeurs['numero'] = '03'
    valeurs.traductions.fr['titre'] = 'Exemple'
    const entree = versEntree(SPEC_EPISODES, valeurs)
    expect(entree).toMatchObject({ dureeMinutes: null, trailerUrl: null, imageId: null })
    expect(entree['traductions']).toEqual({
      fr: {
        titre: 'Exemple',
        lieu: '',
        pitch: '',
        synopsisLong: null,
        noteIntention: null,
        personnages: null,
        makingOf: null,
        presse: null,
        credits: null,
      },
    })
  })

  it('une langue vidée qui existait part à null ; la version lue accompagne la modification', () => {
    const [destination] = magasin.destinations
    if (!destination) throw new Error('Jeu d’exemple absent.')
    const contenu = { ...destination, languesPresentes: ['fr', 'en'] } as ContenuDeclaratif
    const valeurs = valeursDepuis(SPEC_DESTINATIONS, contenu)
    valeurs.traductions.en['nom'] = ''
    const modification = versModification(SPEC_DESTINATIONS, valeurs, contenu)
    expect(modification['traductions']).toMatchObject({ en: null })
    expect(modification['version']).toBe(destination.version)
  })

  it('refuse une longitude hors bornes, une adresse sans https, une langue entamée sans titre', () => {
    const valeurs = valeursVides(SPEC_DESTINATIONS)
    valeurs.traductions.fr['nom'] = 'Exemple'
    valeurs['longitude'] = '200'
    valeurs.traductions.en['texte'] = 'Texte sans nom'
    const lu = schemaFormulaire(SPEC_DESTINATIONS).safeParse(valeurs)
    expect(lu.success ? [] : lu.error.issues.map((i) => i.path.join('.'))).toEqual([
      'longitude',
      'traductions.en.nom',
    ])
    const episode = valeursVides(SPEC_EPISODES)
    episode['numero'] = '04'
    episode['trailerUrl'] = 'http://exemple.test'
    episode.traductions.fr['titre'] = 'Exemple'
    const refus = schemaFormulaire(SPEC_EPISODES).safeParse(episode)
    expect(refus.success ? [] : refus.error.issues.map((i) => i.path.join('.'))).toEqual([
      'trailerUrl',
    ])
  })
})

describe('règles simulées', () => {
  it('COORDONNEES_HORS_PAYS : une longitude positive sort de la Côte d’Ivoire (Adiaké)', async () => {
    await connecter('editeur')
    const refus = await echec(
      destinations.creer({
        latitude: 5.29,
        longitude: 3.3,
        tagIds: [IDS_EXEMPLE.tagCoteIvoire],
        traductions: { fr: { nom: 'Exemple — Adiaké' } },
      }),
    )
    expect(refus?.code).toBe('COORDONNEES_HORS_PAYS')
    expect(refus?.champ).toBe('longitude')
    const creee = await destinations.creer({
      latitude: 5.29,
      longitude: -3.3,
      tagIds: [IDS_EXEMPLE.tagCoteIvoire],
      traductions: { fr: { nom: 'Exemple — Adiaké' } },
    })
    expect(creee.champsAFournir).toContain('traductions.fr.texte')
  })

  it('une destination sans pays ne se soumet pas ; un numéro d’épisode est unique', async () => {
    await connecter('editeur')
    const d = await destinations.lire(IDS_EXEMPLE.destination)
    const refus = await echec(
      destinations.transition(d.id, { vers: 'en_relecture', version: d.version }),
    )
    expect(refus?.code).toBe('RG-03')
    const doublon = await echec(
      episodes.creer({ numero: '01', traductions: { fr: { titre: 'Exemple' } } }),
    )
    expect(doublon?.code).toBe('RG-04')
  })

  it('un projet en préparation se publie sans image ; une cible non publiée bloque', async () => {
    await connecter('admin')
    const p = await projets.lire(IDS_EXEMPLE.projet)
    const avecTexte = await projets.modifier(p.id, {
      traductions: { fr: { titre: 'Exemple — projet', accroche: 'Exemple : accroche' } },
      version: p.version,
    })
    const cible = await projets.modifier(p.id, {
      cible: { type: 'contenu', ressource: 'articles', id: IDS_EXEMPLE.articleBrouillon },
      version: avecTexte.version,
    })
    const bloque = await echec(
      projets.transition(p.id, { vers: 'en_relecture', version: cible.version }),
    )
    expect(bloque?.code).toBe('RG-03')
    const sansCible = await projets.modifier(p.id, { cible: null, version: cible.version })
    const soumis = await projets.transition(p.id, {
      vers: 'en_relecture',
      version: sansCible.version,
    })
    expect(soumis.contenu).toMatchObject({ statut: 'en_relecture', imageId: null })
  })
})

describe('écrans', () => {
  it('épisodes : liste avec numéro ; création, l’adresse suit le titre ; axe', async () => {
    const { container } = await ouvrir('editeur', '/episodes/nouveau')
    await titre('Nouvel épisode')
    fireEvent.change(document.getElementById('numero') as HTMLElement, { target: { value: '07' } })
    fireEvent.change(document.getElementById('traductions.fr.titre') as HTMLElement, {
      target: { value: 'Exemple : la lagune' },
    })
    expect((document.getElementById('traductions.fr.slug') as HTMLInputElement).value).toBe(
      'exemple-la-lagune',
    )
    fireEvent.click(screen.getAllByRole('button', { name: 'Enregistrer' })[0] as HTMLElement)
    expect(await titre('07 — Exemple : la lagune')).toBeTruthy()
    expect(magasin.episodes.some((e) => e.numero === '07')).toBe(true)
    expect(await violationsGraves(container)).toEqual([])
  })

  it('destinations : le refus du serveur sur les coordonnées va au champ', async () => {
    const destination = magasin.destinations.find((d) => d.id === IDS_EXEMPLE.destination)
    if (!destination) throw new Error('Jeu d’exemple absent.')
    destination.tagIds = [IDS_EXEMPLE.tagCoteIvoire]
    await ouvrir('editeur', `/destinations/${IDS_EXEMPLE.destination}`)
    await titre('Exemple — destination')
    fireEvent.change(document.getElementById('latitude') as HTMLElement, {
      target: { value: '5,29' },
    })
    fireEvent.change(document.getElementById('longitude') as HTMLElement, {
      target: { value: '3.3' },
    })
    fireEvent.click(screen.getAllByRole('button', { name: 'Enregistrer' })[0] as HTMLElement)
    expect(await screen.findAllByText(/hors de la Côte d’Ivoire/)).not.toHaveLength(0)
    expect(destination.longitude).toBeNull()
  })

  it('projets : l’ordre d’affichage s’ouvre et se règle au clavier ; villes sans adresse', async () => {
    magasin.projets.push({
      ...structuredClone(magasin.projets[0]!),
      id: '00000000-0000-4000-8000-000000000f12',
      ordre: 1,
      traductions: { fr: { slug: 'exemple-second', titre: 'Exemple — second', accroche: '' } },
    })
    // Le hub occupe /projets (ECRANS § 3.1) : la liste ordonnable est à /projets/liste.
    await ouvrir('admin', '/projets/liste')
    fireEvent.click(await screen.findByRole('button', { name: /Changer l’ordre d’affichage/ }))
    const liste = await screen.findByRole('list', { name: 'Ordre d’affichage sur le site' })
    fireEvent.click(within(liste).getByRole('button', { name: 'Monter « Exemple — second »' }))
    await waitFor(() =>
      expect(magasin.projets.find((p) => p.traductions.fr?.slug === 'exemple-second')?.ordre).toBe(
        0,
      ),
    )
  })

  it('villes : pas de champ d’adresse, ce ne sont pas des pages', async () => {
    await ouvrir('editeur', `/villes/${IDS_EXEMPLE.ville}`)
    await titre('Exemple — ville')
    expect(document.getElementById('traductions.fr.slug')).toBeNull()
    expect(document.getElementById('traductions.fr.intention')).not.toBeNull()
  })
})
