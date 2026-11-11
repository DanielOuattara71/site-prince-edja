import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { mkdtempSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { chargerDepuisApi } from './charger-donnees.core'

/**
 * F1 (PROMPT-SUITE) : le chargeur contre un `fetch` simulé — pagination, dédoublonnage des
 * produits entre pages, échec sur une réponse hors contrat. Aucune requête réelle.
 */

const article = (n: number) => ({ id: `article-${n}`, slug: `article-${n}`, traduction: {} })

interface ProduitSimule {
  type: 'bijou' | 'livre'
  slug: string
  nom: string
  reference: string
  image: null
  categorie: null
  prixAffiche: number | null
  prixConfirme: boolean
  ancienPrix: number | null
  disponible: boolean
}

const produitBijou: ProduitSimule = {
  type: 'bijou',
  slug: 'pendentif-a',
  nom: 'Exemple : pendentif',
  reference: 'REF-A',
  image: null,
  categorie: null,
  prixAffiche: null,
  prixConfirme: false,
  ancienPrix: null,
  disponible: true,
}
const produitLivre: ProduitSimule = {
  ...produitBijou,
  type: 'livre',
  slug: 'livre-b',
  reference: 'REF-L',
}

const ficheDe = (p: ProduitSimule) => ({
  ...p,
  histoire: null,
  culture: null,
  galerie: [],
  variantes: [],
  createur: null,
})

const reponseJson = (payload: unknown, status = 200) =>
  ({
    ok: status >= 200 && status < 300,
    status,
    statusText: `HTTP ${status}`,
    json: async () => payload,
  }) as unknown as Response

let dossier = ''

beforeEach(() => {
  dossier = mkdtempSync(join(tmpdir(), 'charger-test-'))
})

afterEach(() => {
  rmSync(dossier, { recursive: true, force: true })
})

/** Un `fetch` simulé qui route sur l'URL. `compteur` répond aux familles ; boutique en deux pages. */
function fetchSimule(appels: string[]) {
  return async (entree: RequestInfo | URL): Promise<Response> => {
    const url = new URL(String(entree))
    appels.push(url.pathname + url.search)
    const chemin = url.pathname
    const page = Number(url.searchParams.get('page') ?? '1')

    if (chemin.startsWith('/public/api/v1/contenus/articles')) {
      const items = page === 1 ? [article(1)] : [article(2)]
      return reponseJson({ items, page, pageSize: 100, total: 2 })
    }
    if (chemin.startsWith('/public/api/v1/contenus/')) {
      return reponseJson({ items: [], page, pageSize: 100, total: 0 })
    }
    if (chemin.startsWith('/public/api/v1/categories')) return reponseJson([])
    if (chemin === '/public/api/v1/boutique/produits') {
      // Page 2 répète le bijou de la page 1 (cas B-66 avant UNION) : le chargeur dédouble.
      const items = page === 1 ? [produitBijou, produitLivre] : [produitBijou]
      return reponseJson({ items, page, pageSize: 48, total: 2, totalPages: 2 })
    }
    if (chemin.startsWith('/public/api/v1/boutique/produits/pendentif-a')) {
      return reponseJson(ficheDe(produitBijou))
    }
    if (chemin.startsWith('/public/api/v1/boutique/produits/livre-b')) {
      return reponseJson(ficheDe(produitLivre))
    }
    throw new Error(`Appel inattendu : ${url}`)
  }
}

function lireGenerated<T>(nom: string): T {
  return JSON.parse(readFileSync(join(dossier, `${nom}.json`), 'utf8')) as T
}

describe('chargeur de données (F1)', () => {
  it('pagine les contenus : toutes les pages sont lues', async () => {
    const appels: string[] = []
    const rapport = await chargerDepuisApi({
      api: 'http://api-simulée.test',
      dossier,
      fetchImpl: fetchSimule(appels) as unknown as typeof fetch,
    })
    expect(rapport.comptes['articles']).toBe(2)
    expect(lireGenerated<{ id: string }[]>('articles').map((a) => a.id)).toEqual([
      'article-1',
      'article-2',
    ])
    expect(appels.filter((u) => u.includes('contenus/articles'))).toHaveLength(2)
    expect(lireGenerated<{ chargeLe: string }>('manifeste').chargeLe).toBeTruthy()
  })

  it('dédouble les produits entre pages : une fiche par type et slug', async () => {
    const appels: string[] = []
    const rapport = await chargerDepuisApi({
      api: 'http://api-simulée.test',
      dossier,
      fetchImpl: fetchSimule(appels) as unknown as typeof fetch,
    })
    expect(rapport.comptes['produits']).toBe(2)
    expect(lireGenerated<unknown[]>('produits')).toHaveLength(2)
    const appelsFiche = appels.filter((u) => u.includes('boutique/produits/pendentif-a?'))
    expect(appelsFiche).toHaveLength(1)
  })

  it('refuse une réponse hors contrat', async () => {
    const horsContrat = async () =>
      reponseJson({ items: [{ id: 123, traduction: {} }], page: 1, pageSize: 100, total: 1 })
    await expect(
      chargerDepuisApi({
        api: 'http://api-simulée.test',
        dossier,
        fetchImpl: horsContrat as unknown as typeof fetch,
      }),
    ).rejects.toThrow(/hors contrat/)
  })
})
