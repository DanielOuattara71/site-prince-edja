import type { Article } from '@/api/schemas/articles'
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

/** Mot de passe commun aux trois comptes d'essai, en développement seulement. */
export const MOT_DE_PASSE_ESSAI = 'exemple-mot-de-passe'

export const ID_CREATEUR_PRINCIPAL = '00000000-0000-4000-8000-00000000c001'
export const ID_CREATEUR_EXEMPLE = '00000000-0000-4000-8000-00000000c002'

/** Ce que le faux serveur sait d'un créateur : de quoi servir les sélecteurs (§ 10.2). */
export interface CreateurEssai {
  id: string
  slug: string
  nom: string
  statut: 'brouillon' | 'en_relecture' | 'publie' | 'archive'
  actif: boolean
  estPrincipal: boolean
  version: number
}

/**
 * Le principal existe dans toute installation (données de départ du back end). Le second
 * est inactif, comme tout créateur non principal tant que `multiVendeurs` est faux.
 */
export function createursInitiaux(): CreateurEssai[] {
  return [
    {
      id: ID_CREATEUR_PRINCIPAL,
      slug: 'prince-edja',
      nom: 'Prince Edja',
      statut: 'publie',
      actif: true,
      estPrincipal: true,
      version: 1,
    },
    {
      id: ID_CREATEUR_EXEMPLE,
      slug: 'exemple-createur',
      nom: 'Exemple — créateur invité',
      statut: 'publie',
      actif: false,
      estPrincipal: false,
      version: 1,
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
