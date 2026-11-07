import { z } from 'zod'
import { compteSchema, roleSchema, type Compte } from '@/api/schemas/communs'

/**
 * Comptes (`docs/CONTRAT-API.md` § 15.1, RG-16, RG-18) : écriture sans mot de passe — un
 * lien part par e-mail, valable 72 h (création) ou 1 h (réinitialisation).
 */

export const entreeCompteSchema = z.strictObject({
  email: z.email().max(254),
  nom: z.string().trim().min(1).max(120),
  role: roleSchema,
})
export type EntreeCompte = z.infer<typeof entreeCompteSchema>

export const modificationCompteSchema = z.strictObject({
  nom: z.string().trim().min(1).max(120).optional(),
  role: roleSchema.optional(),
  actif: z.boolean().optional(),
  /** Double saisie de RG-16 : l'e-mail **du compte modifié**, exigé pour changer son rôle. */
  confirmationEmail: z.email().max(254).optional(),
})
export type ModificationCompte = z.infer<typeof modificationCompteSchema>

export const listeComptesSchema = z.strictObject({
  page: z.number().int().positive().optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
  role: roleSchema.optional(),
  actif: z.boolean().optional(),
})
export type ParametresComptes = z.infer<typeof listeComptesSchema>

export type { Compte }
export { compteSchema }
