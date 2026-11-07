import { http } from 'msw'
import { z } from 'zod'
import {
  entreeCategorieSchema,
  modificationCategorieSchema,
  type Categorie,
} from '@/api/schemas/boutique'
import { LANGUES, type Langue } from '@/api/schemas/communs'
import { autoriser, versionPerimee } from '@/api/mocks/garde'
import { journaliser, magasin, ouvrirPublication } from '@/api/mocks/magasin'
import { elementsDeCategorie, enrichirCategorie } from '@/api/mocks/regles-boutique'
import { slugifier } from '@/api/mocks/regles'
import { API, erreur, json, lireCorps, paginer, vide } from '@/api/mocks/reponses'

/** Catégories simulées (`docs/CONTRAT-API.md` § 10.1) : ordonnables, RG-09. */

const RACINE = `${API}/categories`

function trouver(id: unknown): Categorie | undefined {
  return magasin.categories.find((c) => c.id === id)
}
const introuvable = () => erreur(404, 'NON_TROUVE', 'Cette catégorie n’existe pas.')
const tries = () => [...magasin.categories].sort((a, b) => a.ordre - b.ordre)

/** RG-04 : un slug de catégorie est unique par langue. */
function controlerSlugs(c: Categorie): Response | null {
  for (const langue of LANGUES) {
    const slug = c.traductions[langue]?.slug
    // Unique par famille et par langue (SCHEMAS § 3.2).
    const pris = (s: string) =>
      magasin.categories.some(
        (autre) =>
          autre.id !== c.id && autre.famille === c.famille && autre.traductions[langue]?.slug === s,
      )
    if (slug && pris(slug)) {
      let rang = 2
      while (pris(`${slug}-${rang}`)) rang += 1
      return erreur(422, 'RG-04', 'Cette adresse est déjà utilisée par une catégorie.', {
        champ: `traductions.${langue}.slug`,
        details: { suggestion: `${slug}-${rang}` },
      })
    }
  }
  return null
}

type Ecrite = { slug?: string | undefined; nom: string } | null | undefined

function traductions(
  existantes: Categorie['traductions'],
  ecrites: Partial<Record<Langue, Ecrite>> | undefined,
): Categorie['traductions'] {
  const resultat: Categorie['traductions'] = {}
  for (const langue of LANGUES) {
    const ecrite = ecrites?.[langue]
    if (ecrite === null) continue
    if (ecrite === undefined) {
      if (existantes[langue]) resultat[langue] = existantes[langue]
      continue
    }
    resultat[langue] = {
      slug: ecrite.slug ?? existantes[langue]?.slug ?? (slugifier(ecrite.nom) || 'categorie'),
      nom: ecrite.nom,
    }
  }
  return resultat
}

const ordreSchema = z.strictObject({ ids: z.array(z.uuid()).min(1) })

export const handlersCategories = [
  http.get(RACINE, ({ request }) => {
    const garde = autoriser(request, 'lire', 'categories')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const visible = url.searchParams.get('visible')
    const famille = url.searchParams.get('famille')
    const liste = tries()
      .filter((c) => visible === null || String(c.visible) === visible)
      .filter((c) => famille === null || c.famille === famille)
      .map(enrichirCategorie)
    const page = paginer(url, liste)
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.patch(`${RACINE}/ordre`, async ({ request }) => {
    const garde = autoriser(request, 'ordonner', 'categories')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, ordreSchema)
    if (!corps.ok) return corps.reponse
    const { ids } = corps.valeur
    // L'ordre se règle dans une famille : la liste porte toutes ses catégories, et elles seules.
    const famille = trouver(ids[0])?.famille
    const existants = new Set(
      magasin.categories.filter((c) => c.famille === famille).map((c) => c.id),
    )
    if (
      new Set(ids).size !== ids.length ||
      ids.length !== existants.size ||
      ids.some((id) => !existants.has(id))
    ) {
      return erreur(
        422,
        'VALIDATION',
        'La liste doit contenir chaque élément exactement une fois.',
        {
          champ: 'ids',
        },
      )
    }
    ids.forEach((id, rang) => {
      const c = trouver(id)
      if (c) c.ordre = rang
    })
    journaliser(garde.compte, 'ordre', 'categories', null, null, { ids })
    if (magasin.bijoux.some((b) => b.statut === 'publie')) {
      ouvrirPublication(garde.compte, 'publication', null)
    }
    return json({ ids })
  }),

  http.get(`${RACINE}/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'lire', 'categories')
    if (!garde.ok) return garde.reponse
    const c = trouver(params['id'])
    return c ? json(enrichirCategorie(c)) : introuvable()
  }),

  http.post(RACINE, async ({ request }) => {
    const garde = autoriser(request, 'creer', 'categories')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, entreeCategorieSchema)
    if (!corps.ok) return corps.reponse
    const famille = corps.valeur.famille ?? 'produit'
    const c: Categorie = {
      id: crypto.randomUUID(),
      ordre:
        Math.max(
          -1,
          ...magasin.categories.filter((x) => x.famille === famille).map((x) => x.ordre),
        ) + 1,
      famille,
      visible: corps.valeur.visible ?? true,
      nombreBijouxPublies: 0,
      traductions: traductions({}, corps.valeur.traductions),
      version: 1,
    }
    const refus = controlerSlugs(c)
    if (refus) return refus
    magasin.categories.push(c)
    journaliser(garde.compte, 'creation', 'categories', c.id, null, c)
    return json(enrichirCategorie(c), 201)
  }),

  http.patch(`${RACINE}/:id`, async ({ request, params }) => {
    const c = trouver(params['id'])
    if (!c) return introuvable()
    const garde = autoriser(request, 'modifier', 'categories')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, modificationCategorieSchema)
    if (!corps.ok) return corps.reponse
    const perimee = versionPerimee(corps.valeur.version, c.version)
    if (perimee) return perimee
    const modifiee: Categorie = {
      ...c,
      ...(corps.valeur.visible !== undefined ? { visible: corps.valeur.visible } : {}),
      traductions: traductions(c.traductions, corps.valeur.traductions),
      version: c.version + 1,
    }
    const refus = controlerSlugs(modifiee)
    if (refus) return refus
    const avant = { ...c }
    Object.assign(c, modifiee)
    journaliser(garde.compte, 'modification', 'categories', c.id, avant, c)
    const lue = enrichirCategorie(c)
    if (lue.nombreBijouxPublies > 0) {
      ouvrirPublication(garde.compte, 'publication', {
        ressource: 'categories',
        id: c.id,
        titre: c.traductions.fr?.nom ?? '',
      })
    }
    return json(lue)
  }),

  http.delete(`${RACINE}/:id`, ({ request, params }) => {
    const c = trouver(params['id'])
    if (!c) return introuvable()
    const garde = autoriser(request, 'supprimer', 'categories')
    if (!garde.ok) return garde.reponse
    const perimee = versionPerimee(
      Number(new URL(request.url).searchParams.get('version')),
      c.version,
    )
    if (perimee) return perimee
    // RG-31 : une catégorie utilisée ne se supprime pas ; on peut la masquer.
    const nombre = elementsDeCategorie(c.id)
    if (nombre > 0) {
      return erreur(
        409,
        'CATEGORIE_UTILISEE',
        `Utilisée par ${nombre} élément(s) : retirez-la d'abord, ou masquez-la.`,
        {
          details: {
            nombre,
            nombreBijoux: magasin.bijoux.filter((b) => b.categorieId === c.id).length,
          },
        },
      )
    }
    magasin.categories = magasin.categories.filter((autre) => autre.id !== c.id)
    journaliser(garde.compte, 'suppression', 'categories', c.id, c, null)
    return vide()
  }),
]
