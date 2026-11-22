/**
 * Cœur du chargeur de données du site public (LIAISON § C.2 ; PLAN-DE-LANCEMENT S2 ; contrat
 * 1.5.0 § 18.1). Sans effet de bord à l'import, pour être testable (F1) : le script
 * `charger-donnees.ts` n'est plus qu'une enveloppe CLI, et le test fournit un `fetch` simulé.
 *
 * Un appel en échec ou une réponse qui ne ressemble pas au contrat **arrête tout** : jamais un
 * site à moitié vide. Seules les adresses publiques sont appelées : aucun secret ici.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { z } from 'zod'

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

/** Page complète d'un projet (contrat 1.15.0 § 32.4), déjà assemblée par l'API. */
const pageProjet = z.object({
  projet: contenuPublic,
  episodes: z.array(contenuPublic),
  destinations: z.array(contenuPublic),
  villes: z.array(contenuPublic),
  entrees: z.array(contenuPublic),
  partenaires: z.array(contenuPublic),
})

const categorie = z.object({ slug: z.string(), nom: z.string(), compte: z.number() })

const produit = z.looseObject({
  type: z.enum(['bijou', 'livre']),
  slug: z.string(),
  nom: z.string(),
  reference: z.string(),
  image: imagePublique.nullable(),
  categorie: z.object({ slug: z.string(), nom: z.string() }).nullable(),
  // Contrat 1.10.0 § 27.1 : obligatoire côté lecture publique — un build contre une API plus
  // ancienne s'arrête ici plutôt que de livrer un site incapable d'envoyer ses demandes.
  varianteIds: z.array(z.string()),
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
  // La fiche du contrat (§ 27.2) porte `variantes[].id`, pas `varianteIds` : elle ne fait
  // qu'habiller l'entrée de liste déjà collectée (`{...liste, ...fiche}`). Laisser passer
  // l'absence ici, stricte sur la liste (exigée par le contrat).
  varianteIds: z.array(z.string()).optional(),
  histoire: z.string().nullable(),
  culture: z.string().nullable(),
  galerie: z.array(imagePublique),
  variantes: z.array(
    z.object({
      id: z.string(),
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
  'villes',
  'archive',
  'univers',
  'galerie',
  'pages-legales',
] as const

const imagePubliqueJson = z.object({
  url: z.string(),
  alt: z.string(),
  largeur: z.number().nullable().optional(),
  hauteur: z.number().nullable().optional(),
  declinaisons: z.array(z.object({ largeur: z.number(), url: z.string() })),
})

/** Photos fixes du site (`GET /public/api/v1/photos-fixes`, contrat § 18, § 22.4). */
const schPhotosFixes = z.object({
  items: z.array(
    z.object({
      cle: z.string(),
      libelle: z.string(),
      formatConseille: z.string().nullable(),
      image: imagePubliqueJson.nullable(),
    }),
  ),
})

/** Réglages publics (`GET /public/api/v1/reglages`, contrat § 18). */
const schReglages = z.object({
  boutiqueEnLigne: z.boolean(),
  multiVendeurs: z.boolean(),
  languesActives: z.array(z.string()),
})

/** Identité publique et étiquettes (contrat 1.20.0 § 37). */
const schSite = z.object({
  nom: z.string(),
  email: z.string(),
  linkedin: z.string().nullable(),
  linkedinLabel: z.string().nullable(),
  localisation: z.string().nullable(),
  role: z.string().nullable(),
  signature: z.string().nullable(),
  manifeste: z.string().nullable(),
  devise: z.string().nullable(),
  mission: z.string().nullable(),
  tagline: z.array(z.string()),
  bio: z.array(z.string()),
  stats: z.array(
    z.object({
      cle: z.string(),
      libelle: z.string(),
      valeur: z.number().nullable(),
      suffixe: z.string().nullable(),
      dateValidation: z.string().nullable(),
      source: z.string().nullable(),
      ordre: z.number(),
    }),
  ),
  heroImage: imagePubliqueJson.nullable(),
})
const schEtiquettes = z.object({
  items: z.array(
    z.object({ id: z.string(), code: z.string(), type: z.string(), libelle: z.string() }),
  ),
  total: z.number(),
})

export interface ReglagesCharger {
  /** Adresse de base de l'API publique (`https://api.…`). */
  api: string
  /** Langue du site (défaut `fr`). */
  langue?: string
  /** Dossier d'écriture des JSON (`src/data/generated/` en CLI). */
  dossier: string
  /** `fetch`-compatible ; à simuler en test. */
  fetchImpl?: typeof fetch
}

export interface RapportChargement {
  source: string
  langue: string
  comptes: Record<string, number>
  chargeLe: string
}

export async function chargerDepuisApi(reglages: ReglagesCharger): Promise<RapportChargement> {
  const API = reglages.api.trim().replace(/\/+$/, '')
  const LANGUE = reglages.langue ?? 'fr'
  const DOSSIER = reglages.dossier
  const appelle = reglages.fetchImpl ?? fetch

  async function lire<T>(chemin: string, schema: z.ZodType<T>): Promise<T> {
    const adresse = `${API}/public/api/v1${chemin}`
    const reponse = await appelle(adresse)
    if (!reponse.ok) {
      throw new Error(`${adresse} → ${reponse.status} ${reponse.statusText}`)
    }
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

  await mkdir(DOSSIER, { recursive: true })
  const comptes: Record<string, number> = {}
  let projetsCharges: z.infer<typeof contenuPublic>[] = []

  for (const type of CONTENUS) {
    const items: z.infer<typeof contenuPublic>[] = await toutLeContenu(type)
    if (type === 'articles') {
      // § 18.1 : la liste ne porte pas le corps, seule la fiche le contient. On habille
      // chaque entrée avec sa fiche, comme pour les produits, pour que le site puisse
      // rendre le texte des articles publiés.
      for (let i = 0; i < items.length; i += 1) {
        const slug = items[i]?.slug
        if (!slug) continue
        const fiche = await lire(
          `/contenus/articles/${encodeURIComponent(slug)}?langue=${LANGUE}`,
          contenuPublic.partial({ id: true }),
        )
        items[i] = { ...items[i], ...fiche }
      }
    }
    await writeFile(resolve(DOSSIER, `${type}.json`), `${JSON.stringify(items, null, 2)}\n`)
    comptes[type] = items.length
    if (type === 'projets') projetsCharges = items
  }

  // Contrat 1.15.0 § 32.4 : une page par projet, avec ses contenus déjà filtrés.
  const pagesProjets: Record<string, z.infer<typeof pageProjet>> = {}
  for (const projet of projetsCharges) {
    if (!projet.slug) continue
    pagesProjets[projet.slug] = await lire(
      `/projets/${encodeURIComponent(projet.slug)}/page?langue=${LANGUE}`,
      pageProjet,
    )
  }
  await writeFile(
    resolve(DOSSIER, 'pages-projets.json'),
    `${JSON.stringify(pagesProjets, null, 2)}\n`,
  )
  comptes['pages-projets'] = Object.keys(pagesProjets).length

  // Contrat 1.16.0 § 33.4 : une entrée par emplacement de galerie (accueil, boutique).
  const galeries: Record<string, unknown> = {}
  for (const emplacement of ['accueil', 'boutique'] as const) {
    galeries[emplacement] = await lire(
      `/galeries?emplacement=${emplacement}&langue=${LANGUE}`,
      page(contenuPublic),
    )
  }
  await writeFile(resolve(DOSSIER, 'galeries.json'), `${JSON.stringify(galeries, null, 2)}\n`)
  comptes['galeries'] = Object.keys(galeries).length

  for (const famille of ['article', 'projet', 'produit'] as const) {
    const liste = await lire(`/categories?famille=${famille}&langue=${LANGUE}`, z.array(categorie))
    await writeFile(
      resolve(DOSSIER, `categories-${famille}.json`),
      `${JSON.stringify(liste, null, 2)}\n`,
    )
    comptes[`categories-${famille}`] = liste.length
  }

  // Edja Shop : la liste paginée, puis la fiche de chaque produit (histoire, galerie, variantes).
  // Bijoux et livres sont paginés chacun de leur côté (B-66) : une page peut en porter plus que
  // `pageSize`, d'où le dédoublonnage par type et slug — retenu pour compatibilité ascendante.
  // Depuis C1 (B-67, UNION), la liste est globale : le dédoublonnage ne coûte rien et protège
  // si l'ancienne forme réapparaît (repli).
  const fiches = new Map<string, z.infer<typeof ficheProduit>>()
  const listes = new Map<string, z.infer<typeof produit>>()
  for (let numero = 1; ; numero += 1) {
    const lue = await lire(
      `/boutique/produits?langue=${LANGUE}&pageSize=48&page=${numero}`,
      pageProduits,
    )
    for (const p of lue.items) {
      const cle = `${p.type}:${p.slug}`
      if (listes.has(cle)) continue
      listes.set(cle, p)
      const chemin = `/boutique/produits/${encodeURIComponent(p.slug)}?type=${p.type}&langue=${LANGUE}`
      fiches.set(cle, await lire(chemin, ficheProduit))
    }
    if (numero >= lue.totalPages || lue.items.length === 0) break
  }
  await writeFile(
    resolve(DOSSIER, 'produits.json'),
    `${JSON.stringify(
      [...fiches.entries()].map(([cle, fiche]) => ({
        // L'entrée de liste porte `varianteIds` (contrat 1.10.0 § 27.1) ; la fiche l'habille
        // (§ 27.2 : `variantes[].id`). Les champs communs restent cohérents (même API, même instant).
        ...listes.get(cle),
        ...fiche,
      })),
      null,
      2,
    )}\n`,
  )
  comptes['produits'] = fiches.size

  const photosFixees = await lire('/photos-fixes', schPhotosFixes)
  await writeFile(
    resolve(DOSSIER, 'photos-fixes.json'),
    `${JSON.stringify(photosFixees.items, null, 2)}\n`,
  )
  comptes['photos-fixes'] = photosFixees.items.length

  const regle = await lire('/reglages', schReglages)
  await writeFile(resolve(DOSSIER, 'reglages.json'), `${JSON.stringify(regle, null, 2)}\n`)
  comptes['reglages'] = Object.keys(regle).length

  const identite = await lire(`/site?langue=${LANGUE}`, schSite)
  await writeFile(resolve(DOSSIER, 'site.json'), `${JSON.stringify(identite, null, 2)}\n`)
  comptes['site'] = 1

  const etiquettes = await lire(`/etiquettes?langue=${LANGUE}`, schEtiquettes)
  await writeFile(
    resolve(DOSSIER, 'etiquettes.json'),
    `${JSON.stringify(etiquettes.items, null, 2)}\n`,
  )
  comptes['etiquettes'] = etiquettes.items.length

  const rapport: RapportChargement = {
    source: API,
    langue: LANGUE,
    comptes,
    chargeLe: new Date().toISOString(),
  }
  await writeFile(resolve(DOSSIER, 'manifeste.json'), `${JSON.stringify(rapport, null, 2)}\n`)
  return rapport
}
