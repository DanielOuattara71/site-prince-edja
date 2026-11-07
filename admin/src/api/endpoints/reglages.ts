import { z } from 'zod'
import { requete } from '@/api/client'
import { pageSchema, type Page } from '@/api/schemas/communs'
import {
  chiffreAudienceSchema,
  entreeChiffreSchema,
  entreeMotifSchema,
  modificationChiffreSchema,
  modificationMotifSchema,
  modificationNavigationSchema,
  modificationParametresSchema,
  modificationTextesInterfaceSchema,
  motifContactSchema,
  navigationSchema,
  parametresSchema,
  textesInterfaceSchema,
  type ChiffreAudience,
  type EntreeChiffre,
  type EntreeMotif,
  type ModificationChiffre,
  type ModificationMotif,
  type ModificationNavigation,
  type ModificationParametres,
  type ModificationTextesInterface,
  type MotifContact,
  type Navigation,
  type Parametres,
  type TextesInterface,
} from '@/api/schemas/reglages'

/**
 * Réglages du site (contrat § 13) : la couche API seule parle au serveur (section 12 du prompt
 * admin), les écrans lisent ces fonctions. Lecture, puis PATCH avec `version`.
 */

/** Liste figée à `pageSize: 100` : ces tables comptent une poignée de lignes. */
const idsSchema = z.strictObject({ ids: z.array(z.uuid()).min(1) })

// --- `audience` (§ 13.2) : chiffres par plateforme, ordonnables, sans cycle de vie ---

export const chiffresAudience = {
  lister(): Promise<Page<ChiffreAudience>> {
    return requete('/audience', {
      query: { pageSize: 100 },
      schema: pageSchema(chiffreAudienceSchema),
    })
  },
  creer(entree: EntreeChiffre): Promise<ChiffreAudience> {
    return requete('/audience', {
      methode: 'POST',
      corps: entreeChiffreSchema.parse(entree),
      schema: chiffreAudienceSchema,
    })
  },
  modifier(id: string, modification: ModificationChiffre): Promise<ChiffreAudience> {
    return requete(`/audience/${id}`, {
      methode: 'PATCH',
      corps: modificationChiffreSchema.parse(modification),
      schema: chiffreAudienceSchema,
    })
  },
  supprimer(id: string, version: number): Promise<undefined> {
    return requete(`/audience/${id}`, { methode: 'DELETE', query: { version } })
  },
  ordonner(ids: string[]): Promise<{ ids: string[] }> {
    return requete('/audience/ordre', {
      methode: 'PATCH',
      corps: { ids },
      schema: idsSchema,
    })
  },
}

// --- `motifs-contact` (§ 13.6), mêmes règles que les chiffres d'audience ---

export const motifsContact = {
  lister(): Promise<Page<MotifContact>> {
    return requete('/motifs-contact', {
      query: { pageSize: 100 },
      schema: pageSchema(motifContactSchema),
    })
  },
  creer(entree: EntreeMotif): Promise<MotifContact> {
    return requete('/motifs-contact', {
      methode: 'POST',
      corps: entreeMotifSchema.parse(entree),
      schema: motifContactSchema,
    })
  },
  modifier(id: string, modification: ModificationMotif): Promise<MotifContact> {
    return requete(`/motifs-contact/${id}`, {
      methode: 'PATCH',
      corps: modificationMotifSchema.parse(modification),
      schema: motifContactSchema,
    })
  },
  supprimer(id: string, version: number): Promise<undefined> {
    return requete(`/motifs-contact/${id}`, { methode: 'DELETE', query: { version } })
  },
  ordonner(ids: string[]): Promise<{ ids: string[] }> {
    return requete('/motifs-contact/ordre', {
      methode: 'PATCH',
      corps: { ids },
      schema: idsSchema,
    })
  },
}

// --- singletons : lecture puis remplacement (§ 13.1 à 13.5) ---

export const parametres = {
  lire(signal?: AbortSignal): Promise<Parametres> {
    return requete('/parametres', { schema: parametresSchema, ...(signal ? { signal } : {}) })
  },
  modifier(modification: ModificationParametres): Promise<Parametres> {
    return requete('/parametres', {
      methode: 'PATCH',
      corps: modificationParametresSchema.parse(modification),
      schema: parametresSchema,
    })
  },
}

export const navigation = {
  lire(signal?: AbortSignal): Promise<Navigation> {
    return requete('/navigation', { schema: navigationSchema, ...(signal ? { signal } : {}) })
  },
  modifier(modification: ModificationNavigation): Promise<Navigation> {
    return requete('/navigation', {
      methode: 'PATCH',
      corps: modificationNavigationSchema.parse(modification),
      schema: navigationSchema,
    })
  },
}

export const textesInterface = {
  lire(signal?: AbortSignal): Promise<TextesInterface> {
    return requete('/textes-interface', {
      schema: textesInterfaceSchema,
      ...(signal ? { signal } : {}),
    })
  },
  modifier(modification: ModificationTextesInterface): Promise<TextesInterface> {
    return requete('/textes-interface', {
      methode: 'PATCH',
      corps: modificationTextesInterfaceSchema.parse(modification),
      schema: textesInterfaceSchema,
    })
  },
}
