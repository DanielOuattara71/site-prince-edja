import { http } from 'msw'
import type { Article } from '@/api/schemas/articles'
import {
  demandeRestaurationSchema,
  ressourceVersionneeSchema,
  type EntreeVersion,
} from '@/api/schemas/versions'
import { autoriser, versionPerimee } from '@/api/mocks/garde'
import { horodatage, journaliser, magasin, ouvrirPublication } from '@/api/mocks/magasin'
import { enrichirArticle } from '@/api/mocks/regles'
import { API, erreur, json, lireCorps } from '@/api/mocks/reponses'

/**
 * Versions et restauration simulées (`docs/CONTRAT-API.md` § 14.2). Les instantanés sont
 * pris par `journaliser` à chaque écriture. Seuls les articles se restaurent ici : les
 * autres ressources versionnées arrivent avec leur lot.
 */

/** Champs que la restauration ne touche pas : identité, cycle de vie, champs calculés. */
const NON_RESTAURES = new Set([
  'id',
  'statut',
  'publieLe',
  'creeLe',
  'modifieLe',
  'auteurId',
  'version',
  'champsAFournir',
  'languesPresentes',
  'dernierMotifRefus',
])

function versionsDe(ressource: string, id: string) {
  return magasin.versions.filter((v) => v.ressource === ressource && v.id === id)
}

function introuvable() {
  return erreur(404, 'NON_TROUVE', 'Aucune version pour ce contenu.')
}

export const handlersVersions = [
  http.get(`${API}/versions/:ressource/:id`, ({ request, params }) => {
    const ressource = ressourceVersionneeSchema.safeParse(params['ressource'])
    if (!ressource.success) return introuvable()
    const garde = autoriser(request, 'lire', ressource.data)
    if (!garde.ok) return garde.reponse
    const liste = versionsDe(ressource.data, String(params['id']))
    if (liste.length === 0) return introuvable()
    return json(
      liste
        .map(({ version, creeLe, creePar, action }): EntreeVersion => ({
          version,
          creeLe,
          creePar,
          action,
        }))
        .sort((a, b) => b.version - a.version),
    )
  }),

  http.get(`${API}/versions/:ressource/:id/:version`, ({ request, params }) => {
    const ressource = ressourceVersionneeSchema.safeParse(params['ressource'])
    if (!ressource.success) return introuvable()
    const garde = autoriser(request, 'lire', ressource.data)
    if (!garde.ok) return garde.reponse
    const trouvee = versionsDe(ressource.data, String(params['id'])).find(
      (v) => v.version === Number(params['version']),
    )
    return trouvee
      ? json({ version: trouvee.version, instantane: trouvee.instantane })
      : introuvable()
  }),

  http.post(`${API}/restauration`, async ({ request }) => {
    const corps = await lireCorps(request, demandeRestaurationSchema)
    if (!corps.ok) return corps.reponse
    const { ressource, id, version, versionCourante } = corps.valeur
    const garde = autoriser(request, 'restaurer', ressource)
    if (!garde.ok) return garde.reponse
    if (ressource !== 'articles') return introuvable()

    const article = magasin.articles.find((candidat) => candidat.id === id)
    const instantane = versionsDe(ressource, id).find((v) => v.version === version)?.instantane
    if (!article || !instantane) return introuvable()
    const perimee = versionPerimee(versionCourante, article.version)
    if (perimee) return perimee

    const avant = structuredClone(article)
    for (const [cle, valeur] of Object.entries(instantane as Article)) {
      if (!NON_RESTAURES.has(cle)) Object.assign(article, { [cle]: structuredClone(valeur) })
    }
    article.version += 1
    article.modifieLe = horodatage()
    journaliser(garde.compte, 'restauration', 'articles', article.id, avant, article)
    if (article.statut === 'publie') {
      ouvrirPublication(garde.compte, 'restauration', {
        ressource: 'articles',
        id: article.id,
        titre: article.traductions.fr?.titre ?? '',
      })
    }
    return json(enrichirArticle(article))
  }),
]
