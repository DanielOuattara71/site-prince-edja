import { z } from 'zod'
import { requete } from '@/api/client'
import { creerRessource } from '@/api/endpoints/ressource'
import {
  bijouSchema,
  categorieSchema,
  entreeBijouSchema,
  entreeCategorieSchema,
  entreeVarianteSchema,
  modificationBijouSchema,
  modificationCategorieSchema,
  modificationVarianteSchema,
  resumeBijouSchema,
  varianteSchema,
  type EntreeVariante,
  type ModificationVariante,
  type Variante,
} from '@/api/schemas/boutique'
import { pageSchema, type Page } from '@/api/schemas/communs'
import {
  createurPrincipalSchema,
  createurSchema,
  entreeCreateurSchema,
  modificationCreateurSchema,
  resumeCreateurSchema,
  type Createur,
  type CreateurPrincipal,
  type ResumeCreateur,
} from '@/api/schemas/createurs'

/** Lot 2 du contrat (§ 19) : catégories, créateurs, bijoux et variantes (§ 10). */

export const categories = creerRessource('categories', {
  lecture: categorieSchema,
  resume: categorieSchema,
  entree: entreeCategorieSchema,
  modification: modificationCategorieSchema,
})

export const createurs = {
  ...creerRessource('createurs', {
    lecture: createurSchema,
    resume: resumeCreateurSchema,
    entree: entreeCreateurSchema,
    modification: modificationCreateurSchema,
  }),
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
  lirePrincipal(): Promise<Createur> {
    return requete('/createurs/principal', { schema: createurSchema })
  },
}

const idsSchema = z.object({ ids: z.array(z.uuid()) })

export const bijoux = {
  ...creerRessource('bijoux', {
    lecture: bijouSchema,
    resume: resumeBijouSchema,
    entree: entreeBijouSchema,
    modification: modificationBijouSchema,
  }),
  /** Variantes (§ 10.3) : routes dédiées, chacune avec sa version. */
  variantes: {
    creer(bijouId: string, entree: EntreeVariante): Promise<Variante> {
      return requete(`/bijoux/${bijouId}/variantes`, {
        methode: 'POST',
        corps: entreeVarianteSchema.parse(entree),
        schema: varianteSchema,
      })
    },
    modifier(bijouId: string, id: string, modification: ModificationVariante): Promise<Variante> {
      return requete(`/bijoux/${bijouId}/variantes/${id}`, {
        methode: 'PATCH',
        corps: modificationVarianteSchema.parse(modification),
        schema: varianteSchema,
      })
    },
    supprimer(bijouId: string, id: string, version: number): Promise<undefined> {
      return requete(`/bijoux/${bijouId}/variantes/${id}`, {
        methode: 'DELETE',
        query: { version },
      })
    },
    ordonner(bijouId: string, ids: string[]): Promise<{ ids: string[] }> {
      return requete(`/bijoux/${bijouId}/variantes/ordre`, {
        methode: 'PATCH',
        corps: { ids },
        schema: idsSchema,
      })
    },
  },
}
