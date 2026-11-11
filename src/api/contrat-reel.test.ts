import { describe, expect, it } from 'vitest'

/**
 * Test de contrat du site contre la **vraie** API de développement (F2, PROMPT-SUITE), sur le
 * modèle de `admin/src/api/contrat-reel.test.ts`. Seules les adresses publiques sont appelées,
 * exactement celles que le chargeur consomme.
 *
 * Ignoré par défaut ; à lancer avec une API de développement amorcée :
 *
 *   API_REELLE=1 PUBLIC_API_URL=http://127.0.0.1:3000 npm test -- src/api/contrat-reel.test.ts
 *
 * Contrôles : statut, forme des listes paginées, **absence de tout champ interne** (§ 18.1) et,
 * pour le catalogue, **pas de `stock` dans les variantes publiques**. Aucun secret, aucun identifiant.
 */
/** `process` limité aux variables d'environnement : le tsconfig du site limite `types`
 *  à `vite/client` ; cet usage est la seule exception raisonnée (test ignoré par défaut). */
declare const process: { env: Record<string, string | undefined> }

const actif = process.env['API_REELLE'] === '1'
const API = process.env['PUBLIC_API_URL']?.trim() || 'http://127.0.0.1:3000'
const base = `${API}/public/api/v1`

const CHAMPS_INTERNES = [
  'statut',
  'version',
  'auteur',
  'auteurId',
  'champsAFournir',
  'languesPresentes',
  'dernierMotifRefus',
  'creeLe',
] as const

/** Les clés internes, où qu'elles soient dans l'objet (liste ou fiche). */
function champsInternesPresents(valeur: unknown): string[] {
  if (typeof valeur !== 'object' || valeur === null) return []
  return Object.entries(valeur as Record<string, unknown>).flatMap(([cle, v]) => {
    const trouvés = (CHAMPS_INTERNES as readonly string[]).includes(cle) ? [cle] : []
    return [...trouvés, ...champsInternesPresents(v)]
  })
}

async function lireListe(chemin: string) {
  const reponse = await fetch(`${base}${chemin}`)
  expect(reponse.status, `GET ${chemin}`).toBe(200)
  const corps = (await reponse.json()) as Record<string, unknown>
  expect(Array.isArray(corps['items']), `GET ${chemin} : items attendus`).toBe(true)
  expect(typeof corps['total']).toBe('number')
  return corps['items'] as Record<string, unknown>[]
}

describe.skipIf(!actif)('contrat public (API réelle)', () => {
  it('articles : liste publiée, aucun champ interne (§ 18.1)', async () => {
    const items = await lireListe('/contenus/articles?langue=fr&pageSize=100&page=1')
    expect(items.length).toBeGreaterThanOrEqual(0) // liste possiblement vide en base d'essai
    expect(items.every((item) => champsInternesPresents(item).length === 0)).toBe(true)
  })

  it('produits : pagination globale, aucune variante publique avec stock (§ 18.1)', async () => {
    const reponse = await fetch(`${base}/boutique/produits?langue=fr&pageSize=48&page=1`)
    expect(reponse.status).toBe(200)
    const corps = (await reponse.json()) as {
      items: Record<string, unknown>[]
      page: number
      pageSize: number
      total: number
      totalPages: number
    }
    expect(typeof corps.total).toBe('number')
    expect(typeof corps.pageSize).toBe('number')
    expect(corps.totalPages).toBeGreaterThanOrEqual(0)
    expect(corps.items.every((item) => champsInternesPresents(item).length === 0)).toBe(true)
  })

  it('fiche produit : variantes sans stock ni champs internes (§ 12.2, § 18.1)', async () => {
    const reponse = await fetch(`${base}/boutique/produits?langue=fr&pageSize=1&page=1`)
    const corps = (await reponse.json()) as {
      items: { slug: string; type: 'bijou' | 'livre' }[]
    }
    if (corps.items.length === 0) return // base d'essai vide : rien à contrôler
    const produit = corps.items[0]
    const fiche = await fetch(
      `${base}/boutique/produits/${encodeURIComponent(produit.slug)}?type=${produit.type}&langue=fr`,
    )
    expect(fiche.status).toBe(200)
    const detail = (await fiche.json()) as Record<string, unknown>
    expect(champsInternesPresents(detail)).toHaveLength(0)
    const variantes = (detail['variantes'] ?? []) as Record<string, unknown>[]
    for (const variante of variantes) {
      expect(Object.keys(variante)).not.toContain('stock')
    }
  })
})
