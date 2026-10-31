import { z } from 'zod'
import {
  idSchema,
  resumeContenuSchema,
  slugSchema,
  statutContenuSchema,
} from '@/api/schemas/communs'

/**
 * Créateurs (`docs/CONTRAT-API.md` § 10.2), en lecture seulement à ce stade : ce qu'il faut
 * aux sélecteurs et aux filtres. L'écran de gestion arrive avec le lot 2.
 */

/** Ligne de liste (§ 8) : `titre` porte le nom du créateur. */
export const resumeCreateurSchema = resumeContenuSchema.extend({ actif: z.boolean().optional() })
export type ResumeCreateur = z.infer<typeof resumeCreateurSchema>

/** Ce que les sélecteurs lisent du créateur principal (lecture tolérante, D-22). */
export const createurPrincipalSchema = z.object({
  id: idSchema,
  slug: slugSchema,
  nom: z.string(),
  statut: statutContenuSchema,
  estPrincipal: z.literal(true),
  actif: z.boolean(),
})
export type CreateurPrincipal = z.infer<typeof createurPrincipalSchema>
