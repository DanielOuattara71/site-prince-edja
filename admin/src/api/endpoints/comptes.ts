import { requete } from '@/api/client'
import { compteSchema, pageSchema, type Compte, type Page } from '@/api/schemas/communs'
import {
  type EntreeCompte,
  type ModificationCompte,
  type ParametresComptes,
} from '@/api/schemas/comptes'

/**
 * Comptes (`docs/CONTRAT-API.md` § 15.1) : lecture, création, rôle, désactivation et
 * réinitialisation (envoi de lien). La couche API est la seule endroit qui parle au serveur.
 */

export const comptes = {
  lister(parametres: ParametresComptes): Promise<Page<Compte>> {
    return requete('/comptes', { query: parametres, schema: pageSchema(compteSchema) })
  },

  lire(id: string): Promise<Compte> {
    return requete(`/comptes/${id}`, { schema: compteSchema })
  },

  creer(entree: EntreeCompte): Promise<Compte> {
    return requete('/comptes', { methode: 'POST', corps: entree, schema: compteSchema })
  },

  modifier(id: string, modification: ModificationCompte): Promise<Compte> {
    return requete(`/comptes/${id}`, {
      methode: 'PATCH',
      corps: modification,
      schema: compteSchema,
    })
  },

  /** Réinitialisation : l'e-mail part par lien, la session du compte est révoquée. */
  envoyerLien(id: string): Promise<void> {
    return requete(`/comptes/${id}/lien-mot-de-passe`, { methode: 'POST' })
  },
}
