import { describe, expect, it } from 'vitest'
import {
  cheminDeCible,
  datePartielle,
  versArticle,
  versCategories,
  versDestinations,
  versDistinction,
  versEpisode,
  versJalon,
  versOffre,
  versPartenaire,
  versPresse,
  versProduit,
  versProjet,
  type ProduitPublic,
  type ProjetPublic,
} from './adaptateurs'

// Formes relevées sur l'API de développement (contrat 1.5.0 § 18.1), réduites à l'utile.
const image = {
  url: 'https://medias.exemple.test/a.jpg',
  alt: 'Exemple : alt',
  largeur: 1600,
  hauteur: 900,
  declinaisons: [],
}

const projet: ProjetPublic = {
  id: 'p1',
  format: 'Série',
  avancement: 'en_preparation',
  annee: null,
  image,
  cible: null,
  template: 'film',
  traduction: {
    slug: 'exemple-une-serie',
    titre: 'Exemple : une série',
    accroche: 'Exemple : accroche.',
  },
  titre: 'Exemple : une série',
  slug: 'exemple-une-serie',
  categorie: { slug: 'film', nom: 'Film' },
}

describe('adaptateurs de la vue publique (S2)', () => {
  it('article publié : date ISO, durée, image', () => {
    expect(
      versArticle({
        id: 'a1',
        slug: 'exemple-a',
        titre: 'Exemple : titre',
        extrait: 'Exemple : extrait.',
        categorie: 'Voyage',
        image,
        dureeLecture: 4,
        publieLe: '2026-11-08T10:09:21.630Z',
      }),
    ).toMatchObject({
      slug: 'exemple-a',
      statut: 'publié',
      categorie: 'Voyage',
      image: image.url,
      date: '2026-11-08',
      lecture: 4,
    })
  })

  it('épisode : textes de la traduction, guide en adresse', () => {
    const e = versEpisode({
      id: 'e1',
      numero: '01',
      slug: 'exemple-ep',
      titre: 'Exemple : épisode',
      image: null,
      guide: { ...image, url: 'https://medias.exemple.test/guide.pdf' },
      traduction: { lieu: 'Exemple : lieu', pitch: 'Exemple : pitch.' },
    })
    expect(e).toMatchObject({
      slug: 'exemple-ep',
      lieu: 'Exemple : lieu',
      pitch: 'Exemple : pitch.',
      image: '',
      guide: 'https://medias.exemple.test/guide.pdf',
    })
  })

  it('projet : statut en français, catégorie par son nom, page du template sans lien posé', () => {
    expect(versProjet(projet)).toMatchObject({
      statut: 'en préparation',
      categorie: 'Film',
      accroche: 'Exemple : accroche.',
      aFournir: false,
      route: '/xplore',
      pays: [],
    })
    expect(versProjet({ ...projet, template: 'programme' }).route).toBe('/taste-and-travel')
    expect(versProjet({ ...projet, cible: { type: 'page', cle: 'histoires' } }).route).toBe(
      '/histoires',
    )
  })

  it('cibles internes : accueil, ancre, page légale, contenu résolu ou non', () => {
    expect(cheminDeCible({ type: 'page', cle: 'accueil' })).toBe('/')
    expect(cheminDeCible({ type: 'ancre', cle: 'xplore', ancre: 'carte' })).toBe('/xplore#carte')
    expect(cheminDeCible({ type: 'page-legale', cle: 'cgv' })).toBe('/cgv')
    const chemins = { episodes: new Map([['e1', '/xplore/exemple-ep']]) }
    expect(cheminDeCible({ type: 'contenu', ressource: 'episodes', id: 'e1' }, chemins)).toBe(
      '/xplore/exemple-ep',
    )
    expect(
      cheminDeCible({ type: 'contenu', ressource: 'bijoux', id: 'x' }, chemins),
    ).toBeUndefined()
  })

  it('destinations : lien vers l’épisode ; sans coordonnées, hors de la carte', () => {
    const liste = versDestinations(
      [
        {
          id: 'd1',
          slug: 'exemple-abidjan',
          titre: 'Exemple : Abidjan',
          latitude: 5.36,
          longitude: -4,
          episodeId: 'e1',
        },
        {
          id: 'd2',
          slug: 'exemple-sans',
          titre: 'Exemple : sans',
          latitude: null,
          longitude: null,
        },
      ],
      new Map([['e1', 'exemple-ep']]),
    )
    expect(liste).toEqual([
      {
        slug: 'exemple-abidjan',
        nom: 'Exemple : Abidjan',
        lat: 5.36,
        lng: -4,
        episodeSlug: 'exemple-ep',
        guide: undefined,
      },
    ])
  })

  it('dates partielles du contrat', () => {
    expect(datePartielle('2024')).toBe('2024')
    expect(datePartielle('2025-03')).toBe('mars 2025')
    expect(datePartielle('2025-08-01')).toBe('01 août 2025')
    expect(datePartielle(null)).toBe('')
  })

  it('presse, distinction, jalon, partenaire, offre', () => {
    expect(
      versPresse({
        id: 'r1',
        source: 'Exemple : journal',
        datePublication: '2025-03',
        lien: 'https://exemple.test/a',
        titre: 'Exemple : portrait',
        traduction: { resume: 'Exemple : résumé.' },
      }),
    ).toEqual({
      source: 'Exemple : journal',
      date: 'mars 2025',
      titre: 'Exemple : portrait',
      resume: 'Exemple : résumé.',
      url: 'https://exemple.test/a',
    })
    expect(
      versDistinction({
        id: 'x1',
        annee: '2024',
        organisme: null,
        lien: null,
        image: null,
        titre: 'Exemple : prix',
        traduction: { description: null },
      }),
    ).toMatchObject({
      annee: '2024',
      delivreePar: undefined,
      description: '',
      image: '',
      url: undefined,
    })
    expect(
      versJalon({ id: 'j1', periode: '2019', titre: 'Exemple : jalon', traduction: {} }),
    ).toEqual({
      periode: '2019',
      titre: 'Exemple : jalon',
      description: '',
    })
    expect(versPartenaire({ id: 'pa', titre: 'Exemple : partenaire', logo: null })).toEqual({
      nom: 'Exemple : partenaire',
    })
    expect(
      versPartenaire({ id: 'pa', titre: '', traduction: { nom: 'Exemple : nom' }, logo: image }),
    ).toEqual({
      nom: 'Exemple : nom',
      logo: image.url,
    })
    expect(versOffre({ id: 'o1', titre: 'Exemple : offre', traduction: { texte: null } })).toEqual({
      titre: 'Exemple : offre',
      texte: '',
    })
  })

  it('catégories : famille posée, toutes visibles', () => {
    expect(
      versCategories('produit', [{ slug: 'b', nom: 'Bijoux & accessoires', compte: 2 }]),
    ).toEqual([{ famille: 'produit', nom: 'Bijoux & accessoires', visible: true }])
  })

  it('produit : variantes en matières et tailles, prix seulement s’il est confirmé', () => {
    const produit: ProduitPublic = {
      type: 'bijou',
      slug: 'exemple-pendentif',
      nom: 'Exemple : pendentif',
      reference: '01',
      image,
      categorie: { slug: 'b', nom: 'Bijoux & accessoires' },
      prixAffiche: 25000,
      prixConfirme: true,
      ancienPrix: null,
      disponible: true,
      histoire: 'Exemple : histoire.',
      culture: null,
      galerie: [image],
      variantes: [
        { matiere: 'Laiton', taille: null },
        { matiere: 'Laiton', taille: 'M' },
      ],
      createur: { nom: 'Exemple : atelier', pays: null, ville: null, bio: null },
    }
    expect(versProduit(produit)).toMatchObject({
      numero: '01',
      culture: '',
      commerce: {
        prix: 25000,
        matieres: ['Laiton'],
        tailles: ['M'],
        galerie: [image.url],
        categorie: 'Bijoux & accessoires',
        createur: { nom: 'Exemple : atelier', bio: '' },
      },
    })
    expect(versProduit({ ...produit, prixConfirme: false }).commerce?.prix).toBeNull()
  })
})
