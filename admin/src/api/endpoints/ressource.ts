import { z } from 'zod'
import { requete } from '@/api/client'
import {
  demandeTransitionSchema,
  pageSchema,
  parametresListeSchema,
  reponseTransitionSchema,
  type DemandeTransition,
  type Page,
  type ParametresListe,
} from '@/api/schemas/communs'

const idsSchema = z.object({ ids: z.array(z.uuid()) })

/**
 * Gabarit d'une ressource (`docs/CONTRAT-API.md` § 8). Chaque famille déclare ses
 * schémas une fois ; aucun écran ne recopie ces appels (section 9 du prompt admin).
 *
 * Les corps sont validés **avant** l'envoi par le schéma d'écriture strict (D-22) :
 * un champ en trop est une erreur de développement, pas un aller-retour avec le serveur.
 */
export interface SchemasRessource<Lecture, Resume, Entree, Modification> {
  lecture: z.ZodType<Lecture>
  resume: z.ZodType<Resume>
  entree: z.ZodType<Entree>
  modification: z.ZodType<Modification>
}

export function creerRessource<Lecture, Resume, Entree, Modification>(
  nom: string,
  schemas: SchemasRessource<Lecture, Resume, Entree, Modification>,
) {
  const base = `/${nom}`

  return {
    nom,

    /** `filtres` : les filtres propres à la ressource (`categorie`, `actif`…), tels quels. */
    lister(
      parametres: ParametresListe = {},
      signal?: AbortSignal,
      filtres: Record<string, string | undefined> = {},
    ): Promise<Page<Resume>> {
      return requete(base, {
        query: { ...parametresListeSchema.parse(parametres), ...filtres },
        schema: pageSchema(schemas.resume),
        ...(signal ? { signal } : {}),
      })
    },

    lire(id: string, signal?: AbortSignal): Promise<Lecture> {
      return requete(`${base}/${id}`, { schema: schemas.lecture, ...(signal ? { signal } : {}) })
    },

    creer(entree: Entree): Promise<Lecture> {
      return requete(base, {
        methode: 'POST',
        corps: schemas.entree.parse(entree),
        schema: schemas.lecture,
      })
    },

    modifier(id: string, modification: Modification): Promise<Lecture> {
      return requete(`${base}/${id}`, {
        methode: 'PATCH',
        corps: schemas.modification.parse(modification),
        schema: schemas.lecture,
      })
    },

    supprimer(id: string, version: number): Promise<undefined> {
      return requete(`${base}/${id}`, { methode: 'DELETE', query: { version } })
    },

    transition(id: string, demande: DemandeTransition) {
      return requete(`${base}/${id}/transition`, {
        methode: 'POST',
        corps: demandeTransitionSchema.parse(demande),
        schema: reponseTransitionSchema(schemas.lecture),
      })
    },

    ordonner(ids: string[]): Promise<{ ids: string[] }> {
      return requete(`${base}/ordre`, {
        methode: 'PATCH',
        corps: { ids },
        schema: idsSchema,
      })
    },
  }
}
