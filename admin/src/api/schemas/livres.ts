import { z } from 'zod'
import {
  contenuBaseShape,
  idSchema,
  slugSchema,
  traductionsEcriture,
  traductionsLecture,
  versionSchema,
} from '@/api/schemas/communs'
import { montantSchema } from '@/api/schemas/boutique'

/**
 * Livres (SCHEMAS § 8.3, NOUVEAU ; contrat 1.5.0 proposé, § 22). Un livre est un produit comme un
 * bijou : catégorie de la famille `produit`, créateur, variantes (RG-10, RG-33). Les variantes
 * voyagent avec le livre (tableau entier remplacé à chaque écriture). Vide ≠ zéro : un prix ou
 * un stock inconnu vaut `null`.
 */

export const varianteLivreSchema = z.object({
  id: idSchema,
  libelle: z.string(),
  reference: z.string().nullable(),
  prix: montantSchema.nullable(),
  ancienPrix: montantSchema.nullable(),
  stock: z.number().int().min(0).nullable(),
  disponible: z.boolean(),
})
export type VarianteLivre = z.infer<typeof varianteLivreSchema>

const traductionLivreLecture = z.object({
  slug: slugSchema,
  titre: z.string(),
  resume: z.string(),
})

export const livreSchema = z.object({
  ...contenuBaseShape,
  reference: z.string(),
  createurId: idSchema.nullable(),
  categorieId: idSchema.nullable(),
  imageId: idSchema.nullable(),
  galerieMediaIds: z.array(idSchema),
  visible: z.boolean(),
  prixConfirme: z.boolean(),
  auteur: z.string().nullable(),
  editeur: z.string().nullable(),
  isbn: z.string().nullable(),
  anneePublication: z.number().int().nullable(),
  nombrePages: z.number().int().nullable(),
  variantes: z.array(varianteLivreSchema),
  tagIds: z.array(idSchema),
  traductions: traductionsLecture(traductionLivreLecture),
})
export type Livre = z.infer<typeof livreSchema>

const traductionLivreEcriture = z.strictObject({
  slug: slugSchema.optional(),
  titre: z.string().trim().min(1).max(200),
  resume: z.string().max(2000).optional(),
})

export const varianteLivreEcriture = z.strictObject({
  id: idSchema.optional(),
  libelle: z.string().trim().min(1, 'Libellé obligatoire.').max(80),
  reference: z.string().trim().max(40).nullable(),
  prix: montantSchema.nullable(),
  ancienPrix: montantSchema.nullable(),
  stock: z.number().int().min(0).nullable(),
  disponible: z.boolean(),
})

const texteOuNull = (max: number) => z.string().trim().max(max).nullable().optional()

const champsLivre = {
  reference: z.string().trim().min(1).max(20),
  createurId: idSchema.nullable().optional(),
  categorieId: idSchema.nullable().optional(),
  imageId: idSchema.nullable().optional(),
  galerieMediaIds: z.array(idSchema).max(8).optional(),
  visible: z.boolean().optional(),
  prixConfirme: z.boolean().optional(),
  auteur: texteOuNull(200),
  editeur: texteOuNull(200),
  isbn: texteOuNull(20),
  anneePublication: z.number().int().min(1000).max(2100).nullable().optional(),
  nombrePages: z.number().int().min(1).max(10000).nullable().optional(),
  variantes: z.array(varianteLivreEcriture).max(20).optional(),
  tagIds: z.array(idSchema).max(50).optional(),
  traductions: traductionsEcriture(traductionLivreEcriture),
}
export const entreeLivreSchema = z.strictObject(champsLivre)
export const modificationLivreSchema = z.strictObject({
  ...z.strictObject(champsLivre).partial().shape,
  version: versionSchema,
})
