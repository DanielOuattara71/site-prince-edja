import { z } from 'zod'
import { compteSchema, horodatageSchema, langueSchema } from '@/api/schemas/communs'

/** Session et authentification (`docs/CONTRAT-API.md` § 3). */

/** 12 caractères au minimum (PB:554). La liste des mots de passe courants vit au serveur. */
export const motDePasseSchema = z.string().min(12, 'Au moins 12 caractères.').max(200)

export const moiSchema = z.object({
  compte: compteSchema,
  csrf: z.string().min(1),
  session: z.object({ expireLe: horodatageSchema }),
  reglages: z.object({
    boutiqueEnLigne: z.boolean(),
    multiVendeurs: z.boolean(),
    languesActives: z.array(langueSchema).min(1),
  }),
})
export type Moi = z.infer<typeof moiSchema>

export const connexionSchema = z.strictObject({
  email: z.email(),
  motDePasse: z.string().min(1).max(200),
})

export const changerMotDePasseSchema = z.strictObject({
  motDePasseActuel: z.string().min(1).max(200),
  nouveauMotDePasse: motDePasseSchema,
})

export const motDePasseOublieSchema = z.strictObject({ email: z.email() })

export const definirMotDePasseSchema = z.strictObject({
  jeton: z.string().min(1),
  nouveauMotDePasse: motDePasseSchema,
})
