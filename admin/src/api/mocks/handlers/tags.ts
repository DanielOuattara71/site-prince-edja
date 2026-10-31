import { http } from 'msw'
import { LANGUES } from '@/api/schemas/communs'
import { entreeTagSchema, modificationTagSchema, type Tag } from '@/api/schemas/tags'
import { autoriser, versionPerimee } from '@/api/mocks/garde'
import { journaliser, magasin } from '@/api/mocks/magasin'
import { usagesTag } from '@/api/mocks/regles'
import { API, erreur, json, lireCorps, paginer, trier, vide } from '@/api/mocks/reponses'

/** Tags simulés (`docs/CONTRAT-API.md` § 9.17). */

const RACINE = `${API}/tags`

function trouver(id: unknown): Tag | undefined {
  return magasin.tags.find((tag) => tag.id === id)
}

function avecUsages(tag: Tag): Tag {
  return { ...tag, usages: usagesTag(tag.id).length }
}

function introuvable() {
  return erreur(404, 'NON_TROUVE', 'Ce tag n’existe pas.')
}

function codePris(type: Tag['type'], code: string, idExclu?: string): boolean {
  return magasin.tags.some((tag) => tag.id !== idExclu && tag.type === type && tag.code === code)
}

function libelles(
  traductions: Tag['traductions'],
  ecrites: Record<string, { libelle: string } | null | undefined> | undefined,
) {
  const resultat: Tag['traductions'] = { ...traductions }
  for (const langue of LANGUES) {
    const ecrite = ecrites?.[langue]
    if (ecrite === null) delete resultat[langue]
    else if (ecrite) resultat[langue] = { libelle: ecrite.libelle }
  }
  return resultat
}

export const handlersTags = [
  http.get(RACINE, ({ request }) => {
    const garde = autoriser(request, 'lire', 'tags')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const type = url.searchParams.get('type')
    const q = url.searchParams.get('q')?.toLowerCase()
    const filtres = magasin.tags.filter((tag) => {
      if (type && tag.type !== type) return false
      const textes = [tag.code, ...LANGUES.map((l) => tag.traductions[l]?.libelle ?? '')]
      return !q || textes.some((texte) => texte.toLowerCase().includes(q))
    })
    const tries = trier(url, filtres, { code: (t) => t.code }, 'code')
    if (!tries.ok) return tries.reponse
    const page = paginer(url, tries.elements.map(avecUsages))
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.get(`${RACINE}/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'lire', 'tags')
    if (!garde.ok) return garde.reponse
    const tag = trouver(params['id'])
    return tag ? json(avecUsages(tag)) : introuvable()
  }),

  http.get(`${RACINE}/:id/usages`, ({ request, params }) => {
    const garde = autoriser(request, 'lire', 'tags')
    if (!garde.ok) return garde.reponse
    const tag = trouver(params['id'])
    return tag ? json(usagesTag(tag.id)) : introuvable()
  }),

  http.post(RACINE, async ({ request }) => {
    const garde = autoriser(request, 'creer', 'tags')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, entreeTagSchema)
    if (!corps.ok) return corps.reponse
    if (codePris(corps.valeur.type, corps.valeur.code)) {
      return erreur(422, 'RG-04', 'Ce code existe déjà pour ce type de tag.', { champ: 'code' })
    }
    const tag: Tag = {
      id: crypto.randomUUID(),
      type: corps.valeur.type,
      code: corps.valeur.code,
      traductions: libelles({}, corps.valeur.traductions),
      usages: 0,
      version: 1,
    }
    magasin.tags.push(tag)
    journaliser(garde.compte, 'creation', 'tags', tag.id, null, tag)
    return json(tag, 201)
  }),

  http.patch(`${RACINE}/:id`, async ({ request, params }) => {
    const tag = trouver(params['id'])
    if (!tag) return introuvable()
    const garde = autoriser(request, 'modifier', 'tags')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, modificationTagSchema)
    if (!corps.ok) return corps.reponse
    const perimee = versionPerimee(corps.valeur.version, tag.version)
    if (perimee) return perimee
    if (corps.valeur.code && codePris(tag.type, corps.valeur.code, tag.id)) {
      return erreur(422, 'RG-04', 'Ce code existe déjà pour ce type de tag.', { champ: 'code' })
    }
    const avant = { ...tag }
    tag.code = corps.valeur.code ?? tag.code
    tag.traductions = libelles(tag.traductions, corps.valeur.traductions)
    tag.version += 1
    journaliser(garde.compte, 'modification', 'tags', tag.id, avant, tag)
    return json(avecUsages(tag))
  }),

  http.delete(`${RACINE}/:id`, ({ request, params }) => {
    const tag = trouver(params['id'])
    if (!tag) return introuvable()
    const garde = autoriser(request, 'supprimer', 'tags')
    if (!garde.ok) return garde.reponse
    const perimee = versionPerimee(
      Number(new URL(request.url).searchParams.get('version')),
      tag.version,
    )
    if (perimee) return perimee
    const usages = usagesTag(tag.id)
    if (usages.length > 0) {
      return erreur(422, 'RG-08', 'Ce tag est utilisé : il ne peut pas être supprimé.', {
        details: { usages },
      })
    }
    magasin.tags = magasin.tags.filter((candidat) => candidat.id !== tag.id)
    journaliser(garde.compte, 'suppression', 'tags', tag.id, tag, null)
    return vide()
  }),
]
