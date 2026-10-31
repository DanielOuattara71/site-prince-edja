import { z } from 'zod'
import { requete } from '@/api/client'
import { pageSchema } from '@/api/schemas/communs'
import {
  createurPrincipalSchema,
  resumeCreateurSchema,
  type CreateurPrincipal,
  type ResumeCreateur,
} from '@/api/schemas/createurs'
import {
  demandeRestaurationSchema,
  entreeVersionSchema,
  instantaneSchema,
  type DemandeRestauration,
  type EntreeVersion,
  type Instantane,
  type RessourceVersionnee,
} from '@/api/schemas/versions'
import type { Page } from '@/api/schemas/communs'

/** Versions (§ 14.2) et lecture des créateurs (§ 10.2), pour les composants transverses. */

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

export const createurs = {
  /** Créateurs publiés et actifs : ceux auxquels un produit peut être rattaché (RG-20, RG-27). */
  listerSelectionnables(q?: string): Promise<Page<ResumeCreateur>> {
    return requete('/createurs', {
      query: { statut: 'publie', actif: true, pageSize: 100, ...(q ? { q } : {}) },
      schema: pageSchema(resumeCreateurSchema),
    })
  },
  principal(): Promise<CreateurPrincipal> {
    return requete('/createurs/principal', { schema: createurPrincipalSchema })
  },
}
