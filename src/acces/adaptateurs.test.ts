import { describe, expect, it } from 'vitest'
import {
  cheminDeCible,
  datePartielle,
  versArchive,
  versArticle,
  versCategories,
  versDestinations,
  versDistinction,
  versEpisode,
  versGalerie,
  versJalon,
  versOffre,
  versPageLegale,
  versPartenaire,
  versPresse,
  versProduit,
  versProjet,
  versUnivers,
  versVille,
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

describe('villes, archive, univers, galerie, pages légales (S2, lot 2)', () => {
  it('ville : nom/intention de la traduction, image publique', () => {
    expect(
      versVille({
        id: 'v1',
        image,
        traduction: { nom: 'Exemple : Conakry', intention: 'Exemple : intention.' },
      }),
    ).toMatchObject({
      nom: 'Exemple : Conakry',
      intention: 'Exemple : intention.',
      image: image.url,
      tags: { format: 'destination', projet: 'TASTE_TRAVEL' },
    })
  })

  it('archive : fiabilite normalisée, sources conservées, texte vide tant que non rempli', () => {
    expect(
      versArchive({
        id: 'a1',
        slug: 'exemple-marche',
        categorie: 'Marché',
        fiabilite: 'memoire_orale',
        epoque: '1970',
        sources: [
          { libelle: 'Exemple : source orale', url: null, type: 'orale' },
          { libelle: 'Exemple : source écrite', url: 'https://exemple.test', type: 'ecrite' },
        ],
        traduction: { titre: 'Exemple : marché de Grand-Bassam', texte: 'Exemple : texte.' },
      }),
    ).toMatchObject({
      slug: 'exemple-marche',
      titre: 'Exemple : marché de Grand-Bassam',
      categorie: 'Marché',
      texte: 'Exemple : texte.',
      fiabilite: 'memoire orale',
      epoque: '1970',
      sources: ['Exemple : source orale', 'Exemple : source écrite'],
    })
    expect(
      versArchive({
        id: 'a2',
        slug: 'x',
        categorie: 'x',
        fiabilite: null,
        epoque: null,
        sources: [],
      }),
    ).toMatchObject({ sources: [], fiabilite: undefined })
  })

  it('univers : numéro, titre, destination (page fixe) saut si brisée', () => {
    expect(
      versUnivers({
        id: 'u1',
        numero: '02',
        cible: { type: 'page', cle: 'xplore' },
        traduction: { nom: 'Exemple : explorateur', pitch: 'Exemple : pitch.' },
      }),
    ).toMatchObject({ numero: '02', nom: 'Exemple : explorateur', to: '/xplore' })
    expect(
      versUnivers({ id: 'u2', numero: '01', cible: null, traduction: { nom: 'Exemple : griot' } })
        .to,
    ).toBe('#')
  })

  it('galerie : image publique, ratio relayée, lien externe marqué', () => {
    expect(
      versGalerie({
        id: 'g1',
        emplacement: 'accueil',
        image,
        lienExterne: 'https://exemple.test',
        cible: null,
        ratio: '4/3',
        parallaxe: 5,
        ordre: 1,
        traduction: { etiquette: 'Bouaké' },
      }),
    ).toMatchObject({
      src: image.url,
      alt: image.alt,
      ratio: '4/3',
      speed: 5,
      to: 'https://exemple.test',
      label: 'Bouaké',
      external: true,
    })
  })

  it('page légale : chemin, famille, titre ; sections laissées vides', () => {
    expect(
      versPageLegale({
        id: 'pl1',
        cle: 'confidentialite',
        traduction: { titre: 'Exemple : confidentialité', resume: 'Exemple : resume.' },
      }),
    ).toMatchObject({
      chemin: '/confidentialite',
      famille: 'Informations légales',
      titre: { fr: 'Exemple : confidentialité' },
      resume: { fr: 'Exemple : resume.' },
      sections: [],
    })
  })
})
