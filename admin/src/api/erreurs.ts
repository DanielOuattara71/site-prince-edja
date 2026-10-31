import { manquantsSchema, usageSchema, type Usage } from '@/api/schemas/communs'
import { z } from 'zod'

/**
 * Erreur renvoyée par l'API (`docs/CONTRAT-API.md` § 4), ou produite par le client quand
 * la réponse est inutilisable. Les écrans ne lisent que ce type : jamais une `Response`.
 */
export class ErreurApi extends Error {
  readonly status: number
  readonly code: string
  readonly champ: string | undefined
  readonly details: unknown
  readonly requeteId: string | undefined

  constructor(init: {
    status: number
    code: string
    message: string
    champ?: string | undefined
    details?: unknown
    requeteId?: string | undefined
  }) {
    super(init.message)
    this.name = 'ErreurApi'
    this.status = init.status
    this.code = init.code
    this.champ = init.champ
    this.details = init.details
    this.requeteId = init.requeteId
  }
}

/** Codes produits par le client lui-même, absents du contrat. */
export const CODES_CLIENT = {
  /** Réseau injoignable ou requête annulée. */
  reseau: 'RESEAU_INDISPONIBLE',
  /** Réponse qui ne respecte pas le contrat : une anomalie du serveur, à signaler. */
  reponseInvalide: 'REPONSE_INVALIDE',
} as const

export function estErreurApi(erreur: unknown): erreur is ErreurApi {
  return erreur instanceof ErreurApi
}

/** Vrai si l'erreur est la règle ou le code demandé (`RG-03`, `VERSION_PERIMEE`…). */
export function aLeCode(erreur: unknown, code: string): erreur is ErreurApi {
  return estErreurApi(erreur) && erreur.code === code
}

/** Champs manquants d'un `422 RG-03`, pour la liste cliquable du formulaire. */
export function manquantsDe(erreur: ErreurApi): z.infer<typeof manquantsSchema>['manquants'] {
  const lu = manquantsSchema.safeParse(erreur.details)
  return lu.success ? lu.data.manquants : []
}

/** Usages d'un `422 RG-08`, pour `PanneauUsages`. */
export function usagesDe(erreur: ErreurApi): Usage[] {
  const lu = z.object({ usages: z.array(usageSchema) }).safeParse(erreur.details)
  return lu.success ? lu.data.usages : []
}

/** Erreurs de champ d'un `422 VALIDATION`. */
export function erreursDeChamp(erreur: ErreurApi): { champ: string; message: string }[] {
  const lu = z
    .object({ erreurs: z.array(z.object({ champ: z.string(), message: z.string() })) })
    .safeParse(erreur.details)
  if (lu.success) return lu.data.erreurs
  return erreur.champ ? [{ champ: erreur.champ, message: erreur.message }] : []
}
