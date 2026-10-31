import { http } from 'msw'
import { autoriser } from '@/api/mocks/garde'
import {
  avancementPublication,
  magasin,
  ouvrirPublication,
  resumeCompte,
} from '@/api/mocks/magasin'
import { enrichirArticle } from '@/api/mocks/regles'
import { API, erreur, json, paginer } from '@/api/mocks/reponses'

/** Publication du site, journal et tableau de bord simulés (`docs/CONTRAT-API.md` § 14 à 16). */

export const handlersSite = [
  http.post(`${API}/site/reconstruire`, ({ request }) => {
    const garde = autoriser(request, 'reconstruire', 'site')
    if (!garde.ok) return garde.reponse
    const id = ouvrirPublication(garde.compte, 'manuelle', null)
    const publication = magasin.publications.find((candidate) => candidate.id === id)
    return json(publication, 202)
  }),

  http.get(`${API}/site/etat-reconstruction`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'site')
    if (!garde.ok) return garde.reponse
    const derniere = magasin.publications[0]
    return json(derniere ? avancementPublication(derniere) : null)
  }),

  http.get(`${API}/site/publications`, ({ request }) => {
    const garde = autoriser(request, 'reconstruire', 'site')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const etat = url.searchParams.get('etat')
    const liste = magasin.publications
      .map(avancementPublication)
      .filter((publication) => !etat || publication.etat === etat)
    const page = paginer(url, liste)
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.get(`${API}/site/publications/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'lire', 'site')
    if (!garde.ok) return garde.reponse
    const publication = magasin.publications.find((candidate) => candidate.id === params['id'])
    return publication
      ? json(avancementPublication(publication))
      : erreur(404, 'NON_TROUVE', 'Cette publication n’existe pas.')
  }),

  http.get(`${API}/journal`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'journal')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const p = url.searchParams
    const liste = magasin.journal.filter((entree) => {
      if (p.get('compte') && entree.compte?.id !== p.get('compte')) return false
      if (p.get('action') && entree.action !== p.get('action')) return false
      if (p.get('entite') && entree.entite !== p.get('entite')) return false
      if (p.get('entiteId') && entree.entiteId !== p.get('entiteId')) return false
      return true
    })
    const page = paginer(url, liste)
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.get(`${API}/journal/export`, ({ request }) => {
    const garde = autoriser(request, 'exporter', 'journal')
    if (!garde.ok) return garde.reponse
    const lignes = magasin.journal.map((entree) =>
      [
        entree.creeLe,
        entree.compte?.nom ?? 'système',
        entree.action,
        entree.entite,
        entree.entiteId ?? '',
      ]
        .map((valeur) => `"${String(valeur).replace(/"/g, '""')}"`)
        .join(';'),
    )
    return new Response(['creeLe;compte;action;entite;entiteId', ...lignes].join('\n'), {
      headers: { 'Content-Type': 'text/csv; charset=utf-8', 'X-Request-Id': crypto.randomUUID() },
    })
  }),

  http.get(`${API}/tableau-de-bord`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'tableau-de-bord')
    if (!garde.ok) return garde.reponse
    const articles = magasin.articles.map(enrichirArticle)
    const derniere = magasin.publications[0]
    return json({
      aRelire: articles.filter((article) => article.statut === 'en_relecture').length,
      brouillons: articles.filter((article) => article.statut === 'brouillon').length,
      aFournir: articles.filter((article) => article.champsAFournir.length > 0).length,
      messagesNonLus: 0,
      demandesNouvelles: 0,
      derniereReconstruction: derniere ? avancementPublication(derniere) : null,
      dernieresModifications: [...articles]
        .sort((a, b) => b.modifieLe.localeCompare(a.modifieLe))
        .slice(0, 10)
        .map((article) => ({
          ressource: 'articles',
          id: article.id,
          titre: article.traductions.fr?.titre ?? article.traductions.en?.titre ?? '',
          modifieLe: article.modifieLe,
          auteur: resumeCompte(article.auteurId),
          statut: article.statut,
        })),
    })
  }),
]
