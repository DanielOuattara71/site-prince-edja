import type { z } from 'zod'

/**
 * Réponses du faux serveur, à la forme exacte du contrat (`docs/CONTRAT-API.md` § 2 et 4) :
 * en-tête `X-Request-Id`, corps d'erreur `{ status, code, message, champ?, details?, requeteId }`.
 */

/** Préfixe des routes simulées. `*` accepte n'importe quelle origine (navigateur ou tests). */
export const API = '*/admin/api/v1'

function nouvelIdRequete(): string {
  return `req-${crypto.randomUUID()}`
}

function reponseJson(corps: unknown, status: number, entetes: Record<string, string>): Response {
  return new Response(JSON.stringify(corps), {
    status,
    headers: { 'Content-Type': 'application/json', ...entetes },
  })
}

export function json(corps: unknown, status = 200): Response {
  return reponseJson(corps, status, { 'X-Request-Id': nouvelIdRequete() })
}

export function vide(): Response {
  return new Response(null, { status: 204, headers: { 'X-Request-Id': nouvelIdRequete() } })
}

export interface OptionsErreur {
  champ?: string
  details?: unknown
  entetes?: Record<string, string>
}

export function erreur(
  status: number,
  code: string,
  message: string,
  options: OptionsErreur = {},
): Response {
  const requeteId = nouvelIdRequete()
  return reponseJson(
    {
      status,
      code,
      message,
      ...(options.champ ? { champ: options.champ } : {}),
      ...(options.details !== undefined ? { details: options.details } : {}),
      requeteId,
    },
    status,
    { 'X-Request-Id': requeteId, ...options.entetes },
  )
}

/**
 * Lit et valide un corps JSON avec le schéma d'écriture strict. Un champ inconnu ou
 * invalide produit `422 VALIDATION` avec la liste des champs (§ 4.2), comme le serveur.
 */
export async function lireCorps<T>(
  requete: Request,
  schema: z.ZodType<T>,
): Promise<{ ok: true; valeur: T } | { ok: false; reponse: Response }> {
  const brut: unknown = await requete.json().catch(() => undefined)
  const lu = schema.safeParse(brut)
  if (lu.success) return { ok: true, valeur: lu.data }
  const erreurs = lu.error.issues.map((issue) => ({
    champ: issue.path.join('.') || '(corps)',
    message: issue.message,
  }))
  return {
    ok: false,
    reponse: erreur(422, 'VALIDATION', 'Certaines valeurs sont invalides.', {
      ...(erreurs[0] ? { champ: erreurs[0].champ } : {}),
      details: { erreurs },
    }),
  }
}

/** Lecture des paramètres de liste et pagination réelle (§ 2). */
export function paginer<T>(
  url: URL,
  elements: T[],
):
  | { ok: true; corps: { items: T[]; page: number; pageSize: number; total: number } }
  | {
      ok: false
      reponse: Response
    } {
  const page = Number(url.searchParams.get('page') ?? '1')
  const pageSize = Number(url.searchParams.get('pageSize') ?? '20')
  if (
    !Number.isInteger(page) ||
    page < 1 ||
    !Number.isInteger(pageSize) ||
    pageSize < 1 ||
    pageSize > 100
  ) {
    return {
      ok: false,
      reponse: erreur(422, 'VALIDATION', '`page` ≥ 1 et `pageSize` entre 1 et 100.', {
        champ: 'pageSize',
      }),
    }
  }
  const debut = (page - 1) * pageSize
  return {
    ok: true,
    corps: {
      items: elements.slice(debut, debut + pageSize),
      page,
      pageSize,
      total: elements.length,
    },
  }
}

/** Tri `?tri=champ` ou `?tri=-champ` sur des champs autorisés. */
export function trier<T>(
  url: URL,
  elements: T[],
  autorises: Record<string, (element: T) => string | number>,
  defaut = '-modifieLe',
): { ok: true; elements: T[] } | { ok: false; reponse: Response } {
  const tri = url.searchParams.get('tri') ?? defaut
  const descendant = tri.startsWith('-')
  const cle = autorises[descendant ? tri.slice(1) : tri]
  if (!cle) {
    return {
      ok: false,
      reponse: erreur(422, 'VALIDATION', `Tri non autorisé : ${tri}.`, { champ: 'tri' }),
    }
  }
  const tries = [...elements].sort((a, b) => {
    const [va, vb] = [cle(a), cle(b)]
    const ordre = va < vb ? -1 : va > vb ? 1 : 0
    return descendant ? -ordre : ordre
  })
  return { ok: true, elements: tries }
}
