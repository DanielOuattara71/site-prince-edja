import { requete, requeteTexte } from '@/api/client'
import { pageSchema, type Page } from '@/api/schemas/communs'
import {
  abonneSchema,
  demandeSchema,
  entreeModificationDemandeSchema,
  entreeModificationMessageSchema,
  messageSchema,
  type Abonne,
  type Demande,
  type Message,
  type ModificationDemande,
  type ModificationMessage,
  type ParametresAbonnes,
  type ParametresDemandes,
  type ParametresMessages,
} from '@/api/schemas/audience'

/**
 * Boîtes de réception et newsletter (`docs/CONTRAT-API.md` § 12) : les messages, les demandes
 * de pièce et les abonnés. Points d'accès ajoutés pour l'étape 8 — la couche API est la seule
 * endroit qui parle au serveur, les écrans lisent ces fonctions.
 */

export const messages = {
  lister(parametres: ParametresMessages): Promise<Page<Message>> {
    return requete('/messages', { query: { ...parametres }, schema: pageSchema(messageSchema) })
  },
  lire(id: string): Promise<Message> {
    return requete(`/messages/${id}`, { schema: messageSchema })
  },
  modifier(id: string, modification: ModificationMessage): Promise<Message> {
    return requete(`/messages/${id}`, {
      methode: 'PATCH',
      corps: entreeModificationMessageSchema.parse(modification),
      schema: messageSchema,
    })
  },
  supprimer(id: string, version: number) {
    return requete(`/messages/${id}`, { methode: 'DELETE', query: { version } })
  },
}

export const demandes = {
  lister(parametres: ParametresDemandes): Promise<Page<Demande>> {
    return requete('/demandes', { query: { ...parametres }, schema: pageSchema(demandeSchema) })
  },
  lire(id: string): Promise<Demande> {
    return requete(`/demandes/${id}`, { schema: demandeSchema })
  },
  modifier(id: string, modification: ModificationDemande): Promise<Demande> {
    return requete(`/demandes/${id}`, {
      methode: 'PATCH',
      corps: entreeModificationDemandeSchema.parse(modification),
      schema: demandeSchema,
    })
  },
}

export const abonnes = {
  lister(parametres: ParametresAbonnes): Promise<Page<Abonne>> {
    return requete('/abonnes', { query: { ...parametres }, schema: pageSchema(abonneSchema) })
  },
  lire(id: string): Promise<Abonne> {
    return requete(`/abonnes/${id}`, { schema: abonneSchema })
  },
  supprimer(id: string) {
    return requete(`/abonnes/${id}`, { methode: 'DELETE' })
  },
  /** Export CSV (§ 12.3), journalisé côté serveur. Mêmes filtres que la liste. */
  exporterAbonnes(parametres: ParametresAbonnes): Promise<string> {
    return requeteTexte('/abonnes/export', { query: { ...parametres } })
  },
}
