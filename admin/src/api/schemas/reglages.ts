import { z } from 'zod'
import {
  cibleInterneEcriture,
  cibleInterneSchema,
  datePartielleSchema,
  idSchema,
  langueSchema,
  traductionsLecture,
  versionSchema,
} from '@/api/schemas/communs'

/**
 * Réglages du site (contrat § 13) : ressources sans cycle de vie, lecture puis PATCH avec
 * `version`. Toute modification reconstruit le site (motif `reglage`) et est journalisée.
 * Lecture tolérante, écriture stricte (D-22).
 */

const texteStatique = z.string().trim().min(1).max(120)
const texteOuNull = (max: number) => z.string().trim().min(1).max(max).nullable().optional()

/** Libellé à deux langues du document de navigation, obligatoire en français. */
const libelleNavEcriture = z.strictObject({
  fr: z.string().trim().min(1).max(120),
  en: z.string().trim().max(120).optional(),
})

// --- `audience` : chiffres par plateforme (§ 13.2) ---

export const chiffreAudienceSchema = z.object({
  id: idSchema,
  plateforme: z.string(),
  taille: z.number().int().nullable(),
  portee: z.number().int().nullable(),
  dateValidation: datePartielleSchema.nullable(),
  source: z.string().nullable(),
  ordre: z.number().int(),
  version: versionSchema,
})
export type ChiffreAudience = z.infer<typeof chiffreAudienceSchema>

export const entreeChiffreSchema = z.strictObject({
  plateforme: texteStatique,
  taille: z.number().int().min(0).nullable().optional(),
  portee: z.number().int().min(0).nullable().optional(),
  dateValidation: datePartielleSchema.nullable().optional(),
  source: z.string().trim().max(300).nullable().optional(),
})
export type EntreeChiffre = z.infer<typeof entreeChiffreSchema>

export const modificationChiffreSchema = z.strictObject({
  plateforme: texteStatique.optional(),
  taille: z.number().int().min(0).nullable().optional(),
  portee: z.number().int().min(0).nullable().optional(),
  dateValidation: datePartielleSchema.nullable().optional(),
  source: z.string().trim().max(300).nullable().optional(),
  version: versionSchema,
})
export type ModificationChiffre = z.infer<typeof modificationChiffreSchema>

// --- `parametres` (§ 13.3) ---

export const parametresSchema = z.object({
  languesActives: z.array(langueSchema).min(1),
  destinataires: z.object({
    contact: z.array(z.string()),
    collaboration: z.array(z.string()),
    demandes: z.array(z.string()),
  }),
  conservationMessagesMois: z.number().int(),
  purgeAbonnesNonConfirmesJours: z.number().int(),
  regroupementPublicationSecondes: z.number().int(),
  boutiqueEnLigne: z.boolean(),
  multiVendeurs: z.boolean(),
  version: versionSchema,
})
export type Parametres = z.infer<typeof parametresSchema>

/**
 * Champs modifiables (§ 13.3). Chaque champ porte son « qui modifie » ; le faux serveur et le
 * vrai refusent au rôle un champ qui n'est pas le sien (`403 DROIT_INSUFFISANT`). Les interrupteurs
 * exigent `confirmationEmail` : l'adresse du compte qui agit, retapée.
 */
export const modificationParametresSchema = z.strictObject({
  languesActives: z.array(langueSchema).min(1).optional(),
  destinataires: z
    .strictObject({
      contact: z.array(z.email()).max(10),
      collaboration: z.array(z.email()).max(10),
      demandes: z.array(z.email()).max(10),
    })
    .optional(),
  conservationMessagesMois: z.number().int().min(1).max(120).optional(),
  purgeAbonnesNonConfirmesJours: z.number().int().min(1).max(90).optional(),
  regroupementPublicationSecondes: z.number().int().min(0).max(3600).optional(),
  boutiqueEnLigne: z.boolean().optional(),
  multiVendeurs: z.boolean().optional(),
  confirmationEmail: z.email().optional(),
  version: versionSchema,
})
export type ModificationParametres = z.infer<typeof modificationParametresSchema>

// --- `navigation` (§ 13.4) : document remplacé en entier à chaque PATCH, un niveau d'enfants ---

/** Identifiant d'entrée : écrit par l'écran, jamais inventé par le serveur. */
const idNavEcriture = z.string().trim().min(1).max(60)

const entreeNavEcriture = z.strictObject({
  id: idNavEcriture,
  libelle: libelleNavEcriture,
  degre: libelleNavEcriture.nullable().optional(),
  cible: cibleInterneEcriture,
  /** Un seul niveau d'enfants (§ 13.4) : chaque entrée enfant n'en a pas. */
  enfants: z
    .array(
      z.strictObject({
        id: idNavEcriture,
        libelle: libelleNavEcriture,
        degre: libelleNavEcriture.nullable().optional(),
        cible: cibleInterneEcriture,
      }),
    )
    .max(12)
    .optional(),
})
export type EntreeNavigationEcriture = z.infer<typeof entreeNavEcriture>

export interface EntreeNavigation {
  id: string
  libelle: { fr: string; en?: string | undefined }
  /** Absent du document écrit, donc optionnel à la lecture (tolérance § 13.4). */
  degre?: { fr: string; en?: string | undefined } | null | undefined
  cible: z.infer<typeof cibleInterneSchema>
  /** Un seul niveau d'enfants (§ 13.4) : une entrée enfant n'a jamais les siens. */
  enfants?: EntreeNavigation[] | undefined
}

const entreeNavLecture: z.ZodType<EntreeNavigation, EntreeNavigation> = z.lazy(() =>
  z.object({
    id: z.string(),
    libelle: z.object({ fr: z.string(), en: z.string().optional() }),
    degre: z.object({ fr: z.string(), en: z.string().optional() }).nullable().optional(),
    cible: cibleInterneSchema,
    enfants: z.array(z.lazy(() => entreeNavLecture)).optional(),
  }),
)
export type EntreeNavigationLue = z.output<typeof entreeNavLecture>

export const navigationSchema = z.object({
  principale: z.array(entreeNavLecture),
  ctaPrincipal: z.object({
    libelle: z.object({ fr: z.string(), en: z.string().optional() }),
    cible: cibleInterneSchema,
  }),
  piedDePage: z.array(
    z.object({
      titre: z.object({ fr: z.string(), en: z.string().optional() }),
      liens: z.array(entreeNavLecture),
    }),
  ),
  entrees404: z.array(entreeNavLecture),
  version: versionSchema,
})
export type Navigation = z.infer<typeof navigationSchema>

export const modificationNavigationSchema = z.strictObject({
  principale: z.array(entreeNavEcriture).max(8),
  ctaPrincipal: z.strictObject({ libelle: libelleNavEcriture, cible: cibleInterneEcriture }),
  piedDePage: z
    .array(
      z.strictObject({
        titre: libelleNavEcriture,
        liens: z.array(entreeNavEcriture).max(12),
      }),
    )
    .max(8),
  entrees404: z.array(entreeNavEcriture).max(6),
  version: versionSchema,
})
export type ModificationNavigation = z.infer<typeof modificationNavigationSchema>

// --- `textes-interface` (§ 13.5) : dictionnaire du site, clés fixées par les données de départ ---

const traductionTexte = z.object({ fr: z.string(), en: z.string().optional() })

export const textesInterfaceSchema = z.object({
  valeurs: z.record(z.string(), traductionTexte),
  clesManquantes: z.strictObject({ fr: z.array(z.string()), en: z.array(z.string()) }),
  version: versionSchema,
})
export type TextesInterface = z.infer<typeof textesInterfaceSchema>

export const modificationTextesInterfaceSchema = z.strictObject({
  valeurs: z.record(
    z.string(),
    z.strictObject({
      fr: z.string().max(500).optional(),
      en: z.string().max(500).optional(),
    }),
  ),
  version: versionSchema,
})
export type ModificationTextesInterface = z.infer<typeof modificationTextesInterfaceSchema>

// --- `motifs-contact` (§ 13.6) : ordonnables, sans cycle de vie, titre obligatoire en FR ---

export const motifContactSchema = z.object({
  id: idSchema,
  ordre: z.number().int(),
  traductions: traductionsLecture(
    z.object({ titre: z.string(), description: z.string().nullable() }),
  ),
  version: versionSchema,
})
export type MotifContact = z.infer<typeof motifContactSchema>

export const entreeMotifSchema = z.strictObject({
  traductions: z.strictObject({
    fr: z.strictObject({
      titre: z.string().trim().min(1).max(120),
      description: texteOuNull(600),
    }),
    en: z
      .strictObject({
        titre: z.string().trim().max(120).optional(),
        description: texteOuNull(600),
      })
      .optional(),
  }),
})
export type EntreeMotif = z.infer<typeof entreeMotifSchema>

export const modificationMotifSchema = z.strictObject({
  traductions: z
    .strictObject({
      fr: z
        .strictObject({
          titre: z.string().trim().min(1).max(120).optional(),
          description: texteOuNull(600),
        })
        .optional(),
      en: z
        .strictObject({
          titre: z.string().trim().max(120).optional(),
          description: texteOuNull(600),
        })
        .nullable()
        .optional(),
    })
    .optional(),
  version: versionSchema,
})
export type ModificationMotif = z.infer<typeof modificationMotifSchema>
