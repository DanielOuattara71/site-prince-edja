import { http } from 'msw'
import {
  entreeArticleSchema,
  modificationArticleSchema,
  type Article,
} from '@/api/schemas/articles'
import { demandeTransitionSchema, type StatutContenu } from '@/api/schemas/communs'
import { peut } from '@/auth/permissions'
import {
  articleModifie,
  controlerSlugs,
  filtrerArticles,
  nouvelArticle,
  resumeArticle,
  sansTraduction,
} from '@/api/mocks/articles-ecriture'
import { autoriser, versionPerimee } from '@/api/mocks/garde'
import {
  horodatage,
  journaliser,
  magasin,
  maintenant,
  ouvrirPublication,
} from '@/api/mocks/magasin'
import {
  aUnTagDeFormat,
  enrichirArticle,
  exigencesArticle,
  TRANSITIONS,
  transitionsDepuis,
  type Manquant,
} from '@/api/mocks/regles'
import { API, erreur, json, lireCorps, paginer, trier, vide } from '@/api/mocks/reponses'

/** Articles simulés (`docs/CONTRAT-API.md` § 7, 8 et 9.1). */

const RACINE = `${API}/articles`

function trouver(id: unknown): Article | undefined {
  return magasin.articles.find((article) => article.id === id)
}

function introuvable() {
  return erreur(404, 'NON_TROUVE', 'Cet article n’existe pas.')
}

function titreDe(article: Article): string {
  return article.traductions.fr?.titre ?? article.traductions.en?.titre ?? ''
}

/** RG-03 et RG-06 : exigences avant une soumission ou une publication (§ 7.5). */
function manques(article: Article): Manquant[] {
  const liste = exigencesArticle(article, magasin.languesActives)
  if (!aUnTagDeFormat(article.tagIds)) {
    liste.push({ champ: 'tagIds', message: 'Au moins un tag de format est exigé (RG-06).' })
  }
  return liste
}

function refusPublication(liste: Manquant[]) {
  return erreur(422, 'RG-03', 'Des éléments manquent pour publier.', {
    ...(liste[0] ? { champ: liste[0].champ } : {}),
    details: { manquants: liste },
  })
}

export const handlersArticles = [
  http.get(RACINE, ({ request }) => {
    const garde = autoriser(request, 'lire', 'articles')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const tries = trier(url, filtrerArticles(url), {
      modifieLe: (a) => a.modifieLe,
      publieLe: (a) => a.publieLe ?? '',
      titre: (a) => titreDe(a).toLowerCase(),
    })
    if (!tries.ok) return tries.reponse
    const page = paginer(url, tries.elements.map(resumeArticle))
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.get(`${RACINE}/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'lire', 'articles')
    if (!garde.ok) return garde.reponse
    const article = trouver(params['id'])
    return article ? json(enrichirArticle(article)) : introuvable()
  }),

  http.post(RACINE, async ({ request }) => {
    const garde = autoriser(request, 'creer', 'articles')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, entreeArticleSchema)
    if (!corps.ok) return corps.reponse
    const article = nouvelArticle(corps.valeur, garde.compte.id, horodatage())
    const refus = sansTraduction(article) ?? controlerSlugs(article)
    if (refus) return refus
    magasin.articles.unshift(article)
    journaliser(garde.compte, 'creation', 'articles', article.id, null, article)
    return json(enrichirArticle(article), 201)
  }),

  http.patch(`${RACINE}/:id`, async ({ request, params }) => {
    const article = trouver(params['id'])
    if (!article) return introuvable()
    if (article.statut === 'archive') {
      return erreur(422, 'TRANSITION_INTERDITE', 'Désarchivez ce contenu avant de le modifier.', {
        details: { depuis: 'archive', vers: 'archive', autorisees: transitionsDepuis('archive') },
      })
    }
    const garde = autoriser(request, 'modifier', 'articles', { statut: article.statut }, 'RG-02')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, modificationArticleSchema)
    if (!corps.ok) return corps.reponse
    const perimee = versionPerimee(corps.valeur.version, article.version)
    if (perimee) return perimee

    const modifie = articleModifie(article, corps.valeur)
    const refus = sansTraduction(modifie) ?? controlerSlugs(modifie)
    if (refus) return refus
    // Un contenu publié reste conforme après modification (§ 7.4).
    if (article.statut === 'publie') {
      const liste = manques(modifie)
      if (liste.length) return refusPublication(liste)
    }
    Object.assign(article, modifie, { version: article.version + 1, modifieLe: horodatage() })
    journaliser(garde.compte, 'modification', 'articles', article.id, null, article)
    if (article.statut === 'publie') {
      ouvrirPublication(garde.compte, 'publication', {
        ressource: 'articles',
        id: article.id,
        titre: titreDe(article),
      })
    }
    return json(enrichirArticle(article))
  }),

  http.delete(`${RACINE}/:id`, ({ request, params }) => {
    const article = trouver(params['id'])
    if (!article) return introuvable()
    const garde = autoriser(request, 'supprimer', 'articles', { statut: article.statut })
    if (!garde.ok) return garde.reponse
    const version = Number(new URL(request.url).searchParams.get('version'))
    const perimee = versionPerimee(version, article.version)
    if (perimee) return perimee
    if (article.statut !== 'brouillon' && article.statut !== 'archive') {
      return erreur(
        422,
        'TRANSITION_INTERDITE',
        'Seul un brouillon ou un contenu archivé se supprime.',
        {
          details: {
            depuis: article.statut,
            vers: null,
            autorisees: transitionsDepuis(article.statut),
          },
        },
      )
    }
    magasin.articles = magasin.articles.filter((candidat) => candidat.id !== article.id)
    journaliser(garde.compte, 'suppression', 'articles', article.id, article, null)
    return vide()
  }),

  http.post(`${RACINE}/:id/transition`, async ({ request, params }) => {
    const article = trouver(params['id'])
    if (!article) return introuvable()
    const garde = autoriser(request, 'lire', 'articles')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, demandeTransitionSchema)
    if (!corps.ok) return corps.reponse
    const { vers, version, motif, programmeLe } = corps.valeur
    const perimee = versionPerimee(version, article.version)
    if (perimee) return perimee

    const depuis: StatutContenu = article.statut
    const regle = TRANSITIONS[depuis][vers]
    if (!regle) {
      return erreur(
        422,
        'TRANSITION_INTERDITE',
        `Passage de « ${depuis} » à « ${vers} » impossible.`,
        {
          details: { depuis, vers, autorisees: transitionsDepuis(depuis) },
        },
      )
    }
    if (regle === 'admin' && !peut(garde.compte, 'publier', 'articles')) {
      return erreur(403, 'RG-02', 'Seul un administrateur publie, refuse, dépublie ou archive.')
    }
    const refus = depuis === 'en_relecture' && vers === 'brouillon'
    if (refus && !motif) {
      return erreur(422, 'VALIDATION', 'Un refus exige un motif.', { champ: 'motif' })
    }
    if (
      programmeLe !== undefined &&
      (vers !== 'publie' || Date.parse(programmeLe) <= maintenant())
    ) {
      return erreur(
        422,
        'VALIDATION',
        'Une programmation exige une date future et une publication.',
        {
          champ: 'programmeLe',
        },
      )
    }
    if (vers === 'en_relecture' || vers === 'publie') {
      const liste = manques(article)
      if (liste.length) return refusPublication(liste)
    }

    const avant = { ...article }
    article.statut = vers
    article.version += 1
    article.modifieLe = horodatage()
    if (refus) article.dernierMotifRefus = motif ?? null
    if (vers === 'publie') article.publieLe = programmeLe ?? horodatage()
    if (depuis === 'publie') article.publieLe = vers === 'archive' ? article.publieLe : null
    journaliser(garde.compte, `transition:${vers}`, 'articles', article.id, avant, article)

    // RG-19 : une publication immédiate, une dépublication ou un archivage reconstruit le site.
    const reconstruit = (vers === 'publie' && !programmeLe) || depuis === 'publie'
    const publicationId = reconstruit
      ? ouvrirPublication(garde.compte, vers === 'publie' ? 'publication' : 'depublication', {
          ressource: 'articles',
          id: article.id,
          titre: titreDe(article),
        })
      : null
    return json({ contenu: enrichirArticle(article), publicationId })
  }),
]
