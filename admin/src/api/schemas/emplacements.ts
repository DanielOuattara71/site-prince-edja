import { z } from 'zod'
import { horodatageSchema, idSchema } from '@/api/schemas/communs'

/**
 * Emplacements fixes de photos du site (SCHEMAS § 10, PROMPT-CORRECTION § 7.3 ; contrat 1.5.0
 * proposé, § 22). Une place unique du site (héros de l'accueil…) qui reçoit une photo de la
 * médiathèque. On ne crée ni ne supprime d'emplacement depuis l'admin : la liste vient du code.
 */
export const emplacementPhotoSchema = z.object({
  cle: z.string().min(1),
  libelle: z.string(),
  /** « 2000 × 1200, paysage » ; `null` tant que le site ne l'a pas précisé (jamais inventé). */
  formatConseille: z.string().nullable(),
  mediaId: idSchema.nullable(),
  media: z
    .object({
      id: idSchema,
      url: z.string().min(1),
      texteAlt: z.string(),
    })
    .nullable(),
  misAJourLe: horodatageSchema.nullable(),
})
export type EmplacementPhoto = z.infer<typeof emplacementPhotoSchema>

export const listeEmplacementsSchema = z.object({ items: z.array(emplacementPhotoSchema) })

export const changementEmplacementSchema = z.strictObject({ mediaId: idSchema.nullable() })
