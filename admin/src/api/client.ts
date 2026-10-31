import type { z } from 'zod'
import { CODES_CLIENT, ErreurApi } from '@/api/erreurs'
import { erreurApiSchema } from '@/api/schemas/communs'

/**
 * Le seul endroit qui appelle `fetch` (section 12 du prompt admin).
 *
 * - `credentials: 'include'` : la session est un cookie `HttpOnly` que le client ne lit
 *   jamais (D-07, D-15).
 * - Le jeton anti-CSRF vit **en mémoire** (D-09, D-16) et part sur toute écriture.
 * - `403 CSRF_INVALIDE` : on rafraîchit la session puis on rejoue **une seule fois**.
 * - Toute réponse est validée par son schéma : une réponse hors contrat devient une
 *   `ErreurApi` explicite, jamais une donnée corrompue dans un écran (D-14).
 */

const BASE_API = import.meta.env.VITE_API_URL ?? '/admin/api/v1'

type Methode = 'GET' | 'POST' | 'PATCH' | 'DELETE'
type ValeurQuery = string | number | boolean | string[] | undefined

let jetonCsrf: string | null = null
let rafraichirSession: (() => Promise<void>) | null = null

/** Posé par la session après chaque `GET /auth/moi`, effacé à la déconnexion. */
export function definirJetonCsrf(jeton: string | null): void {
  jetonCsrf = jeton
}

/** La session s'enregistre ici pour être rappelée sur un `403 CSRF_INVALIDE`. */
export function surCsrfInvalide(rafraichir: (() => Promise<void>) | null): void {
  rafraichirSession = rafraichir
}

/** Adresse absolue : `fetch` ne résout pas une adresse relative hors du navigateur. */
export function urlApi(chemin: string, query?: Record<string, ValeurQuery>): URL {
  const origine = typeof window === 'undefined' ? 'http://localhost' : window.location.origin
  const url = new URL(`${BASE_API.replace(/\/$/, '')}${chemin}`, origine)
  for (const [cle, valeur] of Object.entries(query ?? {})) {
    if (valeur === undefined) continue
    for (const element of Array.isArray(valeur) ? valeur : [valeur]) {
      url.searchParams.append(cle, String(element))
    }
  }
  return url
}

export interface OptionsRequete<T> {
  methode?: Methode
  query?: Record<string, ValeurQuery>
  /** Corps JSON, déjà validé par le schéma d'écriture de l'appelant. */
  corps?: unknown
  /** Corps `multipart/form-data` (envoi de média). */
  formulaire?: FormData
  /** Schéma de la réponse. Absent = réponse vide attendue (`204`). */
  schema?: z.ZodType<T>
  signal?: AbortSignal
}

export async function requete<T = undefined>(
  chemin: string,
  options: OptionsRequete<T> = {},
): Promise<T> {
  const reponse = await envoyer(chemin, options, false)
  if (reponse.status === 204 || !options.schema) return undefined as T

  const requeteId = reponse.headers.get('X-Request-Id') ?? undefined
  const corps: unknown = await reponse.json().catch(() => undefined)
  const lu = options.schema.safeParse(corps)
  if (!lu.success) {
    throw new ErreurApi({
      status: reponse.status,
      code: CODES_CLIENT.reponseInvalide,
      message: 'Le serveur a renvoyé une réponse inattendue.',
      details: lu.error.issues,
      requeteId,
    })
  }
  return lu.data
}

/** Réponse texte (exports CSV). */
export async function requeteTexte(
  chemin: string,
  options: Omit<OptionsRequete<never>, 'schema'> = {},
): Promise<string> {
  const reponse = await envoyer(chemin, options, false)
  return reponse.text()
}

async function envoyer<T>(
  chemin: string,
  options: OptionsRequete<T>,
  dejaRejouee: boolean,
): Promise<Response> {
  const methode = options.methode ?? 'GET'
  const entetes = new Headers({ Accept: 'application/json' })
  if (options.corps !== undefined) entetes.set('Content-Type', 'application/json')
  if (methode !== 'GET' && jetonCsrf) entetes.set('X-CSRF-Token', jetonCsrf)

  let reponse: Response
  try {
    reponse = await fetch(urlApi(chemin, options.query), {
      method: methode,
      headers: entetes,
      credentials: 'include',
      body:
        options.formulaire ?? (options.corps === undefined ? null : JSON.stringify(options.corps)),
      signal: options.signal ?? null,
    })
  } catch (cause) {
    throw new ErreurApi({
      status: 0,
      code: CODES_CLIENT.reseau,
      message: 'Le serveur est injoignable. Vérifiez la connexion puis réessayez.',
      details: cause,
    })
  }

  if (reponse.ok) return reponse

  const erreur = await lireErreur(reponse)
  if (erreur.code === 'CSRF_INVALIDE' && !dejaRejouee && rafraichirSession) {
    await rafraichirSession()
    return envoyer(chemin, options, true)
  }
  throw erreur
}

async function lireErreur(reponse: Response): Promise<ErreurApi> {
  const requeteId = reponse.headers.get('X-Request-Id') ?? undefined
  const corps: unknown = await reponse.json().catch(() => undefined)
  const lu = erreurApiSchema.safeParse(corps)
  if (lu.success) {
    return new ErreurApi({ ...lu.data, requeteId: lu.data.requeteId })
  }
  return new ErreurApi({
    status: reponse.status,
    code: reponse.status >= 500 ? 'ERREUR_INTERNE' : CODES_CLIENT.reponseInvalide,
    message: 'Une erreur inattendue est survenue.',
    requeteId,
  })
}
