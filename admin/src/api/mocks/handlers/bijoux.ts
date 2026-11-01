import { http } from 'msw'
import { z } from 'zod'
import {
  entreeBijouSchema,
  entreeVarianteSchema,
  modificationBijouSchema,
  modificationVarianteSchema,
  type Bijou,
  type ResumeBijou,
  type Variante,
} from '@/api/schemas/boutique'
import { LANGUES, type Compte, type Langue } from '@/api/schemas/communs'
import { peut } from '@/auth/permissions'
import { ID_CREATEUR_PRINCIPAL } from '@/api/mocks/donnees'
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
import {
  enrichirBijou,
  exigencesBijou,
  manquesVenteEnLigne,
  nomBijou,
} from '@/api/mocks/regles-boutique'
import { slugifier } from '@/api/mocks/regles'
import { API, erreur, json, lireCorps, paginer, trier, vide } from '@/api/mocks/reponses'

/**
 * Bijoux et variantes simulés (`docs/CONTRAT-API.md` § 10.3, A-02) : au moins une variante
 * (RG-10), `prixConfirme` réservé aux admins, créateur actif (RG-20), variante citée par une
 * demande protégée (RG-11), vente en ligne (prix et stock exigés).
 */

const RACINE = `${API}/bijoux`

function trouver(id: unknown): Bijou | undefined {
  return magasin.bijoux.find((b) => b.id === id)
}
const introuvable = () => erreur(404, 'NON_TROUVE', 'Ce bijou n’existe pas.')
const varianteIntrouvable = () => erreur(404, 'NON_TROUVE', 'Cette variante n’existe pas.')
const rg10Prix = () =>
  erreur(422, 'RG-10', 'Confirmer le prix exige au moins une variante avec un prix.', {
    champ: 'prixConfirme',
  })

function resume(b: Bijou): ResumeBijou {
  const lu = enrichirBijou(b)
  return {
    id: b.id,
    statut: b.statut,
    titre: nomBijou(b),
    slug: b.traductions.fr?.slug ?? b.traductions.en?.slug ?? null,
    publieLe: b.publieLe,
    modifieLe: b.modifieLe,
    auteur: resumeCompte(b.auteurId),
    version: b.version,
    champsAFournir: lu.champsAFournir,
    languesPresentes: lu.languesPresentes,
    imageId: b.imageId,
    createurId: b.createurId,
    numero: b.numero,
    categorieId: b.categorieId,
    visible: b.visible,
    prixConfirme: b.prixConfirme,
    nombreVariantes: b.variantes.length,
  }
}

/** RG-20 : le créateur existe et est actif. */
function refusCreateur(id: string): Response | null {
  const c = magasin.createurs.find((candidat) => candidat.id === id)
  if (!c) return erreur(422, 'VALIDATION', 'Ce créateur n’existe pas.', { champ: 'createurId' })
  if (!c.actif) {
    return erreur(422, 'RG-20', 'Ce créateur est inactif : aucun bijou ne lui est rattaché.', {
      champ: 'createurId',
    })
  }
  return null
}

/** Catégorie existante, numéro unique, slugs uniques (RG-04). */
function controler(b: Bijou): Response | null {
  if (!b.traductions.fr && !b.traductions.en) {
    return erreur(422, 'VALIDATION', 'Un bijou garde au moins une traduction.', {
      champ: 'traductions',
    })
  }
  if (!magasin.categories.some((c) => c.id === b.categorieId)) {
    return erreur(422, 'VALIDATION', 'Cette catégorie n’existe pas.', { champ: 'categorieId' })
  }
  if (magasin.bijoux.some((autre) => autre.id !== b.id && autre.numero === b.numero)) {
    return erreur(422, 'RG-04', 'Ce numéro est déjà celui d’un autre bijou.', { champ: 'numero' })
  }
  for (const langue of LANGUES) {
    const slug = b.traductions[langue]?.slug
    const pris = (s: string) =>
      magasin.bijoux.some((autre) => autre.id !== b.id && autre.traductions[langue]?.slug === s)
    if (slug && pris(slug)) {
      let rang = 2
      while (pris(`${slug}-${rang}`)) rang += 1
      return erreur(422, 'RG-04', 'Cette adresse est déjà utilisée par un autre bijou.', {
        champ: `traductions.${langue}.slug`,
        details: { suggestion: `${slug}-${rang}` },
      })
    }
  }
  return null
}

function refusAncienPrix(v: Pick<Variante, 'prix' | 'ancienPrix'>, champ: string) {
  return v.ancienPrix !== null && (v.prix === null || v.ancienPrix <= v.prix)
    ? erreur(
        422,
        'VALIDATION',
        'L’ancien prix exige un prix renseigné, et doit lui être supérieur.',
        {
          champ,
        },
      )
    : null
}

function referenceLibre(numero: string, rang: number, reservees: Set<string>): string {
  const prises = new Set([
    ...magasin.bijoux.flatMap((b) => b.variantes.map((v) => v.reference)),
    ...reservees,
  ])
  let n = rang
  while (prises.has(`${numero}-${n}`)) n += 1
  return `${numero}-${n}`
}
const referencePrise = (reference: string, idExclu: string | null) =>
  magasin.bijoux.some((b) => b.variantes.some((v) => v.id !== idExclu && v.reference === reference))

type Ecrite =
  | {
      slug?: string | undefined
      nom: string
      culture?: string | null | undefined
      histoire?: string | undefined
    }
  | null
  | undefined

function traductions(
  existantes: Bijou['traductions'],
  ecrites: Partial<Record<Langue, Ecrite>> | undefined,
): Bijou['traductions'] {
  const resultat: Bijou['traductions'] = {}
  for (const langue of LANGUES) {
    const ecrite = ecrites?.[langue]
    if (ecrite === null) continue
    if (ecrite === undefined) {
      if (existantes[langue]) resultat[langue] = existantes[langue]
      continue
    }
    resultat[langue] = {
      slug: ecrite.slug ?? existantes[langue]?.slug ?? (slugifier(ecrite.nom) || 'bijou'),
      nom: ecrite.nom,
      culture: ecrite.culture ?? null,
      histoire: ecrite.histoire ?? '',
    }
  }
  return resultat
}

/** Écriture d'une variante : bijou modifiable, revérifié et reconstruit s'il est publié. */
function surVariantes(
  requete: Request,
  bijouId: unknown,
  operation: (b: Bijou, compte: Compte) => Promise<Response> | Response,
): Promise<Response> | Response {
  const b = trouver(bijouId)
  if (!b) return introuvable()
  const archive = refusArchive(b)
  if (archive) return archive
  const garde = autoriser(requete, 'modifier', 'bijoux', { statut: b.statut }, 'RG-02')
  if (!garde.ok) return garde.reponse
  const sauvegarde = structuredClone(b.variantes)
  const terminer = (reponse: Response) => {
    if (!reponse.ok) return reponse
    if (b.statut === 'publie') {
      const manques = [...exigencesBijou(b), ...manquesVenteEnLigne(b)]
      if (manques.length) {
        b.variantes = sauvegarde
        return refusPublication(manques)
      }
      ouvrirPublication(garde.compte, 'publication', {
        ressource: 'bijoux',
        id: b.id,
        titre: nomBijou(b),
      })
    }
    b.modifieLe = horodatage()
    return reponse
  }
  const reponse = operation(b, garde.compte)
  return reponse instanceof Promise ? reponse.then(terminer) : terminer(reponse)
}

const ordreSchema = z.strictObject({ ids: z.array(z.uuid()).min(1) })

export const handlersBijoux = [
  http.get(RACINE, ({ request }) => {
    const garde = autoriser(request, 'lire', 'bijoux')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const p = url.searchParams
    const q = p.get('q')?.toLowerCase()
    const filtres = magasin.bijoux.filter((b) => {
      if (p.get('statut') && b.statut !== p.get('statut')) return false
      if (p.get('categorie') && b.categorieId !== p.get('categorie')) return false
      if (p.get('createur') && b.createurId !== p.get('createur')) return false
      if (p.get('visible') && String(b.visible) !== p.get('visible')) return false
      if (p.get('prixConfirme') && String(b.prixConfirme) !== p.get('prixConfirme')) return false
      const langue = p.get('langue') as Langue | null
      const sans = p.get('sansLangue') as Langue | null
      if (langue && !b.traductions[langue]) return false
      if (sans && b.traductions[sans]) return false
      if (p.getAll('tag').some((tag) => !b.tagIds.includes(tag))) return false
      if (p.get('aFournir') === 'true' && enrichirBijou(b).champsAFournir.length === 0) return false
      return !q || b.numero.includes(q) || nomBijou(b).toLowerCase().includes(q)
    })
    const ordonnes = trier(url, filtres, { modifieLe: (b) => b.modifieLe, numero: (b) => b.numero })
    if (!ordonnes.ok) return ordonnes.reponse
    const page = paginer(url, ordonnes.elements.map(resume))
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.get(`${RACINE}/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'lire', 'bijoux')
    if (!garde.ok) return garde.reponse
    const b = trouver(params['id'])
    return b ? json(enrichirBijou(b)) : introuvable()
  }),

  http.post(RACINE, async ({ request }) => {
    const garde = autoriser(request, 'creer', 'bijoux')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, entreeBijouSchema)
    if (!corps.ok) return corps.reponse
    const e = corps.valeur
    if (e.prixConfirme !== undefined && !peut(garde.compte, 'confirmer_prix', 'bijoux')) {
      return erreur(403, 'DROIT_INSUFFISANT', 'Seul un administrateur confirme un prix.')
    }
    const createurId = e.createurId ?? ID_CREATEUR_PRINCIPAL
    const refusC = refusCreateur(createurId)
    if (refusC) return refusC
    const maintenant = horodatage()
    const saisies = e.variantes?.length ? e.variantes : [{}]
    const reservees = new Set<string>()
    const variantes: Variante[] = []
    for (const [i, v] of saisies.entries()) {
      if (v.reference && (reservees.has(v.reference) || referencePrise(v.reference, null))) {
        return erreur(422, 'RG-04', 'Cette référence est déjà utilisée.', {
          champ: `variantes.${i}.reference`,
        })
      }
      const reference = v.reference ?? referenceLibre(e.numero, i + 1, reservees)
      reservees.add(reference)
      const variante: Variante = {
        id: crypto.randomUUID(),
        reference,
        matiere: v.matiere ?? null,
        taille: v.taille ?? null,
        prix: v.prix ?? null,
        ancienPrix: v.ancienPrix ?? null,
        stock: v.stock ?? null,
        disponible: v.disponible ?? true,
        ordre: v.ordre ?? i,
        version: 1,
      }
      const refusPrix = refusAncienPrix(variante, `variantes.${i}.ancienPrix`)
      if (refusPrix) return refusPrix
      variantes.push(variante)
    }
    const b: Bijou = {
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
      numero: e.numero,
      categorieId: e.categorieId,
      createurId,
      imageId: e.imageId ?? null,
      galerieMediaIds: e.galerieMediaIds ?? [],
      tagIds: e.tagIds ?? [],
      visible: e.visible ?? true,
      prixConfirme: e.prixConfirme ?? false,
      edition: e.edition ?? null,
      atelier: e.atelier ?? null,
      village: e.village ?? null,
      poids: e.poids ?? null,
      variantes,
      matieres: [],
      tailles: [],
      traductions: traductions({}, e.traductions),
    }
    if (b.prixConfirme && !variantes.some((v) => v.prix !== null)) return rg10Prix()
    const refus = controler(b)
    if (refus) return refus
    magasin.bijoux.unshift(b)
    journaliser(garde.compte, 'creation', 'bijoux', b.id, null, enrichirBijou(b))
    return json(enrichirBijou(b), 201)
  }),

  http.patch(`${RACINE}/:id`, async ({ request, params }) => {
    const b = trouver(params['id'])
    if (!b) return introuvable()
    const archive = refusArchive(b)
    if (archive) return archive
    const garde = autoriser(request, 'modifier', 'bijoux', { statut: b.statut }, 'RG-02')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, modificationBijouSchema)
    if (!corps.ok) return corps.reponse
    const m = corps.valeur
    const perimee = versionPerimee(m.version, b.version)
    if (perimee) return perimee
    if (m.prixConfirme !== undefined && !peut(garde.compte, 'confirmer_prix', 'bijoux')) {
      return erreur(403, 'DROIT_INSUFFISANT', 'Seul un administrateur confirme un prix.', {
        champ: 'prixConfirme',
      })
    }
    if (m.createurId !== undefined && m.createurId !== b.createurId) {
      const refusC = refusCreateur(m.createurId)
      if (refusC) return refusC
    }
    const { version: _version, traductions: ecrites, ...champs } = m
    const definis = Object.fromEntries(
      Object.entries(champs).filter(([, valeur]) => valeur !== undefined),
    )
    const modifie: Bijou = { ...b, ...definis, traductions: traductions(b.traductions, ecrites) }
    if (m.prixConfirme === true && !modifie.variantes.some((v) => v.prix !== null))
      return rg10Prix()
    const refus = controler(modifie)
    if (refus) return refus
    if (b.statut === 'publie') {
      const liste = exigencesBijou(modifie)
      if (liste.length) return refusPublication(liste)
    }
    const avant = enrichirBijou(b)
    Object.assign(b, modifie, { version: b.version + 1, modifieLe: horodatage() })
    journaliser(garde.compte, 'modification', 'bijoux', b.id, avant, enrichirBijou(b))
    if (b.statut === 'publie') {
      ouvrirPublication(garde.compte, 'publication', {
        ressource: 'bijoux',
        id: b.id,
        titre: nomBijou(b),
      })
    }
    return json(enrichirBijou(b))
  }),

  http.delete(`${RACINE}/:id`, ({ request, params }) => {
    const b = trouver(params['id'])
    if (!b) return introuvable()
    const garde = autoriser(request, 'supprimer', 'bijoux', { statut: b.statut })
    if (!garde.ok) return garde.reponse
    const perimee = versionPerimee(
      Number(new URL(request.url).searchParams.get('version')),
      b.version,
    )
    if (perimee) return perimee
    const statut = refusSuppression(b)
    if (statut) return statut
    if (b.variantes.some((v) => magasin.variantesCitees.includes(v.id))) {
      return erreur(
        422,
        'RG-11',
        'Une demande de pièce cite ce bijou : il ne peut pas être supprimé. Archivez-le.',
      )
    }
    magasin.bijoux = magasin.bijoux.filter((autre) => autre.id !== b.id)
    journaliser(garde.compte, 'suppression', 'bijoux', b.id, enrichirBijou(b), null)
    return vide()
  }),

  http.post(`${RACINE}/:id/transition`, ({ request, params }) => {
    const b = trouver(params['id'])
    if (!b) return introuvable()
    const garde = autoriser(request, 'lire', 'bijoux')
    if (!garde.ok) return garde.reponse
    return transitionSimulee({
      requete: request,
      compte: garde.compte,
      ressource: 'bijoux',
      objet: b,
      titre: () => nomBijou(b),
      manques: () => exigencesBijou(b),
      controler: (vers) => {
        if (vers === 'publie') {
          const refusC = refusCreateur(b.createurId)
          if (refusC) return refusC
        }
        if (vers !== 'en_relecture' && vers !== 'publie') return null
        const enLigne = manquesVenteEnLigne(b)
        return enLigne.length
          ? erreur(
              422,
              'RG-10',
              'La vente en ligne exige un prix et un stock sur chaque variante.',
              {
                ...(enLigne[0] ? { champ: enLigne[0].champ } : {}),
                details: { manquants: enLigne },
              },
            )
          : null
      },
      lecture: enrichirBijou,
    })
  }),

  http.post(`${RACINE}/:id/variantes`, ({ request, params }) =>
    surVariantes(request, params['id'], async (b, compte) => {
      const corps = await lireCorps(request, entreeVarianteSchema)
      if (!corps.ok) return corps.reponse
      const e = corps.valeur
      if (e.reference && referencePrise(e.reference, null)) {
        return erreur(422, 'RG-04', 'Cette référence est déjà utilisée.', { champ: 'reference' })
      }
      const v: Variante = {
        id: crypto.randomUUID(),
        reference: e.reference ?? referenceLibre(b.numero, b.variantes.length + 1, new Set()),
        matiere: e.matiere ?? null,
        taille: e.taille ?? null,
        prix: e.prix ?? null,
        ancienPrix: e.ancienPrix ?? null,
        stock: e.stock ?? null,
        disponible: e.disponible ?? true,
        ordre: e.ordre ?? Math.max(-1, ...b.variantes.map((x) => x.ordre)) + 1,
        version: 1,
      }
      const refusPrix = refusAncienPrix(v, 'ancienPrix')
      if (refusPrix) return refusPrix
      b.variantes.push(v)
      journaliser(compte, 'variante:creation', 'bijoux', b.id, null, null)
      return json(v, 201)
    }),
  ),

  http.patch(`${RACINE}/:id/variantes/ordre`, ({ request, params }) =>
    surVariantes(request, params['id'], async (b, compte) => {
      const corps = await lireCorps(request, ordreSchema)
      if (!corps.ok) return corps.reponse
      const { ids } = corps.valeur
      const existants = new Set(b.variantes.map((v) => v.id))
      if (
        new Set(ids).size !== ids.length ||
        ids.length !== existants.size ||
        ids.some((id) => !existants.has(id))
      ) {
        return erreur(422, 'VALIDATION', 'La liste doit contenir chaque variante une fois.', {
          champ: 'ids',
        })
      }
      for (const v of b.variantes) v.ordre = ids.indexOf(v.id)
      journaliser(compte, 'variante:ordre', 'bijoux', b.id, null, null)
      return json({ ids })
    }),
  ),

  http.patch(`${RACINE}/:id/variantes/:varianteId`, ({ request, params }) =>
    surVariantes(request, params['id'], async (b, compte) => {
      const v = b.variantes.find((candidat) => candidat.id === params['varianteId'])
      if (!v) return varianteIntrouvable()
      const corps = await lireCorps(request, modificationVarianteSchema)
      if (!corps.ok) return corps.reponse
      const perimee = versionPerimee(corps.valeur.version, v.version)
      if (perimee) return perimee
      const { version: _version, ...champs } = corps.valeur
      const definis = Object.fromEntries(
        Object.entries(champs).filter(([, valeur]) => valeur !== undefined),
      )
      const modifiee: Variante = { ...v, ...definis, version: v.version + 1 }
      const refusPrix = refusAncienPrix(modifiee, 'ancienPrix')
      if (refusPrix) return refusPrix
      if (modifiee.reference !== v.reference && referencePrise(modifiee.reference, v.id)) {
        return erreur(422, 'RG-04', 'Cette référence est déjà utilisée.', { champ: 'reference' })
      }
      Object.assign(v, modifiee)
      journaliser(compte, 'variante:modification', 'bijoux', b.id, null, null)
      return json(v)
    }),
  ),

  http.delete(`${RACINE}/:id/variantes/:varianteId`, ({ request, params }) =>
    surVariantes(request, params['id'], (b, compte) => {
      const v = b.variantes.find((candidat) => candidat.id === params['varianteId'])
      if (!v) return varianteIntrouvable()
      const perimee = versionPerimee(
        Number(new URL(request.url).searchParams.get('version')),
        v.version,
      )
      if (perimee) return perimee
      if (b.variantes.length === 1) {
        return erreur(422, 'RG-10', 'Un bijou garde au moins une variante.')
      }
      if (magasin.variantesCitees.includes(v.id)) {
        return erreur(
          422,
          'RG-11',
          'Une demande de pièce cite cette variante : rendez-la indisponible plutôt.',
        )
      }
      b.variantes = b.variantes.filter((autre) => autre.id !== v.id)
      journaliser(compte, 'variante:suppression', 'bijoux', b.id, null, null)
      return vide()
    }),
  ),
]
