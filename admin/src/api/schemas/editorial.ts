import { z } from 'zod'
import {
  CLES_PAGE,
  cibleInterneEcriture,
  cibleInterneSchema,
  contenuBaseShape,
  datePartielleSchema,
  idSchema,
  resumeContenuSchema,
  slugSchema,
  traductionsEcriture,
  traductionsLecture,
  versionSchema,
} from '@/api/schemas/communs'

/**
 * Ressources éditoriales du lot 2 (`docs/CONTRAT-API.md` § 9.2 à 9.5) : épisodes, projets,
 * villes, destinations. Lecture tolérante, écriture stricte (D-22). Un texte de crédibilité
 * (**C**) absent vaut `null`, jamais une chaîne inventée.
 */

const texte = (max: number) => z.string().trim().min(1).max(max)
const urlHttps = z
  .string()
  .trim()
  .max(500)
  .regex(/^https:\/\/\S+$/, 'Une adresse qui commence par https://.')

/** Champs propres ajoutés au résumé de liste (§ 8). */
export const resumeOrdonnableSchema = resumeContenuSchema.extend({
  ordre: z.number().int().optional(),
  numero: z.string().optional(),
  cle: z.string().optional(),
  periode: z.string().optional(),
})
export type ResumeEditorial = z.infer<typeof resumeOrdonnableSchema>

// --- Épisodes (§ 9.2) ---

const traductionEpisodeLecture = z.object({
  slug: slugSchema,
  titre: z.string(),
  lieu: z.string(),
  pitch: z.string(),
  synopsisLong: z.string().nullable(),
  noteIntention: z.string().nullable(),
  personnages: z.string().nullable(),
  makingOf: z.string().nullable(),
  presse: z.string().nullable(),
  credits: z.string().nullable(),
})

export const episodeSchema = z.object({
  ...contenuBaseShape,
  numero: z.string(),
  imageId: idSchema.nullable(),
  guideMediaId: idSchema.nullable(),
  destinationId: idSchema.nullable(),
  trailerUrl: z.string().nullable(),
  dureeMinutes: z.number().int().nullable(),
  tagIds: z.array(idSchema),
  traductions: traductionsLecture(traductionEpisodeLecture),
})
export type Episode = z.infer<typeof episodeSchema>

const traductionEpisodeEcriture = z.strictObject({
  slug: slugSchema.optional(),
  titre: texte(200),
  lieu: z.string().trim().max(200).optional(),
  pitch: z.string().max(300).optional(),
  synopsisLong: texte(8000).nullable().optional(),
  noteIntention: texte(8000).nullable().optional(),
  personnages: texte(8000).nullable().optional(),
  makingOf: texte(8000).nullable().optional(),
  presse: texte(8000).nullable().optional(),
  credits: texte(8000).nullable().optional(),
})

const champsEpisode = {
  numero: texte(10),
  imageId: idSchema.nullable().optional(),
  guideMediaId: idSchema.nullable().optional(),
  destinationId: idSchema.nullable().optional(),
  trailerUrl: urlHttps.nullable().optional(),
  dureeMinutes: z.number().int().min(1).max(1000).nullable().optional(),
  tagIds: z.array(idSchema).max(50).optional(),
  traductions: traductionsEcriture(traductionEpisodeEcriture),
}
export const entreeEpisodeSchema = z.strictObject(champsEpisode)
export const modificationEpisodeSchema = z.strictObject({
  ...z.strictObject(champsEpisode).partial().shape,
  version: versionSchema,
})

// --- Projets (§ 9.3) ---

export const FORMATS_PROJET = ['Documentaire', 'Série', 'Émission', 'Archive'] as const
export const AVANCEMENTS_PROJET = ['disponible', 'en_production', 'en_preparation'] as const

const traductionProjetLecture = z.object({
  slug: slugSchema,
  titre: z.string(),
  accroche: z.string(),
})

export const projetSchema = z.object({
  ...contenuBaseShape,
  format: z.enum(FORMATS_PROJET),
  avancement: z.enum(AVANCEMENTS_PROJET),
  annee: datePartielleSchema.nullable(),
  imageId: idSchema.nullable(),
  cible: cibleInterneSchema.nullable(),
  tagIds: z.array(idSchema),
  ordre: z.number().int(),
  traductions: traductionsLecture(traductionProjetLecture),
})
export type Projet = z.infer<typeof projetSchema>

const traductionProjetEcriture = z.strictObject({
  slug: slugSchema.optional(),
  titre: texte(200),
  accroche: z.string().max(300).optional(),
})

const champsProjet = {
  format: z.enum(FORMATS_PROJET),
  avancement: z.enum(AVANCEMENTS_PROJET),
  annee: datePartielleSchema.nullable().optional(),
  imageId: idSchema.nullable().optional(),
  cible: cibleInterneEcriture.nullable().optional(),
  tagIds: z.array(idSchema).max(50).optional(),
  traductions: traductionsEcriture(traductionProjetEcriture),
}
export const entreeProjetSchema = z.strictObject(champsProjet)
export const modificationProjetSchema = z.strictObject({
  ...z.strictObject(champsProjet).partial().shape,
  version: versionSchema,
})

// --- Villes (§ 9.4) : pas de slug, ce ne sont pas des pages ---

const traductionVilleLecture = z.object({ nom: z.string(), intention: z.string() })

export const villeSchema = z.object({
  ...contenuBaseShape,
  imageId: idSchema.nullable(),
  tagIds: z.array(idSchema),
  ordre: z.number().int(),
  traductions: traductionsLecture(traductionVilleLecture),
})
export type Ville = z.infer<typeof villeSchema>

const traductionVilleEcriture = z.strictObject({
  nom: texte(120),
  intention: z.string().max(300).optional(),
})
const champsVille = {
  imageId: idSchema.nullable().optional(),
  tagIds: z.array(idSchema).max(50).optional(),
  traductions: traductionsEcriture(traductionVilleEcriture),
}
export const entreeVilleSchema = z.strictObject(champsVille)
export const modificationVilleSchema = z.strictObject({
  ...z.strictObject(champsVille).partial().shape,
  version: versionSchema,
})

// --- Destinations (§ 9.5) ---

const traductionDestinationLecture = z.object({
  slug: slugSchema,
  nom: z.string(),
  texte: z.string().nullable(),
})

export const destinationSchema = z.object({
  ...contenuBaseShape,
  // Coordonnées : P, donc vides tant qu'elles ne sont pas fournies.
  latitude: z.number().min(-90).max(90).nullable(),
  longitude: z.number().min(-180).max(180).nullable(),
  episodeId: idSchema.nullable(),
  guideMediaId: idSchema.nullable(),
  imageId: idSchema.nullable(),
  tagIds: z.array(idSchema),
  traductions: traductionsLecture(traductionDestinationLecture),
})
export type Destination = z.infer<typeof destinationSchema>

const traductionDestinationEcriture = z.strictObject({
  slug: slugSchema.optional(),
  nom: texte(120),
  texte: texte(8000).nullable().optional(),
})
const champsDestination = {
  latitude: z.number().min(-90).max(90).nullable().optional(),
  longitude: z.number().min(-180).max(180).nullable().optional(),
  episodeId: idSchema.nullable().optional(),
  guideMediaId: idSchema.nullable().optional(),
  imageId: idSchema.nullable().optional(),
  tagIds: z.array(idSchema).max(50).optional(),
  traductions: traductionsEcriture(traductionDestinationEcriture),
}
export const entreeDestinationSchema = z.strictObject(champsDestination)
export const modificationDestinationSchema = z.strictObject({
  ...z.strictObject(champsDestination).partial().shape,
  version: versionSchema,
})

/**
 * Limites de la Côte d'Ivoire pour le contrôle `COORDONNEES_HORS_PAYS` (§ 9.5). Motif : l'erreur
 * de signe passée sur Adiaké (longitude positive, donc hors du pays).
 */
export const LIMITES_COTE_IVOIRE = { latMin: 4.2, latMax: 10.8, lngMin: -8.7, lngMax: -2.4 }

// --- Lot 3 éditorial (§ 9.6 à 9.12, § 9.15) ---

const texteOuNull = (max: number) => z.string().trim().min(1).max(max).nullable().optional()
const ecriture = <T extends z.ZodRawShape>(champs: T) => ({
  entree: z.strictObject(champs),
  modification: z.strictObject({
    ...z.strictObject(champs).partial().shape,
    version: versionSchema,
  }),
})

/** Archive d'Afrique (§ 9.6) : une entrée sans source n'est pas publiable (règle du CDC). */
export const FIABILITES = ['documentee', 'memoire_orale', 'interpretation'] as const
export const TYPES_SOURCE_ARCHIVE = ['ecrite', 'orale', 'iconographique', 'autre'] as const
export const sourceArchiveSchema = z.object({
  libelle: z.string(),
  url: z.string().nullable(),
  type: z.enum(TYPES_SOURCE_ARCHIVE),
})
export const archiveSchema = z.object({
  ...contenuBaseShape,
  categorie: z.string(),
  fiabilite: z.enum(FIABILITES).nullable(),
  epoque: z.string().nullable(),
  imageId: idSchema.nullable(),
  tagIds: z.array(idSchema),
  sources: z.array(sourceArchiveSchema),
  traductions: traductionsLecture(
    z.object({ slug: slugSchema, titre: z.string(), texte: z.string().nullable() }),
  ),
})
export const ecritureArchive = ecriture({
  categorie: z.string().trim().min(1).max(60),
  fiabilite: z.enum(FIABILITES).nullable().optional(),
  epoque: texteOuNull(120),
  imageId: idSchema.nullable().optional(),
  tagIds: z.array(idSchema).max(50).optional(),
  sources: z
    .array(
      z.strictObject({
        libelle: z.string().trim().min(1).max(300),
        url: urlHttps.nullable(),
        type: z.enum(TYPES_SOURCE_ARCHIVE),
      }),
    )
    .max(50)
    .optional(),
  traductions: traductionsEcriture(
    z.strictObject({ slug: slugSchema.optional(), titre: texte(200), texte: texteOuNull(20000) }),
  ),
})

/** Distinctions et fonctions officielles (§ 9.7) : date obligatoire. */
export const NATURES_DISTINCTION = ['distinction', 'fonction_officielle'] as const
export const distinctionSchema = z.object({
  ...contenuBaseShape,
  nature: z.enum(NATURES_DISTINCTION),
  annee: datePartielleSchema.nullable(),
  organisme: z.string().nullable(),
  lien: z.string().nullable(),
  imageId: idSchema.nullable(),
  tagIds: z.array(idSchema),
  ordre: z.number().int(),
  traductions: traductionsLecture(
    z.object({ titre: z.string(), description: z.string().nullable() }),
  ),
})
export const ecritureDistinction = ecriture({
  nature: z.enum(NATURES_DISTINCTION),
  annee: datePartielleSchema.nullable().optional(),
  organisme: texteOuNull(200),
  lien: urlHttps.nullable().optional(),
  imageId: idSchema.nullable().optional(),
  tagIds: z.array(idSchema).max(50).optional(),
  traductions: traductionsEcriture(
    z.strictObject({ titre: texte(200), description: texteOuNull(4000) }),
  ),
})

/** Presse (§ 9.8) : source, date et lien obligatoires ; une seule parution à la une. */
export const presseSchema = z.object({
  ...contenuBaseShape,
  source: z.string(),
  datePublication: datePartielleSchema.nullable(),
  lien: z.string().nullable(),
  avatarId: idSchema.nullable(),
  aLaUne: z.boolean(),
  tagIds: z.array(idSchema),
  ordre: z.number().int(),
  traductions: traductionsLecture(
    z.object({ titre: z.string(), resume: z.string().nullable(), citation: z.string().nullable() }),
  ),
})
export const ecriturePresse = ecriture({
  source: z.string().trim().min(1).max(200),
  datePublication: datePartielleSchema.nullable().optional(),
  lien: urlHttps.nullable().optional(),
  avatarId: idSchema.nullable().optional(),
  aLaUne: z.boolean().optional(),
  tagIds: z.array(idSchema).max(50).optional(),
  traductions: traductionsEcriture(
    z.strictObject({ titre: texte(300), resume: texteOuNull(2000), citation: texteOuNull(600) }),
  ),
})

/** Univers (§ 9.10) : six piliers de l'accueil, chacun vers une cible interne. */
export const universSchema = z.object({
  ...contenuBaseShape,
  numero: z.string(),
  cible: cibleInterneSchema.nullable(),
  tagIds: z.array(idSchema),
  ordre: z.number().int(),
  traductions: traductionsLecture(z.object({ nom: z.string(), pitch: z.string() })),
})
export const ecritureUnivers = ecriture({
  numero: texte(10),
  cible: cibleInterneEcriture.nullable().optional(),
  tagIds: z.array(idSchema).max(50).optional(),
  traductions: traductionsEcriture(
    z.strictObject({ nom: texte(120), pitch: z.string().max(400).optional() }),
  ),
})

/** Jalons du parcours « À propos » (§ 9.11). */
export const jalonSchema = z.object({
  ...contenuBaseShape,
  periode: z.string(),
  tagIds: z.array(idSchema),
  ordre: z.number().int(),
  traductions: traductionsLecture(
    z.object({ titre: z.string(), description: z.string().nullable() }),
  ),
})
export const ecritureJalon = ecriture({
  periode: texte(40),
  tagIds: z.array(idSchema).max(50).optional(),
  traductions: traductionsEcriture(
    z.strictObject({ titre: texte(200), description: texteOuNull(4000) }),
  ),
})

/** Offres de collaboration (§ 9.12) : aucun tarif n'est stocké. */
export const offreSchema = z.object({
  ...contenuBaseShape,
  tagIds: z.array(idSchema),
  ordre: z.number().int(),
  traductions: traductionsLecture(z.object({ titre: z.string(), texte: z.string().nullable() })),
})
export const ecritureOffre = ecriture({
  tagIds: z.array(idSchema).max(50).optional(),
  traductions: traductionsEcriture(z.strictObject({ titre: texte(200), texte: texteOuNull(8000) })),
})

/** Pages fixes (§ 9.15) : ensemble fermé, une page par clé, blocs déclarés par le serveur. */
export const pageSchema = z.object({
  ...contenuBaseShape,
  cle: z.enum(CLES_PAGE),
  imageId: idSchema.nullable(),
  tagIds: z.array(idSchema),
  traductions: traductionsLecture(
    z.object({
      titre: z.string(),
      chapo: z.string().nullable(),
      seoTitre: z.string().nullable(),
      seoDescription: z.string().nullable(),
      blocs: z.record(z.string(), z.string()),
    }),
  ),
})
export const ecriturePage = ecriture({
  imageId: idSchema.nullable().optional(),
  tagIds: z.array(idSchema).max(50).optional(),
  traductions: traductionsEcriture(
    z.strictObject({
      titre: texte(200),
      chapo: texteOuNull(600),
      seoTitre: texteOuNull(70),
      seoDescription: texteOuNull(160),
      blocs: z.record(z.string().max(80), z.string().max(4000)).optional(),
    }),
  ),
})
