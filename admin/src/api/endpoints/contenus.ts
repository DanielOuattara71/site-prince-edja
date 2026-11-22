import { z } from 'zod'
import { requete, requeteTexte } from '@/api/client'
import { creerRessource } from '@/api/endpoints/ressource'
import {
  articleSchema,
  entreeArticleSchema,
  modificationArticleSchema,
} from '@/api/schemas/articles'
import {
  idSchema,
  pageSchema,
  resumeContenuSchema,
  usageSchema,
  type Page,
  type Usage,
} from '@/api/schemas/communs'
import {
  envoiMediaSchema,
  mediaSchema,
  modificationMediaSchema,
  type EnvoiMedia,
  type Media,
  type ModificationMedia,
} from '@/api/schemas/medias'
import {
  entreeJournalSchema,
  parametresJournalSchema,
  publicationSchema,
  tableauDeBordSchema,
  type EntreeJournal,
  type ParametresJournal,
  type Publication,
} from '@/api/schemas/site'
import {
  entreeTagSchema,
  modificationTagSchema,
  tagSchema,
  type typeTagSchema,
} from '@/api/schemas/tags'

/** Lot 1 du contrat (§ 19) : articles, médias, tags, site, journal, tableau de bord. */

export const articles = creerRessource('articles', {
  lecture: articleSchema,
  resume: resumeContenuSchema,
  entree: entreeArticleSchema,
  modification: modificationArticleSchema,
})

export const tags = {
  ...creerRessource('tags', {
    lecture: tagSchema,
    resume: tagSchema,
    entree: entreeTagSchema,
    modification: modificationTagSchema,
  }),
  listerParType(type: z.infer<typeof typeTagSchema>, q?: string) {
    return requete('/tags', {
      query: { type, pageSize: 100, ...(q ? { q } : {}) },
      schema: pageSchema(tagSchema),
    })
  },
  usages(id: string): Promise<Usage[]> {
    return requete(`/tags/${id}/usages`, { schema: z.array(usageSchema) })
  },
}

export interface ParametresMedias {
  page?: number
  pageSize?: number
  q?: string
  /** Sous-chaîne insensible à la casse sur l'emplacement (contrat 1.6.0 § 23.1). */
  emplacement?: string
  mime?: 'image' | 'pdf'
  createur?: string
  aFournir?: boolean
  nonUtilise?: boolean
}

export const medias = {
  lister(parametres: ParametresMedias = {}): Promise<Page<Media>> {
    return requete('/medias', { query: { ...parametres }, schema: pageSchema(mediaSchema) })
  },
  lire(id: string): Promise<Media> {
    return requete(`/medias/${idSchema.parse(id)}`, { schema: mediaSchema })
  },
  /** Un fichier par requête (§ 11.2) ; l'envoi multiple enchaîne les appels (D-20). */
  envoyer(fichier: File, champs: EnvoiMedia): Promise<Media> {
    const valides = envoiMediaSchema.parse(champs)
    const formulaire = new FormData()
    formulaire.append('fichier', fichier)
    for (const [cle, valeur] of Object.entries(valides)) {
      if (valeur !== undefined && valeur !== null) formulaire.append(cle, String(valeur))
    }
    return requete('/medias', { methode: 'POST', formulaire, schema: mediaSchema })
  },
  /** Remplacer le binaire en place (contrat 1.19.0 § 36) : même id, nouvelle version. */
  remplacer(id: string, fichier: File, version: number): Promise<Media> {
    const formulaire = new FormData()
    formulaire.append('fichier', fichier)
    formulaire.append('version', String(version))
    return requete(`/medias/${id}/remplacer`, {
      methode: 'POST',
      formulaire,
      schema: mediaSchema,
    })
  },
  modifier(id: string, modification: ModificationMedia): Promise<Media> {
    return requete(`/medias/${id}`, {
      methode: 'PATCH',
      corps: modificationMediaSchema.parse(modification),
      schema: mediaSchema,
    })
  },
  usages(id: string): Promise<Usage[]> {
    return requete(`/medias/${id}/usages`, { schema: z.array(usageSchema) })
  },
  supprimer(id: string, version: number) {
    return requete(`/medias/${id}`, { methode: 'DELETE', query: { version } })
  },
}

export const site = {
  reconstruire(): Promise<Publication> {
    return requete('/site/reconstruire', { methode: 'POST', schema: publicationSchema })
  },
  etat(): Promise<Publication | null> {
    return requete('/site/etat-reconstruction', { schema: publicationSchema.nullable() })
  },
  publication(id: string): Promise<Publication> {
    return requete(`/site/publications/${id}`, { schema: publicationSchema })
  },
  publications(
    parametres: {
      page?: number
      pageSize?: number
      etat?: Publication['etat']
      motif?: Publication['motif']
    } = {},
  ) {
    return requete('/site/publications', {
      query: { ...parametres },
      schema: pageSchema(publicationSchema),
    })
  },
}

export const journal = {
  lister(parametres: ParametresJournal = {}): Promise<Page<EntreeJournal>> {
    return requete('/journal', {
      query: parametresJournalSchema.parse(parametres),
      schema: pageSchema(entreeJournalSchema),
    })
  },
  /** CSV, super-admin seulement (§ 15.2). */
  exporter(parametres: ParametresJournal = {}): Promise<string> {
    return requeteTexte('/journal/export', { query: parametresJournalSchema.parse(parametres) })
  },
}

export function lireTableauDeBord() {
  return requete('/tableau-de-bord', { schema: tableauDeBordSchema })
}
