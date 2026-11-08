/**
 * Chargeur de données du site public (LIAISON § C.2 ; PLAN-DE-LANCEMENT S2 ; contrat 1.5.0 § 18.1).
 *
 * Lit l'API publique **au moment de la construction**, valide chaque réponse avec Zod et écrit un
 * JSON par famille dans `src/data/generated/`. Le site les lit par sa couche d'accès (`src/acces/`)
 * quand `PUBLIC_DATA_SOURCE=api` ; sinon il garde ses données de départ (`src/data/`).
 *
 *   PUBLIC_API_URL=http://127.0.0.1:3000 npm run charger
 *   PUBLIC_DATA_SOURCE=api npm run build
 *
 * Un appel en échec ou une réponse qui ne ressemble pas au contrat **arrête tout** : jamais un site
 * à moitié vide (LIAISON § C.2). Seules les adresses publiques sont appelées : aucun secret ici.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { z } from 'zod'

const API = (process.env['PUBLIC_API_URL'] ?? '').trim().replace(/\/+$/, '')
if (!API) {
  console.error('PUBLIC_API_URL manquante : l’adresse de l’API publique est requise.')
  process.exit(1)
}
const LANGUE = (process.env['PUBLIC_LANGUES'] ?? 'fr').split(',')[0]?.trim() || 'fr'
const DOSSIER = resolve('src/data/generated')

// --- Formes attendues (contrat § 18.1) : souples sur les champs propres, strictes sur l'essentiel ---

const imagePublique = z.object({
  url: z.string().min(1),
  alt: z.string(),
  largeur: z.number().nullable().optional(),
  hauteur: z.number().nullable().optional(),
  declinaisons: z.array(z.object({ largeur: z.number(), url: z.string() })),
})

/** Un contenu public : son identifiant, sa traduction dans la langue, aucun champ interne. */
const contenuPublic = z.looseObject({
  id: z.string(),
  slug: z.string().nullable().optional(),
  traduction: z.record(z.string(), z.unknown()).nullable().optional(),
  image: imagePublique.nullable().optional(),
  statut: z.never().optional(),
  champsAFournir: z.never().optional(),
})

const page = <T extends z.ZodType>(element: T) =>
  z.object({
    items: z.array(element),
    page: z.number(),
    pageSize: z.number(),
    total: z.number(),
  })

const categorie = z.object({ slug: z.string(), nom: z.string(), compte: z.number() })

const produit = z.looseObject({
  type: z.enum(['bijou', 'livre']),
  slug: z.string(),
  nom: z.string(),
  reference: z.string(),
  image: imagePublique.nullable(),
  categorie: z.object({ slug: z.string(), nom: z.string() }).nullable(),
  prixAffiche: z.number().nullable(),
  prixConfirme: z.boolean(),
  ancienPrix: z.number().nullable(),
  disponible: z.boolean(),
})
const pageProduits = z.object({
  items: z.array(produit),
  page: z.number(),
  totalPages: z.number(),
})
const ficheProduit = produit.extend({
  histoire: z.string().nullable(),
  culture: z.string().nullable(),
  galerie: z.array(imagePublique),
  variantes: z.array(
    z.object({
      libelle: z.string().nullable(),
      matiere: z.string().nullable(),
      taille: z.string().nullable(),
      prix: z.number().nullable(),
      ancienPrix: z.number().nullable(),
      disponible: z.boolean(),
    }),
  ),
  createur: z
    .object({
      slug: z.string(),
      nom: z.string(),
      pays: z.string().nullable(),
      ville: z.string().nullable(),
      bio: z.string().nullable(),
    })
    .nullable(),
})

// --- Appels ---

async function lire<T>(chemin: string, schema: z.ZodType<T>): Promise<T> {
  const adresse = `${API}/public/api/v1${chemin}`
  const reponse = await fetch(adresse)
  if (!reponse.ok) throw new Error(`${adresse} → ${reponse.status} ${reponse.statusText}`)
  const lu = schema.safeParse(await reponse.json())
  if (!lu.success) {
    throw new Error(`${adresse} : réponse hors contrat\n${z.prettifyError(lu.error)}`)
  }
  return lu.data
}

/** Toutes les pages d'une liste de contenus. */
async function toutLeContenu(type: string) {
  const items: z.infer<typeof contenuPublic>[] = []
  for (let numero = 1; ; numero += 1) {
    const lue = await lire(
      `/contenus/${type}?langue=${LANGUE}&pageSize=100&page=${numero}`,
      page(contenuPublic),
    )
    items.push(...lue.items)
    if (items.length >= lue.total || lue.items.length === 0) return items
  }
}

async function ecrire(nom: string, valeur: unknown) {
  await writeFile(resolve(DOSSIER, `${nom}.json`), `${JSON.stringify(valeur, null, 2)}\n`)
}

/** Familles lues par la couche d'accès du site (src/acces/). */
const CONTENUS = [
  'articles',
  'episodes',
  'projets',
  'destinations',
  'presse',
  'distinctions',
  'jalons',
  'partenaires',
  'offres',
] as const

async function main() {
  await mkdir(DOSSIER, { recursive: true })
  const comptes: Record<string, number> = {}

  for (const type of CONTENUS) {
    const items = await toutLeContenu(type)
    await ecrire(type, items)
    comptes[type] = items.length
  }

  for (const famille of ['article', 'projet', 'produit'] as const) {
    const liste = await lire(`/categories?famille=${famille}&langue=${LANGUE}`, z.array(categorie))
    await ecrire(`categories-${famille}`, liste)
    comptes[`categories-${famille}`] = liste.length
  }

  // Edja Shop : la liste paginée, puis la fiche de chaque produit (histoire, galerie, variantes).
  // Bijoux et livres sont paginés chacun de leur côté (B-66) : une page peut en porter plus que
  // `pageSize`, d'où le dédoublonnage par type et slug.
  const fiches = new Map<string, z.infer<typeof ficheProduit>>()
  for (let numero = 1; ; numero += 1) {
    const lue = await lire(
      `/boutique/produits?langue=${LANGUE}&pageSize=48&page=${numero}`,
      pageProduits,
    )
    for (const p of lue.items) {
      const cle = `${p.type}:${p.slug}`
      if (fiches.has(cle)) continue
      const chemin = `/boutique/produits/${encodeURIComponent(p.slug)}?type=${p.type}&langue=${LANGUE}`
      fiches.set(cle, await lire(chemin, ficheProduit))
    }
    if (numero >= lue.totalPages || lue.items.length === 0) break
  }
  await ecrire('produits', [...fiches.values()])
  comptes['produits'] = fiches.size

  await ecrire('manifeste', {
    source: API,
    langue: LANGUE,
    chargeLe: new Date().toISOString(),
    comptes,
  })
  console.log(`Données chargées depuis ${API} (${LANGUE}) :`, comptes)
}

await main()
