import { z } from 'zod'
import {
  contenuBaseShape,
  idSchema,
  slugSchema,
  traductionsEcriture,
  traductionsLecture,
  versionSchema,
} from '@/api/schemas/communs'
import { corpsRicheSchema } from '@/api/schemas/corps-riche'

/** Articles (`docs/CONTRAT-API.md` § 9.1). */

export const CATEGORIES_ARTICLE = [
  'Voyage',
  'Histoire',
  'Patrimoine',
  'Tourisme',
  'Hospitalité',
  'Opinion',
  'Portraits',
  'Carnets de route',
] as const
export const categorieArticleSchema = z.enum(CATEGORIES_ARTICLE)

const traductionArticleLecture = z.object({
  slug: slugSchema,
  titre: z.string(),
  extrait: z.string(),
  corps: corpsRicheSchema.nullable(),
  seoTitre: z.string().nullable(),
  seoDescription: z.string().nullable(),
})

export const articleSchema = z.object({
  ...contenuBaseShape,
  categorie: categorieArticleSchema,
  imageId: idSchema.nullable(),
  tagIds: z.array(idSchema),
  aLaUne: z.boolean(),
  dureeLecture: z.number().int().positive().nullable(),
  traductions: traductionsLecture(traductionArticleLecture),
})
export type Article = z.infer<typeof articleSchema>

/** Une traduction saisie : le titre suffit à créer un brouillon, le reste vient ensuite. */
export const traductionArticleEcriture = z.strictObject({
  slug: slugSchema.optional(),
  titre: z.string().trim().min(1, 'Titre obligatoire.').max(200),
  extrait: z.string().max(400).optional(),
  corps: corpsRicheSchema.nullable().optional(),
  seoTitre: z.string().max(70).nullable().optional(),
  seoDescription: z.string().max(160).nullable().optional(),
})

const champsArticleEcriture = {
  categorie: categorieArticleSchema,
  imageId: idSchema.nullable().optional(),
  tagIds: z.array(idSchema).optional(),
  aLaUne: z.boolean().optional(),
  traductions: traductionsEcriture(traductionArticleEcriture),
}

export const entreeArticleSchema = z.strictObject(champsArticleEcriture)
export type EntreeArticle = z.infer<typeof entreeArticleSchema>

export const modificationArticleSchema = z.strictObject({
  ...z.strictObject(champsArticleEcriture).partial().shape,
  version: versionSchema,
})
export type ModificationArticle = z.infer<typeof modificationArticleSchema>
