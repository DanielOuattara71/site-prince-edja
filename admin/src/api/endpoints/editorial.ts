import type { z } from 'zod'
import { creerRessource } from '@/api/endpoints/ressource'
import {
  archiveSchema,
  distinctionSchema,
  ecritureArchive,
  ecritureDistinction,
  ecritureJalon,
  ecritureOffre,
  ecriturePage,
  ecriturePresse,
  ecritureUnivers,
  jalonSchema,
  offreSchema,
  pageSchema,
  presseSchema,
  universSchema,
  destinationSchema,
  entreeDestinationSchema,
  entreeEpisodeSchema,
  entreeProjetSchema,
  entreeVilleSchema,
  episodeSchema,
  modificationDestinationSchema,
  modificationEpisodeSchema,
  modificationProjetSchema,
  modificationVilleSchema,
  projetSchema,
  resumeOrdonnableSchema,
  villeSchema,
} from '@/api/schemas/editorial'

/** Lot 2 du contrat (§ 19) : épisodes, projets, villes, destinations (§ 9.2 à 9.5). */

export const episodes = creerRessource('episodes', {
  lecture: episodeSchema,
  resume: resumeOrdonnableSchema,
  entree: entreeEpisodeSchema,
  modification: modificationEpisodeSchema,
})

export const projets = creerRessource('projets', {
  lecture: projetSchema,
  resume: resumeOrdonnableSchema,
  entree: entreeProjetSchema,
  modification: modificationProjetSchema,
})

export const villes = creerRessource('villes', {
  lecture: villeSchema,
  resume: resumeOrdonnableSchema,
  entree: entreeVilleSchema,
  modification: modificationVilleSchema,
})

export const destinations = creerRessource('destinations', {
  lecture: destinationSchema,
  resume: resumeOrdonnableSchema,
  entree: entreeDestinationSchema,
  modification: modificationDestinationSchema,
})

// --- Lot 3 (§ 9.6 à 9.12, § 9.15) ---
function lot3<L, E, M>(
  nom: string,
  lecture: z.ZodType<L>,
  ecriture: { entree: z.ZodType<E>; modification: z.ZodType<M> },
) {
  return creerRessource(nom, {
    lecture,
    resume: resumeOrdonnableSchema,
    entree: ecriture.entree,
    modification: ecriture.modification,
  })
}

export const archive = lot3('archive', archiveSchema, ecritureArchive)
export const distinctions = lot3('distinctions', distinctionSchema, ecritureDistinction)
export const presse = lot3('presse', presseSchema, ecriturePresse)
export const univers = lot3('univers', universSchema, ecritureUnivers)
export const jalons = lot3('jalons', jalonSchema, ecritureJalon)
export const offres = lot3('offres', offreSchema, ecritureOffre)
/** Ensemble fermé : `creer` et `supprimer` existent dans le gabarit, aucun écran ne les appelle. */
export const pages = lot3('pages', pageSchema, ecriturePage)
