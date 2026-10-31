import { http } from 'msw'
import type { ResumeCreateur } from '@/api/schemas/createurs'
import type { CreateurEssai } from '@/api/mocks/donnees'
import { autoriser } from '@/api/mocks/garde'
import { magasin } from '@/api/mocks/magasin'
import { API, erreur, json, paginer } from '@/api/mocks/reponses'

/**
 * Créateurs simulés, en lecture (`docs/CONTRAT-API.md` § 10.2) : ce qu'il faut aux
 * sélecteurs. La gestion des créateurs arrive avec le lot 2.
 */

const RACINE = `${API}/createurs`

function resume(createur: CreateurEssai): ResumeCreateur {
  return {
    id: createur.id,
    statut: createur.statut,
    titre: createur.nom,
    slug: createur.slug,
    publieLe: null,
    modifieLe: '2026-10-30T08:00:00.000Z',
    auteur: null,
    version: createur.version,
    champsAFournir: [],
    languesPresentes: ['fr'],
    imageId: null,
    actif: createur.actif,
  }
}

export const handlersCreateurs = [
  http.get(`${RACINE}/principal`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'createurs')
    if (!garde.ok) return garde.reponse
    const principal = magasin.createurs.find((createur) => createur.estPrincipal)
    if (!principal) return erreur(404, 'NON_TROUVE', 'Aucun créateur principal.')
    const { version: _version, ...lecture } = principal
    return json(lecture)
  }),

  http.get(RACINE, ({ request }) => {
    const garde = autoriser(request, 'lire', 'createurs')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const p = url.searchParams
    const q = p.get('q')?.toLowerCase()
    const filtres = magasin.createurs.filter((createur) => {
      if (p.get('statut') && createur.statut !== p.get('statut')) return false
      if (p.get('actif') && String(createur.actif) !== p.get('actif')) return false
      return !q || createur.nom.toLowerCase().includes(q) || createur.slug.includes(q)
    })
    const page = paginer(url, filtres.map(resume))
    return page.ok ? json(page.corps) : page.reponse
  }),
]
