import { z } from 'zod'
import { requete } from '@/api/client'
import {
  demandeRestaurationSchema,
  entreeVersionSchema,
  instantaneSchema,
  type DemandeRestauration,
  type EntreeVersion,
  type Instantane,
  type RessourceVersionnee,
} from '@/api/schemas/versions'

/** Versions et restauration (§ 14.2), pour les composants transverses. */

export const versions = {
  lister(ressource: RessourceVersionnee, id: string): Promise<EntreeVersion[]> {
    return requete(`/versions/${ressource}/${id}`, { schema: z.array(entreeVersionSchema) })
  },
  lire(ressource: RessourceVersionnee, id: string, version: number): Promise<Instantane> {
    return requete(`/versions/${ressource}/${id}/${version}`, { schema: instantaneSchema })
  },
  /** Crée une nouvelle version ; ne change pas le statut. Renvoie l'objet complet. */
  restaurer(demande: DemandeRestauration): Promise<unknown> {
    return requete('/restauration', {
      methode: 'POST',
      corps: demandeRestaurationSchema.parse(demande),
      schema: z.unknown(),
    })
  },
}
