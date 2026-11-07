import { CATEGORIES_ARTICLE, type Article } from '@/api/schemas/articles'
import type { Bijou, Categorie } from '@/api/schemas/boutique'
import type { Createur } from '@/api/schemas/createurs'
import type { z } from 'zod'
import type {
  archiveSchema,
  Destination,
  distinctionSchema,
  Episode,
  EtudeCas,
  Galerie,
  jalonSchema,
  offreSchema,
  PageLegale,
  pageSchema,
  Partenaire,
  presseSchema,
  Projet,
  universSchema,
  Ville,
} from '@/api/schemas/editorial'
import { CLES_PAGE, CLES_PAGE_LEGALE, type CibleInterne } from '@/api/schemas/communs'
import type { Compte } from '@/api/schemas/communs'
import type { ChiffreAudience, MotifContact, Navigation, Parametres } from '@/api/schemas/reglages'
import type { Media } from '@/api/schemas/medias'
import type { Tag } from '@/api/schemas/tags'
import type { Abonne, Demande, Message } from '@/api/schemas/audience'

/**
 * Jeux d'exemple du faux serveur. **Jamais livrés en production** : `verifier-dist`
 * échoue s'il trouve `__PE_EXEMPLE__` ou un compte `@exemple.test` dans `dist`.
 *
 * Aucun texte prétendument réel : chaque titre est marqué « Exemple », et les champs
 * que le client doit fournir restent vides (section 7 du prompt admin).
 */
export const MARQUEUR_EXEMPLE = '__PE_EXEMPLE__'

/** Code du tag pays qui déclenche le contrôle `COORDONNEES_HORS_PAYS` (§ 9.5, D-64). */
export const CODE_PAYS_COTE_IVOIRE = 'cote-d-ivoire'

/** Mot de passe commun aux trois comptes d'essai, en développement seulement. */
export const MOT_DE_PASSE_ESSAI = 'exemple-mot-de-passe'

/** Catégorie de projets « Film » (données de départ). */
export const ID_CATEGORIE_FILM = '00000000-0000-4000-8000-000000000c41'
export const ID_CREATEUR_PRINCIPAL = '00000000-0000-4000-8000-00000000c001'
export const ID_CREATEUR_EXEMPLE = '00000000-0000-4000-8000-00000000c002'

/**
 * Créateur stocké par le faux serveur : l'objet du contrat, plus la date de première
 * publication, qui fige l'adresse (`SLUG_FIGE`, § 10.2) et ne sort jamais de l'API.
 */
export type CreateurEssai = Createur & { premierePublicationLe: string | null }

/**
 * Le principal existe dans toute installation (données de départ du back end) : sa biographie
 * reste vide, à fournir. Le second est inactif, comme tout créateur non principal tant que
 * `multiVendeurs` est faux.
 */
export function createursInitiaux(): CreateurEssai[] {
  const base = {
    publieLe: '2026-10-30T08:00:00.000Z',
    creeLe: '2026-10-30T08:00:00.000Z',
    modifieLe: '2026-10-30T08:00:00.000Z',
    auteurId: null,
    version: 1,
    champsAFournir: [],
    languesPresentes: ['fr' as const],
    dernierMotifRefus: null,
    statut: 'publie' as const,
    pays: null,
    ville: null,
    photoId: null,
    tauxCommission: null,
    nombreBijoux: 0,
    premierePublicationLe: '2026-10-30T08:00:00.000Z',
  }
  return [
    {
      ...base,
      id: ID_CREATEUR_PRINCIPAL,
      slug: 'prince-edja',
      nom: 'Prince Edja',
      actif: true,
      estPrincipal: true,
      traductions: { fr: { bio: '', accroche: null } },
    },
    {
      ...base,
      id: ID_CREATEUR_EXEMPLE,
      slug: 'exemple-createur',
      nom: 'Exemple — créateur invité',
      actif: false,
      estPrincipal: false,
      traductions: { fr: { bio: 'Exemple : biographie du créateur invité.', accroche: null } },
    },
  ]
}

const ids = {
  editeur: '00000000-0000-4000-8000-0000000000e1',
  admin: '00000000-0000-4000-8000-0000000000a1',
  superAdmin: '00000000-0000-4000-8000-0000000000f1',
  tagFormat: '00000000-0000-4000-8000-0000000007a1',
  tagPays: '00000000-0000-4000-8000-0000000007a2',
  tagTheme: '00000000-0000-4000-8000-0000000007a3',
  mediaComplet: '00000000-0000-4000-8000-0000000000d1',
  mediaSansAlt: '00000000-0000-4000-8000-0000000000d2',
  articleBrouillon: '00000000-0000-4000-8000-000000000b01',
  articleRelecture: '00000000-0000-4000-8000-000000000b02',
  articlePublie: '00000000-0000-4000-8000-000000000b03',
  categorieBijoux: '00000000-0000-4000-8000-000000000c11',
  bijouBrouillon: '00000000-0000-4000-8000-000000000e01',
  bijouPublie: '00000000-0000-4000-8000-000000000e02',
  varianteBrouillon: '00000000-0000-4000-8000-000000000e11',
  variantePublie: '00000000-0000-4000-8000-000000000e12',
  tagCoteIvoire: '00000000-0000-4000-8000-0000000007a4',
  episode: '00000000-0000-4000-8000-000000000f01',
  projet: '00000000-0000-4000-8000-000000000f11',
  ville: '00000000-0000-4000-8000-000000000f21',
  destination: '00000000-0000-4000-8000-000000000f31',
} as const
export const IDS_EXEMPLE = ids

export interface CompteEssai {
  compte: Compte
  motDePasse: string
}

const DATE = '2026-10-30T08:00:00.000Z'

export function comptesInitiaux(): CompteEssai[] {
  const compte = (id: string, nom: string, email: string, role: Compte['role']): CompteEssai => ({
    compte: {
      id,
      nom,
      email,
      role,
      actif: true,
      derniereConnexion: null,
      doitChangerMotDePasse: false,
      createurId: null,
    },
    motDePasse: MOT_DE_PASSE_ESSAI,
  })
  return [
    compte(ids.editeur, 'Exemple Éditeur', 'editeur@exemple.test', 'editeur'),
    compte(ids.admin, 'Exemple Admin', 'admin@exemple.test', 'admin'),
    compte(ids.superAdmin, 'Exemple Super-admin', 'super@exemple.test', 'super_admin'),
  ]
}

export function tagsInitiaux(): Tag[] {
  const tag = (id: string, type: Tag['type'], code: string, libelle: string): Tag => ({
    id,
    type,
    code,
    traductions: { fr: { libelle } },
    usages: 0,
    version: 1,
  })
  return [
    tag(ids.tagFormat, 'format', 'article', 'Article'),
    tag(ids.tagPays, 'pays', 'exemple-pays', 'Exemple de pays'),
    tag(ids.tagTheme, 'theme', 'exemple-theme', 'Exemple de thème'),
    tag(ids.tagCoteIvoire, 'pays', CODE_PAYS_COTE_IVOIRE, 'Côte d’Ivoire'),
  ]
}

export function mediasInitiaux(): Media[] {
  const media = (id: string, texteAlt: string | null, credit: string | null): Media => ({
    id,
    url: `/mock-medias/${id}.jpg`,
    mime: 'image/jpeg',
    largeur: 1600,
    hauteur: 1067,
    poids: 240_000,
    credit,
    decoratif: false,
    createurId: ID_CREATEUR_PRINCIPAL,
    usages: 0,
    declinaisons: [480, 960, 1600].map((largeur) => ({
      largeur,
      url: `/mock-medias/${id}-${largeur}.webp`,
    })),
    traductions: texteAlt === null ? {} : { fr: { texteAlt, legende: null } },
    champsAFournir: [],
    creeLe: DATE,
    creePar: null,
    version: 1,
  })
  return [
    media(
      ids.mediaComplet,
      'Exemple : paysage décrit pour les lecteurs d’écran',
      'Exemple : crédit photo',
    ),
    media(ids.mediaSansAlt, null, null),
  ]
}

function corps(texte: string): NonNullable<NonNullable<Article['traductions']['fr']>['corps']> {
  return { type: 'doc', content: [{ type: 'paragraph', content: [{ type: 'text', text: texte }] }] }
}

export function articlesInitiaux(): Article[] {
  const base = {
    creeLe: DATE,
    modifieLe: DATE,
    version: 1,
    champsAFournir: [],
    languesPresentes: ['fr' as const],
    dernierMotifRefus: null,
    aLaUne: false,
    dureeLecture: null,
  }
  return [
    {
      ...base,
      id: ids.articleBrouillon,
      statut: 'brouillon',
      publieLe: null,
      auteurId: ids.editeur,
      categorie: 'Carnets de route',
      categorieId: idCategorieArticle('Carnets de route'),
      imageId: ids.mediaSansAlt,
      tagIds: [ids.tagFormat],
      traductions: {
        fr: {
          slug: 'exemple-brouillon',
          titre: 'Exemple — brouillon sans texte alternatif',
          extrait: '',
          corps: null,
          seoTitre: null,
          seoDescription: null,
        },
      },
    },
    {
      ...base,
      id: ids.articleRelecture,
      statut: 'en_relecture',
      publieLe: null,
      auteurId: ids.editeur,
      categorie: 'Opinion',
      categorieId: idCategorieArticle('Opinion'),
      imageId: ids.mediaComplet,
      tagIds: [ids.tagFormat, ids.tagTheme],
      traductions: {
        fr: {
          slug: 'exemple-relecture',
          titre: 'Exemple — article prêt à publier',
          extrait: 'Exemple de résumé.',
          corps: corps('Exemple de corps, sans valeur éditoriale.'),
          seoTitre: null,
          seoDescription: null,
        },
      },
    },
    {
      ...base,
      id: ids.articlePublie,
      statut: 'publie',
      publieLe: DATE,
      auteurId: ids.admin,
      categorie: 'Voyage',
      categorieId: idCategorieArticle('Voyage'),
      imageId: ids.mediaComplet,
      tagIds: [ids.tagFormat, ids.tagPays],
      traductions: {
        fr: {
          slug: 'exemple-publie',
          titre: 'Exemple — article publié',
          extrait: 'Exemple de résumé.',
          corps: corps('Exemple de corps publié.'),
          seoTitre: null,
          seoDescription: null,
        },
      },
    },
  ]
}

/**
 * Les huit catégories du cahier des charges (données de départ du back end) : une seule
 * contient des bijoux.
 */
/** Adresse d'une catégorie tirée de son nom (minuscules, sans accents). */
const slugCategorie = (nom: string) =>
  nom
    .normalize('NFD')
    .replace(/[0300-036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Identifiant de la catégorie d'article de départ qui porte ce nom. */
export function idCategorieArticle(nom: string): string | null {
  const rang = (CATEGORIES_ARTICLE as readonly string[]).indexOf(nom)
  return rang < 0 ? null : `00000000-0000-4000-8000-000000000c${String(31 + rang)}`
}

export function categoriesInitiales(): Categorie[] {
  const noms = [
    ['bijoux-accessoires', 'Bijoux & accessoires'],
    ['mode', 'Mode'],
    ['livres-photographie', 'Livres & photographie'],
    ['art-decoration', 'Art & décoration'],
    ['travel-essentials', 'Travel essentials'],
    ['editions-xplore', 'Éditions X’PLORE'],
    ['guides', 'Guides'],
    ['collections-limitees', 'Collections limitées'],
  ] as const
  const produits: Categorie[] = noms.map(([slug, nom], ordre) => ({
    id: ordre === 0 ? ids.categorieBijoux : `00000000-0000-4000-8000-000000000c${12 + ordre}`,
    ordre,
    famille: 'produit',
    visible: true,
    nombreBijouxPublies: 0,
    traductions: { fr: { slug, nom } },
    version: 1,
  }))
  // Huit catégories d'articles imposées par le cahier des charges (SCHEMAS § 3.1) ; aucune de projet (Q1).
  const articles: Categorie[] = CATEGORIES_ARTICLE.map((nom, ordre) => ({
    id: `00000000-0000-4000-8000-000000000c${String(31 + ordre)}`,
    ordre,
    famille: 'article',
    visible: true,
    nombreBijouxPublies: 0,
    traductions: { fr: { slug: slugCategorie(nom), nom } },
    version: 1,
  }))
  // Catégories de projets décidées par le client (06/11/2026) : X'PLORE et les documentaires
  // → Film, Taste & Travel → Tourisme, Archive d'Afrique → Patrimoine. L'admin en ajoute d'autres.
  const projets: Categorie[] = (
    [
      ['film', 'Film'],
      ['tourisme', 'Tourisme'],
      ['patrimoine', 'Patrimoine'],
    ] as const
  ).map(([slug, nom], ordre) => ({
    id: `00000000-0000-4000-8000-000000000c${String(41 + ordre)}`,
    ordre,
    famille: 'projet',
    visible: true,
    nombreBijouxPublies: 0,
    traductions: { fr: { slug, nom } },
    version: 1,
  }))
  return [...produits, ...articles, ...projets]
}

/**
 * Deux pièces d'exemple. Aucun prix, aucune matière, aucun poids : ces valeurs viennent du
 * client et restent « à fournir » (section 7 du prompt admin).
 */
export function bijouxInitiaux(): Bijou[] {
  const base = {
    creeLe: DATE,
    modifieLe: DATE,
    version: 1,
    champsAFournir: [],
    languesPresentes: ['fr' as const],
    dernierMotifRefus: null,
    auteurId: ids.editeur,
    categorieId: ids.categorieBijoux,
    createurId: ID_CREATEUR_PRINCIPAL,
    galerieMediaIds: [],
    tagIds: [],
    visible: true,
    prixConfirme: false,
    edition: null,
    atelier: null,
    village: null,
    poids: null,
    matieres: [],
    tailles: [],
  }
  const variante = (id: string, reference: string) => ({
    id,
    reference,
    matiere: null,
    taille: null,
    prix: null,
    ancienPrix: null,
    stock: null,
    disponible: true,
    ordre: 0,
    version: 1,
  })
  return [
    {
      ...base,
      id: ids.bijouBrouillon,
      statut: 'brouillon',
      publieLe: null,
      numero: '01',
      imageId: null,
      variantes: [variante(ids.varianteBrouillon, '01-1')],
      traductions: {
        fr: { slug: 'exemple-pendentif', nom: 'Exemple — pendentif', culture: null, histoire: '' },
      },
    },
    {
      ...base,
      id: ids.bijouPublie,
      statut: 'publie',
      publieLe: DATE,
      numero: '02',
      imageId: ids.mediaComplet,
      variantes: [variante(ids.variantePublie, '02-1')],
      traductions: {
        fr: {
          slug: 'exemple-bracelet',
          nom: 'Exemple — bracelet',
          culture: 'Exemple : culture d’origine du symbole',
          histoire: 'Exemple : l’histoire derrière l’objet.',
        },
      },
    },
  ]
}

const baseEditoriale = () => ({
  statut: 'brouillon' as const,
  publieLe: null,
  creeLe: DATE,
  modifieLe: DATE,
  auteurId: ids.editeur,
  version: 1,
  champsAFournir: [],
  languesPresentes: ['fr' as const],
  dernierMotifRefus: null,
  tagIds: [],
})

/** Un épisode d'exemple, sans durée ni textes longs : à fournir. */
export function episodesInitiaux(): Episode[] {
  return [
    {
      ...baseEditoriale(),
      id: ids.episode,
      numero: '01',
      imageId: null,
      guideMediaId: null,
      destinationId: null,
      trailerUrl: null,
      dureeMinutes: null,
      traductions: {
        fr: {
          slug: 'exemple-episode',
          titre: 'Exemple — épisode',
          lieu: '',
          pitch: '',
          synopsisLong: null,
          noteIntention: null,
          personnages: null,
          makingOf: null,
          presse: null,
          credits: null,
        },
      },
    },
  ]
}

/** Un projet en préparation : il n'a pas encore d'image, ce qui est permis (§ 9.3). */
export function projetsInitiaux(): Projet[] {
  return [
    {
      ...baseEditoriale(),
      id: ids.projet,
      format: 'Documentaire',
      avancement: 'en_preparation',
      template: 'film',
      categorieId: ID_CATEGORIE_FILM,
      annee: null,
      imageId: null,
      cible: null,
      ordre: 0,
      traductions: {
        fr: { slug: 'exemple-projet', titre: 'Exemple — projet', accroche: '' },
      },
    },
  ]
}

export function villesInitiales(): Ville[] {
  return [
    {
      ...baseEditoriale(),
      id: ids.ville,
      imageId: null,
      ordre: 0,
      traductions: { fr: { nom: 'Exemple — ville', intention: '' } },
    },
  ]
}

/** Une destination sans coordonnées : elles se saisissent, elles ne se devinent pas. */
export function destinationsInitiales(): Destination[] {
  return [
    {
      ...baseEditoriale(),
      id: ids.destination,
      latitude: null,
      longitude: null,
      episodeId: null,
      guideMediaId: null,
      imageId: null,
      traductions: {
        fr: { slug: 'exemple-destination', nom: 'Exemple — destination', texte: null },
      },
    },
  ]
}

export type Archive = z.infer<typeof archiveSchema>
export type Distinction = z.infer<typeof distinctionSchema>
export type Presse = z.infer<typeof presseSchema>
export type Univers = z.infer<typeof universSchema>
export type Jalon = z.infer<typeof jalonSchema>
export type Offre = z.infer<typeof offreSchema>
export type PageFixe = z.infer<typeof pageSchema>

const ID_LOT3 = (n: number) => `00000000-0000-4000-8000-0000000a${String(n).padStart(4, '0')}`
export const IDS_LOT3 = {
  archive: ID_LOT3(1),
  distinction: ID_LOT3(2),
  presse: ID_LOT3(3),
  univers: ID_LOT3(4),
  jalon: ID_LOT3(5),
  offre: ID_LOT3(6),
} as const

/** Une entrée d'archive **sans source** : elle ne doit pas pouvoir se publier (règle du CDC). */
export function archiveInitiale(): Archive[] {
  return [
    {
      ...baseEditoriale(),
      id: IDS_LOT3.archive,
      categorie: 'Exemple',
      fiabilite: null,
      epoque: null,
      imageId: null,
      sources: [],
      traductions: {
        fr: { slug: 'exemple-archive', titre: 'Exemple — entrée d’archive', texte: null },
      },
    },
  ]
}
export function distinctionsInitiales(): Distinction[] {
  return [
    {
      ...baseEditoriale(),
      id: IDS_LOT3.distinction,
      nature: 'distinction',
      annee: null,
      organisme: null,
      lien: null,
      imageId: null,
      ordre: 0,
      traductions: { fr: { titre: 'Exemple — distinction', description: null } },
    },
  ]
}
export function presseInitiale(): Presse[] {
  return [
    {
      ...baseEditoriale(),
      id: IDS_LOT3.presse,
      source: 'Exemple — média',
      datePublication: null,
      lien: null,
      avatarId: null,
      aLaUne: false,
      ordre: 0,
      traductions: { fr: { titre: 'Exemple — parution', resume: null, citation: null } },
    },
  ]
}
export function universInitiaux(): Univers[] {
  return [
    {
      ...baseEditoriale(),
      id: IDS_LOT3.univers,
      numero: '01',
      cible: null,
      ordre: 0,
      traductions: { fr: { nom: 'Exemple — univers', pitch: '' } },
    },
  ]
}
export function jalonsInitiaux(): Jalon[] {
  return [
    {
      ...baseEditoriale(),
      id: IDS_LOT3.jalon,
      periode: 'Exemple',
      ordre: 0,
      traductions: { fr: { titre: 'Exemple — jalon', description: null } },
    },
  ]
}
export function offresInitiales(): Offre[] {
  return [
    {
      ...baseEditoriale(),
      id: IDS_LOT3.offre,
      ordre: 0,
      traductions: { fr: { titre: 'Exemple — offre', texte: null } },
    },
  ]
}

/**
 * Clés de bloc par page (données de départ du back end, § 9.15). Exemples d'emplacements : les
 * textes restent vides, à fournir.
 */
export const BLOCS_PAGES: Record<string, string[]> = {
  accueil: ['accueil.manifeste', 'accueil.signature'],
  'taste-and-travel': ['travel.partenaires'],
}

/** Les onze pages fixes : une par clé, jamais créées ni supprimées. */
export function pagesInitiales(): PageFixe[] {
  return CLES_PAGE.map((cle, i) => ({
    ...baseEditoriale(),
    id: `00000000-0000-4000-8000-0000000b${String(i + 1).padStart(4, '0')}`,
    cle,
    imageId: null,
    traductions: {
      fr: {
        titre: `Exemple — page ${cle}`,
        chapo: null,
        seoTitre: null,
        seoDescription: null,
        blocs: Object.fromEntries((BLOCS_PAGES[cle] ?? []).map((bloc) => [bloc, ''])),
      },
    },
  }))
}

/** Une boîte de réception : un message, avec ses champs de collaboration quand ils existent. */
export function messagesInitiaux(): Message[] {
  return [
    {
      id: '00000000-0000-4000-8000-000000000a01',
      type: 'contact',
      nom: 'Exemple Visiteur',
      email: 'visiteur@exemple.test',
      motif: 'Exemple — demande de renseignements',
      message: 'Exemple : un message.',
      langue: 'fr',
      statut: 'non_lu',
      noteInterne: null,
      creeLe: DATE,
      purgeLe: '2028-10-30T08:00:00.000Z',
      version: 1,
    },
    {
      id: '00000000-0000-4000-8000-000000000a02',
      type: 'collaboration',
      nom: 'Exemple Collaboration',
      email: 'pro@exemple.test',
      motif: null,
      message: 'Exemple : un projet.',
      langue: 'fr',
      statut: 'lu',
      noteInterne: 'Exemple : à relancer.',
      creeLe: DATE,
      purgeLe: '2028-10-30T08:00:00.000Z',
      version: 1,
      entreprise: 'Exemple SA',
      pays: 'Exemple',
      typeCollaboration: 'Exemple : partenariat',
      calendrier: 'Exemple : printemps',
      budget: null,
    },
  ]
}

/** Une demande de pièce : les variantes citées, sans réservation de stock (RG-11). */
export function demandesInitiales(): Demande[] {
  return [
    {
      id: '00000000-0000-4000-8000-000000000c01',
      lignes: [
        {
          varianteId: '00000000-0000-4000-8000-000000000e11',
          bijouId: '00000000-0000-4000-8000-000000000e01',
          libelle: 'Exemple — Exemple 01 — 01-1',
        },
      ],
      nom: 'Exemple Visiteur',
      email: 'visiteur@exemple.test',
      message: null,
      langue: 'fr',
      statut: 'nouvelle',
      noteInterne: null,
      creeLe: DATE,
      version: 1,
    },
  ]
}

/** Un abonné à la newsletter : en attente de confirmation, pas encore un contenu. */
export function abonnesInitiales(): Abonne[] {
  return [
    {
      id: '00000000-0000-4000-8000-000000000d01',
      email: 'abonne@exemple.test',
      prenom: 'Exemple',
      pays: 'Exemple',
      langue: 'fr',
      statut: 'en_attente',
      confirmeLe: null,
      creeLe: DATE,
      consentements: [
        {
          finalite: 'newsletter',
          texte: 'J’accepte de recevoir la lettre.',
          version: '2026-10',
          source: '/accueil',
          accepteLe: DATE,
        },
      ],
    },
  ]
}

// --- Lot 4 (contrat § 9.9, 9.13 à 9.16, 13) : images de galerie, études de cas, partenaires,
// pages légales, réglages. Comme partout : titres « Exemple », champs de contenu restés vides. ---

const ID_LOT4 = (n: number) => `00000000-0000-4000-8000-0000000f${String(n).padStart(4, '0')}`

export const IDS_LOT4 = {
  galerieAccueil1: ID_LOT4(1),
  galerieAccueil2: ID_LOT4(2),
  galerieBoutique: ID_LOT4(3),
  etudeCas: ID_LOT4(11),
  partenaire: ID_LOT4(21),
  pageLegale: (i: number) => ID_LOT4(41 + i),
  chiffre: (i: number) => ID_LOT4(51 + i),
  motif: (i: number) => ID_LOT4(61 + i),
} as const

/** Trois images d'exemple : deux pour la galerie d'accueil, une pour la boutique (§ 9.9). */
export function galerieInitiale(): Galerie[] {
  return [
    {
      ...baseEditoriale(),
      id: IDS_LOT4.galerieAccueil1,
      emplacement: 'accueil',
      mediaId: ids.mediaComplet,
      cible: { type: 'page', cle: 'a-propos' },
      lienExterne: null,
      ratio: '3/2',
      parallaxe: null,
      ordre: 0,
      traductions: { fr: { etiquette: 'Exemple — galerie parcours', titre: null, legende: null } },
    },
    {
      ...baseEditoriale(),
      id: IDS_LOT4.galerieAccueil2,
      emplacement: 'accueil',
      mediaId: ids.mediaComplet,
      cible: null,
      lienExterne: null,
      ratio: '4/5',
      parallaxe: 15,
      ordre: 1,
      traductions: { fr: { etiquette: 'Exemple — galerie héros', titre: null, legende: null } },
    },
    {
      ...baseEditoriale(),
      id: IDS_LOT4.galerieBoutique,
      emplacement: 'boutique',
      mediaId: ids.mediaComplet,
      cible: null,
      lienExterne: null,
      ratio: '3/4',
      parallaxe: null,
      ordre: 0,
      traductions: { fr: { etiquette: 'Exemple — galerie boutique', titre: null, legende: null } },
    },
  ]
}

/** Une étude de cas d'exemple (§ 9.13) : le récit reste vide, à fournir. */
export function etudesCasInitiaux(): EtudeCas[] {
  return [
    {
      ...baseEditoriale(),
      id: IDS_LOT4.etudeCas,
      offreId: IDS_LOT3.offre,
      imageId: ids.mediaComplet,
      galerieMediaIds: [],
      ordre: 0,
      traductions: {
        fr: {
          slug: 'exemple-etude-de-cas',
          titre: 'Exemple — étude de cas',
          client: null,
          challenge: null,
          idee: null,
          execution: null,
          contenus: null,
          diffusion: null,
          resultats: null,
          temoignage: null,
        },
      },
    },
  ]
}

/** Un partenaire d'exemple (§ 9.14) : logo de la médiathèque, lien non fourni. */
export function partenairesInitiaux(): Partenaire[] {
  return [
    {
      ...baseEditoriale(),
      id: IDS_LOT4.partenaire,
      logoId: ids.mediaComplet,
      lien: null,
      ordre: 0,
      traductions: { fr: { nom: 'Exemple — partenaire' } },
    },
  ]
}

/** Les cinq pages légales (§ 9.16) : ensemble fermé, textes fournis par la maison, vides ici. */
export function pagesLegalesInitiales(): PageLegale[] {
  return CLES_PAGE_LEGALE.map((cle, i) => ({
    ...baseEditoriale(),
    id: IDS_LOT4.pageLegale(i),
    cle,
    traductions: {
      fr: { titre: `Exemple — ${cle.replaceAll('-', ' ')}`, resume: null, corps: null },
    },
  }))
}

/** Chiffres d'audience (§ 13.2) : plateformes structurelles, tous les chiffres restent `null`. */
export function chiffresAudienceInitiaux(): ChiffreAudience[] {
  return ['Instagram', 'LinkedIn', 'TikTok'].map((plateforme, i) => ({
    id: IDS_LOT4.chiffre(i),
    plateforme: `Exemple — ${plateforme}`,
    taille: null,
    portee: null,
    dateValidation: null,
    source: null,
    ordre: i,
    version: 1,
  }))
}

/** Motifs du formulaire de contact (§ 13.6) : les trois du site public, libellés inchangés. */
export function motifsContactInitiaux(): MotifContact[] {
  const motifs = [
    {
      titre: 'Partenariats',
      description: 'Associer une marque à X’PLORE, Taste & Travel ou à une création originale.',
    },
    {
      titre: 'Médias',
      description: 'Interview, portrait, plateau, accréditation et demande d’images.',
    },
    {
      titre: 'Événements',
      description: 'Projection, conférence, masterclass ou prise de parole.',
    },
  ]
  return motifs.map((motif, i) => ({
    id: IDS_LOT4.motif(i),
    ordre: i,
    traductions: { fr: motif },
    version: 1,
  }))
}

/** Réglages généraux (§ 13.3) : les durées de conservation par défaut, vente en ligne fermée. */
export function parametresInitiaux(): Parametres {
  return {
    languesActives: ['fr'],
    destinataires: { contact: [], collaboration: [], demandes: [] },
    conservationMessagesMois: 12,
    purgeAbonnesNonConfirmesJours: 30,
    regroupementPublicationSecondes: 300,
    boutiqueEnLigne: false,
    multiVendeurs: false,
    version: 1,
  }
}

/** Navigation du site (§ 13.4) : le reflet de la navigation du site public, à deux langues. */
export function navigationInitiale(): Navigation {
  const ciblePage = (cle: (typeof CLES_PAGE)[number]): CibleInterne => ({ type: 'page', cle })
  const cibleAncre = (cle: (typeof CLES_PAGE)[number], ancre: string): CibleInterne => ({
    type: 'ancre',
    cle,
    ancre,
  })
  const cibleLegale = (cle: (typeof CLES_PAGE_LEGALE)[number]): CibleInterne => ({
    type: 'page-legale',
    cle,
  })
  const entree = (
    id: string,
    libelle: { fr: string; en?: string },
    cibleEntree: CibleInterne,
    degre: { fr: string; en?: string } | null = null,
    enfants: Navigation['principale'][number]['enfants'] = [],
  ): Navigation['principale'][number] => ({
    id,
    libelle,
    degre,
    cible: cibleEntree,
    enfants,
  })
  return {
    principale: [
      entree(
        'nav-prince-edja',
        { fr: 'Prince Edja', en: 'Prince Edja' },
        ciblePage('a-propos'),
        {
          fr: 'L’homme, le parcours, la reconnaissance',
          en: 'The man, the path, the recognition',
        },
        [
          entree('nav-histoire', { fr: 'Mon histoire', en: 'My story' }, ciblePage('a-propos')),
          entree(
            'nav-audience',
            { fr: 'Audience', en: 'Audience' },
            cibleAncre('a-propos', 'audience'),
          ),
          entree('nav-offres', { fr: 'Offres', en: 'Services' }, cibleAncre('a-propos', 'offres')),
          entree(
            'nav-collaborer',
            { fr: 'Collaborer', en: 'Work with us' },
            cibleAncre('a-propos', 'collaborer'),
          ),
          entree(
            'nav-presse',
            { fr: 'Presse & distinctions', en: 'Press & honours' },
            ciblePage('presse'),
          ),
        ],
      ),
      entree(
        'nav-histoires',
        { fr: 'Histoires', en: 'Stories' },
        ciblePage('histoires'),
        { fr: 'Projets, films et archives', en: 'Projects, films and archives' },
        [
          entree(
            'nav-histoires-tous',
            { fr: 'Tous les projets', en: 'All projects' },
            ciblePage('histoires'),
          ),
          entree(
            'nav-archive-afrique',
            { fr: 'Archive d’Afrique', en: 'Archive of Africa' },
            ciblePage('archive-afrique'),
          ),
          entree('nav-xplore', { fr: "Série X'PLORE", en: "X'PLORE series" }, ciblePage('xplore')),
          entree(
            'nav-taste-travel',
            { fr: 'Taste & Travel', en: 'Taste & Travel' },
            ciblePage('taste-and-travel'),
          ),
        ],
      ),
      entree('nav-xplore-menu', { fr: "X'PLORE", en: "X'PLORE" }, ciblePage('xplore'), {
        fr: 'Six routes. Six histoires.',
        en: 'Six routes. Six stories.',
      }),
      entree('nav-journal', { fr: 'Journal', en: 'Journal' }, ciblePage('journal'), {
        fr: 'Le carnet de route',
        en: 'The travel journal',
      }),
      entree('nav-shop', { fr: 'Edja Shop', en: 'Edja Shop' }, ciblePage('boutique'), {
        fr: 'Collection TRIBE',
        en: 'TRIBE collection',
      }),
      entree('nav-contact', { fr: 'Contact', en: 'Contact' }, ciblePage('contact'), {
        fr: 'Écrire à la maison',
        en: 'Write to the house',
      }),
    ],
    ctaPrincipal: {
      libelle: { fr: 'Travailler avec Prince', en: 'Work with Prince' },
      cible: ciblePage('contact'),
    },
    piedDePage: [
      {
        titre: { fr: 'Prince Edja', en: 'Prince Edja' },
        liens: [
          entree('pied-histoire', { fr: 'Mon histoire', en: 'My story' }, ciblePage('a-propos')),
          entree(
            'pied-audience',
            { fr: 'Audience', en: 'Audience' },
            cibleAncre('a-propos', 'audience'),
          ),
          entree('pied-offres', { fr: 'Offres', en: 'Services' }, cibleAncre('a-propos', 'offres')),
          entree(
            'pied-collaborer',
            { fr: 'Collaborer', en: 'Work with us' },
            cibleAncre('a-propos', 'collaborer'),
          ),
          entree(
            'pied-presse',
            { fr: 'Presse & distinctions', en: 'Press & honours' },
            ciblePage('presse'),
          ),
          entree('pied-journal', { fr: 'Journal', en: 'Journal' }, ciblePage('journal')),
          entree(
            'pied-travailler',
            { fr: 'Travailler avec Prince', en: 'Work with Prince' },
            ciblePage('contact'),
          ),
        ],
      },
      {
        titre: { fr: 'Histoires', en: 'Stories' },
        liens: [
          entree(
            'pied-histoires',
            { fr: 'Tous les projets', en: 'All projects' },
            ciblePage('histoires'),
          ),
          entree(
            'pied-archive-afrique',
            { fr: 'Archive d’Afrique', en: 'Archive of Africa' },
            ciblePage('archive-afrique'),
          ),
          entree('pied-xplore', { fr: "Série X'PLORE", en: "X'PLORE series" }, ciblePage('xplore')),
          entree(
            'pied-taste-travel',
            { fr: 'Taste & Travel', en: 'Taste & Travel' },
            ciblePage('taste-and-travel'),
          ),
        ],
      },
      {
        titre: { fr: 'Edja Shop', en: 'Edja Shop' },
        liens: [
          entree(
            'pied-shop',
            { fr: 'Collection TRIBE', en: 'TRIBE collection' },
            ciblePage('boutique'),
          ),
          entree('pied-contact', { fr: 'Contact', en: 'Contact' }, ciblePage('contact')),
        ],
      },
      {
        titre: { fr: 'Informations', en: 'Legal' },
        liens: [
          entree(
            'pied-mentions',
            { fr: 'Mentions légales', en: 'Legal notice' },
            cibleLegale('mentions-legales'),
          ),
          entree(
            'pied-confidentialite',
            { fr: 'Confidentialité', en: 'Privacy' },
            cibleLegale('confidentialite'),
          ),
          entree('pied-cookies', { fr: 'Cookies', en: 'Cookies' }, cibleLegale('cookies')),
          entree('pied-cgv', { fr: 'CGV', en: 'Terms of sale' }, cibleLegale('cgv')),
          entree(
            'pied-retours',
            { fr: 'Retours & échanges', en: 'Returns' },
            cibleLegale('retours'),
          ),
        ],
      },
    ],
    entrees404: [
      entree(
        'quarante-quatre-xplore',
        { fr: "Série X'PLORE", en: "X'PLORE series" },
        ciblePage('xplore'),
      ),
      entree('quarante-quatre-journal', { fr: 'Journal', en: 'Journal' }, ciblePage('journal')),
      entree('quarante-quatre-shop', { fr: 'Edja Shop', en: 'Edja Shop' }, ciblePage('boutique')),
    ],
    version: 1,
  }
}

/**
 * Textes d'interface du site (§ 13.5) : un extrait du dictionnaire du site public, repris tel
 * quel — les deux langues sont vérifiées à la source (`src/i18n/dictionnaire.ts`).
 */
export function textesInterfaceInitiaux(): Record<string, { fr: string; en?: string }> {
  return {
    'nav.ouvrirMenu': { fr: 'Ouvrir le menu', en: 'Open menu' },
    'nav.fermerMenu': { fr: 'Fermer le menu', en: 'Close menu' },
    'a11y.allerContenu': { fr: 'Aller au contenu', en: 'Skip to content' },
    'fil.etiquette': { fr: "Fil d'Ariane", en: 'Breadcrumb' },
    'langue.etiquette': { fr: 'Choisir la langue', en: 'Choose language' },
    'cta.travailler': { fr: 'Travailler avec Prince', en: 'Work with Prince' },
    'hero.ctaHistoire': { fr: 'Découvrir mon histoire', en: 'Discover my story' },
    'newsletter.titre': { fr: 'La lettre du griot', en: 'The griot letter' },
    'recherche.declencheur': { fr: 'Rechercher', en: 'Search' },
    'legal.aFournir': { fr: 'Contenu à fournir', en: 'Content to be provided' },
    'p404.titre': { fr: 'Cette page a pris la mer', en: 'This page has gone to sea' },
    'p404.texte': {
      fr: "Le lien est peut-être ancien, ou l'adresse mal recopiée. Voici par où reprendre le voyage.",
      en: 'The link may be old, or the address mistyped. Here is where to pick the journey back up.',
    },
    'p404.ou': { fr: 'Ou revenir à l’accueil', en: 'Or go back home' },
  }
}

/** Emplacement fixe tel que le faux serveur le garde : la photo est une référence au média. */
export interface EmplacementEssai {
  cle: string
  libelle: string
  formatConseille: string | null
  mediaId: string | null
  misAJourLe: string | null
}

/**
 * Photos fixes du site (ECRANS § 5.2, liste de départ « à confirmer par le site public », E3).
 * Aucun format conseillé n'est inventé : il reste à préciser.
 */
export function emplacementsInitiaux(): EmplacementEssai[] {
  return [
    ['accueil.heros', 'Accueil — héros'],
    ['accueil.portrait', 'Accueil — portrait'],
    ['apropos.portrait', 'À propos — portrait'],
    ['apropos.bandeau', 'À propos — bandeau'],
    ['boutique.bandeau', 'Boutique — bandeau'],
    ['journal.bandeau', 'Journal — bandeau'],
    ['contact.bandeau', 'Contact — bandeau'],
    ['partage.og', 'Image de partage (réseaux)'],
  ].map(([cle, libelle]) => ({
    cle: cle ?? '',
    libelle: libelle ?? '',
    formatConseille: null,
    mediaId: null,
    misAJourLe: null,
  }))
}
