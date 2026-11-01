import { http } from 'msw'
import {
  entreeCreateurSchema,
  modificationCreateurSchema,
  type ResumeCreateur,
} from '@/api/schemas/createurs'
import { LANGUES, type Langue } from '@/api/schemas/communs'
import type { CreateurEssai } from '@/api/mocks/donnees'
import {
  refusArchive,
  refusPublication,
  refusSuppression,
  transitionSimulee,
} from '@/api/mocks/cycle'
import { autoriser, versionPerimee } from '@/api/mocks/garde'
import {
  horodatage,
  journaliser,
  magasin,
  ouvrirPublication,
  resumeCompte,
} from '@/api/mocks/magasin'
import { enrichirCreateur, exigencesCreateur } from '@/api/mocks/regles-boutique'
import { slugifier } from '@/api/mocks/regles'
import { API, erreur, json, lireCorps, paginer, trier, vide } from '@/api/mocks/reponses'

/**
 * Créateurs simulés (`docs/CONTRAT-API.md` § 10.2, X-05) : principal protégé (RG-21),
 * suppression refusée avec des bijoux (RG-27), adresse figée après publication (`SLUG_FIGE`),
 * mode multi-vendeurs (`MULTI_VENDEURS_INACTIF`).
 */

const RACINE = `${API}/createurs`

function trouver(id: unknown): CreateurEssai | undefined {
  return magasin.createurs.find((c) => c.id === id)
}
const introuvable = () => erreur(404, 'NON_TROUVE', 'Ce créateur n’existe pas.')
const multiInactif = (champ: string) =>
  erreur(422, 'MULTI_VENDEURS_INACTIF', 'Le mode multi-vendeurs est désactivé.', { champ })
const principalProtege = (message: string) => erreur(422, 'RG-21', message)

function resume(c: CreateurEssai): ResumeCreateur {
  const lu = enrichirCreateur(c)
  return {
    id: c.id,
    statut: c.statut,
    titre: c.nom,
    slug: c.slug,
    publieLe: c.publieLe,
    modifieLe: c.modifieLe,
    auteur: resumeCompte(c.auteurId),
    version: c.version,
    champsAFournir: lu.champsAFournir,
    languesPresentes: lu.languesPresentes,
    imageId: c.photoId,
    actif: c.actif,
    estPrincipal: c.estPrincipal,
    nombreBijoux: lu.nombreBijoux,
  }
}

function slugPris(slug: string, id: string): Response | null {
  const pris = (s: string) => magasin.createurs.some((c) => c.id !== id && c.slug === s)
  if (!pris(slug)) return null
  let rang = 2
  while (pris(`${slug}-${rang}`)) rang += 1
  return erreur(422, 'RG-04', 'Cette adresse est déjà utilisée par un autre créateur.', {
    champ: 'slug',
    details: { suggestion: `${slug}-${rang}` },
  })
}

type Ecrite = { bio?: string | undefined; accroche?: string | null | undefined } | null | undefined

function traductions(
  existantes: CreateurEssai['traductions'],
  ecrites: Partial<Record<Langue, Ecrite>> | undefined,
): CreateurEssai['traductions'] {
  const resultat: CreateurEssai['traductions'] = {}
  for (const langue of LANGUES) {
    const ecrite = ecrites?.[langue]
    if (ecrite === null) continue
    if (ecrite === undefined) {
      if (existantes[langue]) resultat[langue] = existantes[langue]
      continue
    }
    resultat[langue] = { bio: ecrite.bio ?? '', accroche: ecrite.accroche ?? null }
  }
  return resultat
}

/** RG-27 : désactiver dépublie les bijoux publiés du créateur, chacun journalisé. */
function depublierBijoux(createurId: string, compte: Parameters<typeof journaliser>[0]): number {
  let nombre = 0
  for (const b of magasin.bijoux) {
    if (b.createurId !== createurId || b.statut !== 'publie') continue
    const avant = structuredClone(b)
    b.statut = 'brouillon'
    b.publieLe = null
    b.version += 1
    b.modifieLe = horodatage()
    journaliser(compte, 'depublication:createur-inactif', 'bijoux', b.id, avant, b)
    nombre += 1
  }
  return nombre
}

export const handlersCreateurs = [
  http.get(`${RACINE}/principal`, ({ request }) => {
    const garde = autoriser(request, 'lire', 'createurs')
    if (!garde.ok) return garde.reponse
    const principal = magasin.createurs.find((c) => c.estPrincipal)
    if (!principal) return erreur(404, 'NON_TROUVE', 'Aucun créateur principal.')
    return json(enrichirCreateur(principal))
  }),

  http.get(RACINE, ({ request }) => {
    const garde = autoriser(request, 'lire', 'createurs')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const p = url.searchParams
    const q = p.get('q')?.toLowerCase()
    const filtres = magasin.createurs.filter((c) => {
      if (p.get('statut') && c.statut !== p.get('statut')) return false
      if (p.get('actif') && String(c.actif) !== p.get('actif')) return false
      if (p.get('aFournir') === 'true' && enrichirCreateur(c).champsAFournir.length === 0) {
        return false
      }
      return !q || c.nom.toLowerCase().includes(q) || c.slug.includes(q)
    })
    const ordonnes = trier(url, filtres, {
      modifieLe: (c) => c.modifieLe,
      nom: (c) => c.nom.toLowerCase(),
    })
    if (!ordonnes.ok) return ordonnes.reponse
    const page = paginer(url, ordonnes.elements.map(resume))
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.get(`${RACINE}/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'lire', 'createurs')
    if (!garde.ok) return garde.reponse
    const c = trouver(params['id'])
    return c ? json(enrichirCreateur(c)) : introuvable()
  }),

  http.post(RACINE, async ({ request }) => {
    const garde = autoriser(request, 'creer', 'createurs')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, entreeCreateurSchema)
    if (!corps.ok) return corps.reponse
    const entree = corps.valeur
    if (entree.tauxCommission != null && !magasin.multiVendeurs)
      return multiInactif('tauxCommission')
    if (entree.actif === true && !magasin.multiVendeurs) return multiInactif('actif')
    const maintenant = horodatage()
    const c: CreateurEssai = {
      id: crypto.randomUUID(),
      statut: 'brouillon',
      publieLe: null,
      creeLe: maintenant,
      modifieLe: maintenant,
      auteurId: garde.compte.id,
      version: 1,
      champsAFournir: [],
      languesPresentes: [],
      dernierMotifRefus: null,
      slug: entree.slug ?? (slugifier(entree.nom) || 'createur'),
      nom: entree.nom,
      pays: entree.pays ?? null,
      ville: entree.ville ?? null,
      photoId: entree.photoId ?? null,
      estPrincipal: false,
      actif: entree.actif ?? magasin.multiVendeurs,
      tauxCommission: entree.tauxCommission ?? null,
      nombreBijoux: 0,
      traductions: traductions({}, entree.traductions),
      premierePublicationLe: null,
    }
    const refus = slugPris(c.slug, c.id)
    if (refus) return refus
    magasin.createurs.unshift(c)
    journaliser(garde.compte, 'creation', 'createurs', c.id, null, enrichirCreateur(c))
    return json(enrichirCreateur(c), 201)
  }),

  http.patch(`${RACINE}/:id`, async ({ request, params }) => {
    const c = trouver(params['id'])
    if (!c) return introuvable()
    const archive = refusArchive(c)
    if (archive) return archive
    const garde = autoriser(request, 'modifier', 'createurs', { statut: c.statut }, 'RG-02')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, modificationCreateurSchema)
    if (!corps.ok) return corps.reponse
    const m = corps.valeur
    const perimee = versionPerimee(m.version, c.version)
    if (perimee) return perimee
    if (m.slug !== undefined && m.slug !== c.slug && c.premierePublicationLe) {
      return erreur(422, 'SLUG_FIGE', 'L’adresse d’un créateur déjà publié ne change plus.', {
        champ: 'slug',
      })
    }
    if (m.tauxCommission != null && !magasin.multiVendeurs) return multiInactif('tauxCommission')
    if (m.actif === false && c.estPrincipal) {
      return principalProtege('Le créateur principal ne peut pas être désactivé.')
    }
    if (m.actif === true && !c.estPrincipal && !magasin.multiVendeurs) return multiInactif('actif')
    const { version: _version, traductions: ecrites, ...champs } = m
    const definis = Object.fromEntries(
      Object.entries(champs).filter(([, valeur]) => valeur !== undefined),
    )
    const modifie: CreateurEssai = {
      ...c,
      ...definis,
      traductions: traductions(c.traductions, ecrites),
    }
    const refusSlug = slugPris(modifie.slug, c.id)
    if (refusSlug) return refusSlug
    if (c.statut === 'publie') {
      const liste = exigencesCreateur(modifie)
      if (liste.length) return refusPublication(liste)
    }
    const desactive = c.actif && !modifie.actif
    const avant = enrichirCreateur(c)
    Object.assign(c, modifie, { version: c.version + 1, modifieLe: horodatage() })
    const depublies = desactive ? depublierBijoux(c.id, garde.compte) : 0
    journaliser(
      garde.compte,
      desactive ? 'desactivation' : 'modification',
      'createurs',
      c.id,
      avant,
      enrichirCreateur(c),
    )
    if (depublies > 0 || c.statut === 'publie') {
      ouvrirPublication(garde.compte, depublies > 0 ? 'depublication' : 'publication', {
        ressource: 'createurs',
        id: c.id,
        titre: c.nom,
      })
    }
    return json(enrichirCreateur(c))
  }),

  http.delete(`${RACINE}/:id`, ({ request, params }) => {
    const c = trouver(params['id'])
    if (!c) return introuvable()
    const garde = autoriser(request, 'supprimer', 'createurs', { statut: c.statut })
    if (!garde.ok) return garde.reponse
    const perimee = versionPerimee(
      Number(new URL(request.url).searchParams.get('version')),
      c.version,
    )
    if (perimee) return perimee
    if (c.estPrincipal) return principalProtege('Le créateur principal ne se supprime pas.')
    const nombre = magasin.bijoux.filter((b) => b.createurId === c.id).length
    if (nombre > 0) {
      return erreur(
        422,
        'RG-27',
        'Ce créateur a des bijoux : désactivez-le plutôt que de le supprimer.',
        { details: { nombreBijoux: nombre } },
      )
    }
    const statut = refusSuppression(c)
    if (statut) return statut
    magasin.createurs = magasin.createurs.filter((autre) => autre.id !== c.id)
    journaliser(garde.compte, 'suppression', 'createurs', c.id, enrichirCreateur(c), null)
    return vide()
  }),

  http.post(`${RACINE}/:id/transition`, ({ request, params }) => {
    const c = trouver(params['id'])
    if (!c) return introuvable()
    const garde = autoriser(request, 'lire', 'createurs')
    if (!garde.ok) return garde.reponse
    return transitionSimulee({
      requete: request,
      compte: garde.compte,
      ressource: 'createurs',
      objet: c,
      titre: () => c.nom,
      manques: () => exigencesCreateur(c),
      controler: (vers) =>
        c.estPrincipal && vers === 'archive'
          ? principalProtege('Le créateur principal ne s’archive pas.')
          : null,
      // SLUG_FIGE : l'adresse est figée dès la première publication, même programmée.
      apres: (vers) => {
        if (vers === 'publie' && !c.premierePublicationLe) c.premierePublicationLe = horodatage()
      },
      lecture: enrichirCreateur,
    })
  }),
]
