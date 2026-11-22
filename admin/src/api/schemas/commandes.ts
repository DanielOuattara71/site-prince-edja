import { z } from 'zod'
import { idSchema, horodatageSchema, pageSchema } from './communs'

/**
 * Commandes (contrat 1.14.0 § 31.5) : lecture et remboursement. Le total est une chaîne
 * décimale, comme dans le back end ; l'admin ne le modifie jamais.
 */
export const etatCommandeSchema = z.enum([
  'en_attente',
  'payee',
  'expiree',
  'echouee',
  'rembourse',
])
export type EtatCommande = z.infer<typeof etatCommandeSchema>

export const commandeResumeSchema = z.object({
  id: idSchema,
  numero: z.string(),
  statut: etatCommandeSchema,
  total: z.string(),
  devise: z.string(),
  nom: z.string(),
  email: z.string(),
  fournisseur: z.string(),
  creeLe: horodatageSchema,
  payeeLe: horodatageSchema.nullable(),
})
export type CommandeResume = z.infer<typeof commandeResumeSchema>

export const ligneCommandeSchema = z.object({
  id: idSchema,
  commandeId: idSchema,
  varianteId: idSchema,
  quantite: z.number().int().positive(),
  prixUnitaire: z.string(),
  libelle: z.string(),
  createurId: idSchema,
  commissionTaux: z.string(),
  statutExpedition: z.string(),
})

export const paiementCommandeSchema = z.object({
  id: idSchema,
  commandeId: idSchema,
  prestataire: z.string(),
  referenceExterne: z.string(),
  montant: z.string(),
  statut: z.string(),
  payeLe: horodatageSchema.nullable(),
  referenceWebhook: z.string().nullable().optional(),
})

export const commandeDetailSchema = commandeResumeSchema.extend({
  lignes: z.array(ligneCommandeSchema),
  paiements: z.array(paiementCommandeSchema),
})
export type CommandeDetail = z.infer<typeof commandeDetailSchema>

export const listeCommandesSchema = pageSchema(commandeResumeSchema)
export type ParametresCommandes = {
  page?: number
  pageSize?: number
  statut?: EtatCommande
  q?: string
  tri?: '-creeLe'
}

export const compteursCommandesSchema = z.object({
  commandesEnAttente: z.number().int(),
  commandesPayees: z.number().int(),
  chiffreAffaires: z.string(),
})
export type CompteursCommandes = z.infer<typeof compteursCommandesSchema>
