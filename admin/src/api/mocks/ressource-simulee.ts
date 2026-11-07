import { http } from 'msw'
import { z } from 'zod'
import { LANGUES, type Compte, type Langue, type ResumeContenu } from '@/api/schemas/communs'
import type { RessourceContenu } from '@/auth/permissions'
import {
  refusArchive,
  refusPublication,
  refusSuppression,
  transitionSimulee,
  type ObjetCycle,
} from '@/api/mocks/cycle'
import { autoriser, versionPerimee } from '@/api/mocks/garde'
import { horodatage, journaliser, ouvrirPublication, resumeCompte } from '@/api/mocks/magasin'
import { slugifier, type Manquant } from '@/api/mocks/regles'
import { API, erreur, json, lireCorps, paginer, trier, vide } from '@/api/mocks/reponses'

/**
 * Fabrique d'une ressource éditoriale simulée (`docs/CONTRAT-API.md` § 8) : liste, lecture,
 * création, modification, suppression, transitions et ordre. Chaque ressource ne décrit que ce
 * qui lui est propre (D-63) ; les règles communes (cycle de vie, RG-03, RG-04, versions) sont
 * écrites une fois.
 */
type Traduction = Record<string, unknown>
/** Comme le lit le schéma : une langue absente peut valoir `undefined` (exactOptionalPropertyTypes). */
export type Traductions = { [L in Langue]?: Traduction | undefined }

export interface ObjetEditorial extends ObjetCycle {
  creeLe: string
  auteurId: string
  champsAFournir: string[]
  languesPresentes: Langue[]
  tagIds: string[]
  traductions: Traductions
  ordre?: number
}

export interface ConfigRessource<O extends ObjetEditorial> {
  nom: RessourceContenu
  collection: () => O[]
  remplacer: (liste: O[]) => void
  entree: z.ZodType
  modification: z.ZodType
  /** Champ de traduction qui sert de titre (`titre`, `nom`). */
  champTitre: string
  /** La ressource a un slug par langue (RG-04) ; les villes n'en ont pas. */
  slugs: boolean
  /** Une traduction écrite, complétée de ses champs facultatifs (`null`, `''`). */
  traduction: (ecrite: Traduction, existante: Traduction | undefined) => Traduction
  /** Champs hors traductions d'un nouvel objet, depuis l'entrée validée. */
  champsInitiaux: (entree: Record<string, unknown>) => Partial<O>
  exigences: (objet: O) => Manquant[]
  credibilite?: (objet: O) => string[]
  /** Règle propre avant toute écriture (numéro unique, coordonnées…). */
  controler?: (objet: O) => Response | null
  /** Règle propre avant une soumission ou une publication. */
  controlerPublication?: (objet: O) => Response | null
  tris: Record<string, (objet: O) => string | number>
  triParDefaut?: string
  ordonnable?: boolean
  /** Champs propres ajoutés au résumé de liste. */
  resume?: (objet: O) => Record<string, unknown>
  /**
   * Filtres propres à la liste (`?emplacement=`…) : renvoyer `false` exclut l'objet. Les
   * paramètres communs (statut, langue, tag…) ont déjà été appliqués.
   */
  filtrer?: (objet: O, params: URLSearchParams) => boolean
  /**
   * Champ de regroupement de l'ordre (`emplacement` d'une galerie, § 9.9) : la liste envoyée à
   * `PATCH /ordre` ne porte que les éléments d'un même groupe, et la création ordonne dans le
   * groupe seul.
   */
  groupe?: 'emplacement'
  /** Effet sur les autres objets après une écriture (une seule parution à la une…). */
  apresEcriture?: (objet: O) => void
}

export function titreDe(objet: ObjetEditorial, champ: string): string {
  const valeur = objet.traductions.fr?.[champ] ?? objet.traductions.en?.[champ]
  return typeof valeur === 'string' ? valeur : ''
}

export function ressourceSimulee<O extends ObjetEditorial>(config: ConfigRessource<O>) {
  const racine = `${API}/${config.nom}`
  const trouver = (id: unknown) => config.collection().find((o) => o.id === id)
  const introuvable = () => erreur(404, 'NON_TROUVE', 'Ce contenu n’existe pas.')
  const titre = (o: O) => titreDe(o, config.champTitre)

  const enrichir = (o: O): O => ({
    ...o,
    languesPresentes: LANGUES.filter((l) => o.traductions[l]),
    champsAFournir: [
      ...new Set([...config.exigences(o).map((m) => m.champ), ...(config.credibilite?.(o) ?? [])]),
    ],
  })

  const resume = (o: O): ResumeContenu & Record<string, unknown> => {
    const lu = enrichir(o)
    const slug = o.traductions.fr?.['slug'] ?? o.traductions.en?.['slug']
    return {
      id: o.id,
      statut: o.statut,
      titre: titre(o),
      slug: typeof slug === 'string' ? slug : null,
      publieLe: o.publieLe,
      modifieLe: o.modifieLe,
      auteur: resumeCompte(o.auteurId),
      version: o.version,
      champsAFournir: lu.champsAFournir,
      languesPresentes: lu.languesPresentes,
      imageId: (o as { imageId?: string | null }).imageId ?? null,
      ...(o.ordre === undefined ? {} : { ordre: o.ordre }),
      ...config.resume?.(o),
    }
  }

  function traductions(
    existantes: O['traductions'],
    ecrites: Partial<Record<Langue, Traduction | null>> | undefined,
  ): O['traductions'] {
    const resultat: O['traductions'] = {}
    for (const langue of LANGUES) {
      const ecrite = ecrites?.[langue]
      if (ecrite === null) continue
      if (ecrite === undefined) {
        if (existantes[langue]) resultat[langue] = existantes[langue]
        continue
      }
      const complete = config.traduction(ecrite, existantes[langue])
      if (config.slugs) {
        const titreEcrit = String(ecrite[config.champTitre] ?? '')
        complete['slug'] =
          ecrite['slug'] ?? existantes[langue]?.['slug'] ?? (slugifier(titreEcrit) || config.nom)
      }
      resultat[langue] = complete
    }
    return resultat
  }

  /** RG-04 : slug unique par langue, avec une variante proposée. */
  function controlerSlugs(o: O): Response | null {
    if (!config.slugs) return null
    for (const langue of LANGUES) {
      const slug = o.traductions[langue]?.['slug']
      const pris = (s: unknown) =>
        config
          .collection()
          .some((autre) => autre.id !== o.id && autre.traductions[langue]?.['slug'] === s)
      if (typeof slug === 'string' && pris(slug)) {
        let rang = 2
        while (pris(`${slug}-${rang}`)) rang += 1
        return erreur(422, 'RG-04', 'Cette adresse est déjà utilisée par un autre contenu.', {
          champ: `traductions.${langue}.slug`,
          details: { suggestion: `${slug}-${rang}` },
        })
      }
    }
    return null
  }

  function controlerEcriture(o: O): Response | null {
    if (!o.traductions.fr && !o.traductions.en) {
      return erreur(422, 'VALIDATION', 'Un contenu garde au moins une traduction.', {
        champ: 'traductions',
      })
    }
    return controlerSlugs(o) ?? config.controler?.(o) ?? null
  }

  const reconstruire = (compte: Compte, o: O) =>
    ouvrirPublication(compte, 'publication', { ressource: config.nom, id: o.id, titre: titre(o) })

  const ordreSchema = z.strictObject({ ids: z.array(z.uuid()).min(1) })

  return [
    http.get(racine, ({ request }) => {
      const garde = autoriser(request, 'lire', config.nom)
      if (!garde.ok) return garde.reponse
      const url = new URL(request.url)
      const p = url.searchParams
      const q = p.get('q')?.toLowerCase()
      const filtres = config.collection().filter((o) => {
        if (p.get('statut') && o.statut !== p.get('statut')) return false
        const langue = p.get('langue') as Langue | null
        const sans = p.get('sansLangue') as Langue | null
        if (langue && !o.traductions[langue]) return false
        if (sans && o.traductions[sans]) return false
        if (p.getAll('tag').some((tag) => !o.tagIds.includes(tag))) return false
        if (p.get('aFournir') === 'true' && enrichir(o).champsAFournir.length === 0) return false
        if (config.filtrer && !config.filtrer(o, p)) return false
        return !q || titre(o).toLowerCase().includes(q)
      })
      const tries = trier(
        url,
        filtres,
        { modifieLe: (o) => o.modifieLe, ...config.tris },
        config.triParDefaut,
      )
      if (!tries.ok) return tries.reponse
      const page = paginer(url, tries.elements.map(resume))
      return page.ok ? json(page.corps) : page.reponse
    }),

    ...(config.ordonnable
      ? [
          http.patch(`${racine}/ordre`, async ({ request }) => {
            const garde = autoriser(request, 'ordonner', config.nom)
            if (!garde.ok) return garde.reponse
            const corps = await lireCorps(request, ordreSchema)
            if (!corps.ok) return corps.reponse
            const { ids } = corps.valeur
            const existants = new Set(config.collection().map((o) => o.id))
            const { groupe } = config
            /** Ordre par groupe (§ 9.9) : la liste porte un seul groupe, les autres bougent pas. */
            const valeurGroupe = groupe
              ? (
                  config.collection().find((x) => x.id === ids[0]) as
                    Record<string, unknown> | undefined
                )?.[groupe]
              : undefined
            const memeGroupe = (o: O) =>
              groupe ? (o as Record<string, unknown>)[groupe] === valeurGroupe : true
            if (
              new Set(ids).size !== ids.length ||
              !ids.every((id) => existants.has(id)) ||
              config.collection().some((o) => memeGroupe(o) !== ids.includes(o.id))
            ) {
              return erreur(
                422,
                'VALIDATION',
                'La liste doit contenir chaque élément exactement une fois.',
                { champ: 'ids' },
              )
            }
            for (const o of config.collection()) if (memeGroupe(o)) o.ordre = ids.indexOf(o.id)
            journaliser(garde.compte, 'ordre', config.nom, null, null, { ids })
            if (config.collection().some((o) => o.statut === 'publie')) {
              ouvrirPublication(garde.compte, 'publication', null)
            }
            return json({ ids })
          }),
        ]
      : []),

    http.get(`${racine}/:id`, ({ request, params }) => {
      const garde = autoriser(request, 'lire', config.nom)
      if (!garde.ok) return garde.reponse
      const o = trouver(params['id'])
      return o ? json(enrichir(o)) : introuvable()
    }),

    http.post(racine, async ({ request }) => {
      const garde = autoriser(request, 'creer', config.nom)
      if (!garde.ok) return garde.reponse
      const corps = await lireCorps(request, config.entree)
      if (!corps.ok) return corps.reponse
      const entree = corps.valeur as Record<string, unknown> & {
        traductions?: Partial<Record<Langue, Traduction | null>>
      }
      const maintenant = horodatage()
      const o = {
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
        tagIds: [],
        ...(config.ordonnable
          ? { ordre: Math.max(-1, ...config.collection().map((x) => x.ordre ?? 0)) + 1 }
          : {}),
        ...config.champsInitiaux(entree),
        traductions: traductions({}, entree.traductions),
      } as unknown as O
      const refus = controlerEcriture(o)
      if (refus) return refus
      config.remplacer([o, ...config.collection()])
      config.apresEcriture?.(o)
      journaliser(garde.compte, 'creation', config.nom, o.id, null, enrichir(o))
      return json(enrichir(o), 201)
    }),

    http.patch(`${racine}/:id`, async ({ request, params }) => {
      const o = trouver(params['id'])
      if (!o) return introuvable()
      const archive = refusArchive(o)
      if (archive) return archive
      const garde = autoriser(request, 'modifier', config.nom, { statut: o.statut }, 'RG-02')
      if (!garde.ok) return garde.reponse
      const corps = await lireCorps(request, config.modification)
      if (!corps.ok) return corps.reponse
      const m = corps.valeur as Record<string, unknown> & {
        version: number
        traductions?: Partial<Record<Langue, Traduction | null>>
      }
      const perimee = versionPerimee(m.version, o.version)
      if (perimee) return perimee
      const definis = Object.fromEntries(
        Object.entries(m).filter(
          ([cle, valeur]) => cle !== 'version' && cle !== 'traductions' && valeur !== undefined,
        ),
      )
      const modifie = {
        ...o,
        ...definis,
        traductions: traductions(o.traductions, m.traductions),
      } as O
      const refus = controlerEcriture(modifie)
      if (refus) return refus
      if (o.statut === 'publie') {
        const liste = config.exigences(modifie)
        if (liste.length) return refusPublication(liste)
      }
      const avant = enrichir(o)
      Object.assign(o, modifie, { version: o.version + 1, modifieLe: horodatage() })
      config.apresEcriture?.(o)
      journaliser(garde.compte, 'modification', config.nom, o.id, avant, enrichir(o))
      if (o.statut === 'publie') reconstruire(garde.compte, o)
      return json(enrichir(o))
    }),

    http.delete(`${racine}/:id`, ({ request, params }) => {
      const o = trouver(params['id'])
      if (!o) return introuvable()
      const garde = autoriser(request, 'supprimer', config.nom, { statut: o.statut })
      if (!garde.ok) return garde.reponse
      const perimee = versionPerimee(
        Number(new URL(request.url).searchParams.get('version')),
        o.version,
      )
      if (perimee) return perimee
      const statut = refusSuppression(o)
      if (statut) return statut
      config.remplacer(config.collection().filter((autre) => autre.id !== o.id))
      journaliser(garde.compte, 'suppression', config.nom, o.id, enrichir(o), null)
      return vide()
    }),

    http.post(`${racine}/:id/transition`, ({ request, params }) => {
      const o = trouver(params['id'])
      if (!o) return introuvable()
      const garde = autoriser(request, 'lire', config.nom)
      if (!garde.ok) return garde.reponse
      return transitionSimulee({
        requete: request,
        compte: garde.compte,
        ressource: config.nom,
        objet: o,
        titre: () => titre(o),
        manques: () => config.exigences(o),
        controler: (vers) =>
          vers === 'en_relecture' || vers === 'publie'
            ? (config.controlerPublication?.(o) ?? null)
            : null,
        lecture: enrichir,
      })
    }),
  ]
}
