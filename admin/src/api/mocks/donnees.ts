import type { Article } from '@/api/schemas/articles'
import type { Bijou, Categorie } from '@/api/schemas/boutique'
import type { Createur } from '@/api/schemas/createurs'
import type { z } from 'zod'
import type {
  archiveSchema,
  Destination,
  distinctionSchema,
  Episode,
  jalonSchema,
  offreSchema,
  pageSchema,
  presseSchema,
  Projet,
  universSchema,
  Ville,
} from '@/api/schemas/editorial'
import { CLES_PAGE } from '@/api/schemas/communs'
import type { Compte } from '@/api/schemas/communs'
import type { Media } from '@/api/schemas/medias'
import type { Tag } from '@/api/schemas/tags'

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
  return noms.map(([slug, nom], ordre) => ({
    id: ordre === 0 ? ids.categorieBijoux : `00000000-0000-4000-8000-000000000c${12 + ordre}`,
    ordre,
    visible: true,
    nombreBijouxPublies: 0,
    traductions: { fr: { slug, nom } },
    version: 1,
  }))
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
