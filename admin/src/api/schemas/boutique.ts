import { z } from 'zod'
import {
  contenuBaseShape,
  idSchema,
  resumeContenuSchema,
  slugSchema,
  traductionsEcriture,
  traductionsLecture,
  versionSchema,
} from '@/api/schemas/communs'

/**
 * Boutique (`docs/CONTRAT-API.md` § 10.1 et § 10.3, décision A-02) : catégories, bijoux et
 * variantes. Un bijou est la **pièce**, la variante l'unité qu'on demande : elle porte la
 * référence, la matière, la taille, le prix et la disponibilité. Montants : entiers en FCFA,
 * `null` = non communiqué, jamais `0` par défaut (§ 2).
 */
export const montantSchema = z.number().int().min(0).max(1_000_000_000)

// --- Catégories (§ 10.1) ---

/** Trois familles de catégories (SCHEMAS § 3, D10) ; défaut `produit` (catégories historiques). */
export const FAMILLES_CATEGORIE = ['article', 'projet', 'produit'] as const
export const familleCategorieSchema = z.enum(FAMILLES_CATEGORIE)
export type FamilleCategorie = z.infer<typeof familleCategorieSchema>

const traductionCategorieLecture = z.object({ slug: slugSchema, nom: z.string() })

/** La liste renvoie les objets complets : petits, sans cycle de vie (B-45 du back end). */
export const categorieSchema = z.object({
  id: idSchema,
  ordre: z.number().int(),
  famille: familleCategorieSchema.default('produit'),
  visible: z.boolean(),
  nombreBijouxPublies: z.number().int().min(0),
  /** Éléments rattachés, tous statuts (articles, projets, bijoux, livres) : suppression refusée au-delà de 0. */
  nombreElements: z.number().int().min(0).optional(),
  traductions: traductionsLecture(traductionCategorieLecture),
  version: versionSchema,
})
export type Categorie = z.infer<typeof categorieSchema>

const traductionCategorieEcriture = z.strictObject({
  slug: slugSchema.optional(),
  nom: z.string().trim().min(1, 'Nom obligatoire.').max(80),
})

export const entreeCategorieSchema = z.strictObject({
  famille: familleCategorieSchema.optional(),
  visible: z.boolean().optional(),
  traductions: z.strictObject({
    fr: traductionCategorieEcriture,
    en: traductionCategorieEcriture.nullable().optional(),
  }),
})
export type EntreeCategorie = z.infer<typeof entreeCategorieSchema>

export const modificationCategorieSchema = z.strictObject({
  visible: z.boolean().optional(),
  traductions: z
    .strictObject({
      fr: traductionCategorieEcriture.optional(),
      en: traductionCategorieEcriture.nullable().optional(),
    })
    .optional(),
  version: versionSchema,
})
export type ModificationCategorie = z.infer<typeof modificationCategorieSchema>

// --- Variantes (§ 10.3) ---

export const varianteSchema = z.object({
  id: idSchema,
  reference: z.string(),
  matiere: z.string().nullable(),
  taille: z.string().nullable(),
  prix: montantSchema.nullable(),
  ancienPrix: montantSchema.nullable(),
  stock: z.number().int().min(0).nullable(),
  disponible: z.boolean(),
  ordre: z.number().int(),
  version: versionSchema,
})
export type Variante = z.infer<typeof varianteSchema>

const champsVariante = {
  reference: z
    .string()
    .trim()
    .min(1)
    .max(40)
    .regex(/^[A-Za-z0-9._-]+$/, 'Lettres, chiffres, points, tirets et soulignés seulement.'),
  matiere: z.string().trim().min(1).max(120).nullable(),
  taille: z.string().trim().min(1).max(60).nullable(),
  prix: montantSchema.nullable(),
  ancienPrix: montantSchema.nullable(),
  stock: z.number().int().min(0).max(1_000_000).nullable(),
  disponible: z.boolean(),
  ordre: z.number().int().min(0).max(1000),
}

export const entreeVarianteSchema = z.strictObject(z.strictObject(champsVariante).partial().shape)
export type EntreeVariante = z.infer<typeof entreeVarianteSchema>

export const modificationVarianteSchema = z.strictObject({
  ...z.strictObject(champsVariante).partial().shape,
  version: versionSchema,
})
export type ModificationVariante = z.infer<typeof modificationVarianteSchema>

// --- Bijoux (§ 10.3) ---

const traductionBijouLecture = z.object({
  slug: slugSchema,
  nom: z.string(),
  culture: z.string().nullable(),
  histoire: z.string(),
})

const editionSchema = z.object({ numero: z.number().int(), total: z.number().int() })

export const bijouSchema = z.object({
  ...contenuBaseShape,
  numero: z.string(),
  categorieId: idSchema,
  createurId: idSchema,
  imageId: idSchema.nullable(),
  galerieMediaIds: z.array(idSchema),
  tagIds: z.array(idSchema),
  visible: z.boolean(),
  prixConfirme: z.boolean(),
  edition: editionSchema.nullable(),
  atelier: z.string().nullable(),
  village: z.string().nullable(),
  poids: z.number().nullable(),
  variantes: z.array(varianteSchema),
  matieres: z.array(z.string()),
  tailles: z.array(z.string()),
  traductions: traductionsLecture(traductionBijouLecture),
})
export type Bijou = z.infer<typeof bijouSchema>

export const resumeBijouSchema = resumeContenuSchema.extend({
  numero: z.string(),
  categorieId: idSchema,
  visible: z.boolean(),
  prixConfirme: z.boolean(),
  nombreVariantes: z.number().int().min(0),
})
export type ResumeBijou = z.infer<typeof resumeBijouSchema>

const texteCourt = (max: number) => z.string().trim().min(1).max(max)

export const traductionBijouEcriture = z.strictObject({
  slug: slugSchema.optional(),
  nom: z.string().trim().min(1, 'Nom obligatoire.').max(200),
  culture: texteCourt(200).nullable().optional(),
  histoire: z.string().max(600, 'Au plus 600 caractères.').optional(),
})

const champsBijouEcriture = {
  numero: z.string().trim().min(1, 'Numéro obligatoire.').max(10),
  categorieId: idSchema,
  createurId: idSchema.optional(),
  imageId: idSchema.nullable().optional(),
  galerieMediaIds: z.array(idSchema).max(20).optional(),
  tagIds: z.array(idSchema).max(50).optional(),
  visible: z.boolean().optional(),
  /** Admin seulement ; `true` exige un prix sur au moins une variante (RG-10). */
  prixConfirme: z.boolean().optional(),
  edition: z
    .strictObject({ numero: z.number().int().min(1), total: z.number().int().min(1) })
    .nullable()
    .optional(),
  atelier: texteCourt(120).nullable().optional(),
  village: texteCourt(120).nullable().optional(),
  poids: z.number().positive().max(100_000).nullable().optional(),
  traductions: traductionsEcriture(traductionBijouEcriture),
}

export const entreeBijouSchema = z.strictObject({
  ...champsBijouEcriture,
  variantes: z.array(entreeVarianteSchema).max(50).optional(),
})
export type EntreeBijou = z.infer<typeof entreeBijouSchema>

export const modificationBijouSchema = z.strictObject({
  ...z.strictObject(champsBijouEcriture).partial().shape,
  version: versionSchema,
})
export type ModificationBijou = z.infer<typeof modificationBijouSchema>

/** Filtres propres à la liste des bijoux (§ 10.3). */
export interface FiltresBijoux {
  categorie?: string
  createur?: string
  visible?: 'true' | 'false'
  prixConfirme?: 'true' | 'false'
}

/**
 * Prix affiché par le site (règle publique, rappelée pour l'aperçu) : visible seulement si le
 * prix est confirmé **et** renseigné, sinon « sur demande » ; avec plusieurs prix, le plus bas.
 */
export function prixAffiche(bijou: Pick<Bijou, 'prixConfirme' | 'variantes'>): {
  surDemande: boolean
  apartirDe: boolean
  montant: number | null
} {
  const prix = bijou.variantes.flatMap((v) => (v.prix === null ? [] : [v.prix]))
  if (!bijou.prixConfirme || prix.length === 0) {
    return { surDemande: true, apartirDe: false, montant: null }
  }
  return {
    surDemande: false,
    apartirDe: new Set(prix).size > 1,
    montant: Math.min(...prix),
  }
}
