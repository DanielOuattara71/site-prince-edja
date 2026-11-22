import { z } from 'zod'
import { requete } from '@/api/client'
import {
  compteursCommandesSchema,
  commandeDetailSchema,
  listeCommandesSchema,
  type ParametresCommandes,
} from '@/api/schemas/commandes'

/** Commandes et remboursement (contrat 1.14.0 § 31.5). */
export const commandes = {
  lister(parametres: ParametresCommandes) {
    return requete('/commandes', {
      query: { ...parametres },
      schema: listeCommandesSchema,
    })
  },
  lire(numero: string) {
    return requete(`/commandes/${encodeURIComponent(numero)}`, { schema: commandeDetailSchema })
  },
  rembourser(numero: string, motif?: string) {
    return requete(`/commandes/${encodeURIComponent(numero)}/rembourser`, {
      methode: 'POST',
      corps: motif ? { motif } : {},
      schema: z.object({ statut: z.string(), dejaFait: z.boolean() }),
    })
  },
  compteurs() {
    return requete('/commandes-compteurs', { schema: compteursCommandesSchema })
  },
}

