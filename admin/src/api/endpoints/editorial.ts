import type { z } from 'zod'
import { creerRessource } from '@/api/endpoints/ressource'
import { entreeLivreSchema, livreSchema, modificationLivreSchema } from '@/api/schemas/livres'
import {
  archiveSchema,
  distinctionSchema,
  ecritureArchive,
  ecritureDistinction,
  ecritureEtudeCas,
  ecritureGalerie,
  ecritureJalon,
  ecritureOffre,
  ecriturePage,
  ecriturePageLegale,
  ecriturePartenaire,
  ecriturePresse,
  ecritureUnivers,
  etudeCasSchema,
  galerieSchema,
  jalonSchema,
  offreSchema,
  pageLegaleSchema,
  pageSchema,
  partenaireSchema,
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

// --- Lot 4 (§ 9.9, § 9.13 à 9.16) ---

export const galerie = lot3('galerie', galerieSchema, ecritureGalerie)
export const etudesCas = lot3('etudes-cas', etudeCasSchema, ecritureEtudeCas)
export const partenaires = lot3('partenaires', partenaireSchema, ecriturePartenaire)
/** Ensemble fermé : ni créées ni supprimées (§ 9.16). */
export const pagesLegales = lot3('pages-legales', pageLegaleSchema, ecriturePageLegale)

/** Livres (SCHEMAS § 8.3 ; contrat 1.5.0 proposé, § 22) : servis par le faux serveur seulement. */
export const livres = creerRessource('livres', {
  lecture: livreSchema,
  resume: resumeOrdonnableSchema,
  entree: entreeLivreSchema,
  modification: modificationLivreSchema,
})
