import { http } from 'msw'
import { LANGUES } from '@/api/schemas/communs'
import {
  modificationMediaSchema,
  POIDS_MAX_IMAGE,
  POIDS_MAX_PDF,
  TYPES_MEDIA_ACCEPTES,
  type Media,
} from '@/api/schemas/medias'
import { ID_CREATEUR_PRINCIPAL } from '@/api/mocks/donnees'
import { autoriser, versionPerimee } from '@/api/mocks/garde'
import { horodatage, journaliser, magasin, resumeCompte } from '@/api/mocks/magasin'
import { enrichirMedia, usagesMedia } from '@/api/mocks/regles'
import { API, erreur, json, lireCorps, paginer, trier, vide } from '@/api/mocks/reponses'

/** Médiathèque simulée (`docs/CONTRAT-API.md` § 11). */

const RACINE = `${API}/medias`

function trouver(id: unknown): Media | undefined {
  return magasin.medias.find((media) => media.id === id)
}

function introuvable() {
  return erreur(404, 'NON_TROUVE', 'Ce média n’existe pas.')
}

/** Adresse d'aperçu : l'objet local dans le navigateur, une adresse fictive ailleurs. */
function urlApercu(fichier: File, id: string): string {
  try {
    return URL.createObjectURL(fichier)
  } catch {
    return `/mock-medias/${id}`
  }
}

export const handlersMedias = [
  http.get(RACINE, ({ request }) => {
    const garde = autoriser(request, 'lire', 'medias')
    if (!garde.ok) return garde.reponse
    const url = new URL(request.url)
    const p = url.searchParams
    const q = p.get('q')?.toLowerCase()
    const filtres = magasin.medias.map(enrichirMedia).filter((media) => {
      const textes = [
        media.credit ?? '',
        ...LANGUES.map((l) => media.traductions[l]?.texteAlt ?? ''),
      ]
      if (q && !textes.some((texte) => texte.toLowerCase().includes(q))) return false
      if (p.get('mime') === 'image' && !media.mime.startsWith('image/')) return false
      if (p.get('mime') === 'pdf' && media.mime !== 'application/pdf') return false
      if (p.get('createur') && media.createurId !== p.get('createur')) return false
      if (p.get('aFournir') === 'true' && media.champsAFournir.length === 0) return false
      if (p.get('nonUtilise') === 'true' && media.usages > 0) return false
      return true
    })
    const tries = trier(url, filtres, { creeLe: (m) => m.creeLe }, '-creeLe')
    if (!tries.ok) return tries.reponse
    const page = paginer(url, tries.elements)
    return page.ok ? json(page.corps) : page.reponse
  }),

  http.get(`${RACINE}/:id`, ({ request, params }) => {
    const garde = autoriser(request, 'lire', 'medias')
    if (!garde.ok) return garde.reponse
    const media = trouver(params['id'])
    return media ? json(enrichirMedia(media)) : introuvable()
  }),

  http.get(`${RACINE}/:id/usages`, ({ request, params }) => {
    const garde = autoriser(request, 'lire', 'medias')
    if (!garde.ok) return garde.reponse
    const media = trouver(params['id'])
    return media ? json(usagesMedia(media.id)) : introuvable()
  }),

  http.post(RACINE, async ({ request }) => {
    const garde = autoriser(request, 'creer', 'medias')
    if (!garde.ok) return garde.reponse
    const formulaire = await request.formData().catch(() => null)
    const brut = formulaire?.get('fichier')
    // Pas `instanceof File` : en test, le fichier vient d'un autre environnement (jsdom) que
    // le `File` du serveur simulé. On reconnaît un fichier à sa forme.
    const fichier =
      brut && typeof brut === 'object' && 'arrayBuffer' in brut && 'name' in brut
        ? (brut as File)
        : null
    if (!fichier) {
      return erreur(422, 'VALIDATION', 'Aucun fichier reçu.', { champ: 'fichier' })
    }
    // Le vrai serveur lit le type dans le contenu ; le faux se fie à l'en-tête.
    if (!(TYPES_MEDIA_ACCEPTES as readonly string[]).includes(fichier.type)) {
      return erreur(422, 'FICHIER_REFUSE', 'Ce type de fichier n’est pas accepté.', {
        champ: 'fichier',
        details: { raison: 'type' },
      })
    }
    const limite = fichier.type === 'application/pdf' ? POIDS_MAX_PDF : POIDS_MAX_IMAGE
    if (fichier.size > limite || fichier.size === 0) {
      return erreur(422, 'FICHIER_REFUSE', 'Ce fichier est trop lourd.', {
        champ: 'fichier',
        details: { raison: 'taille' },
      })
    }
    const texte = (cle: string) => {
      const valeur = formulaire?.get(cle)
      return typeof valeur === 'string' && valeur.trim() ? valeur.trim() : null
    }
    const id = crypto.randomUUID()
    const media: Media = {
      id,
      url: urlApercu(fichier, id),
      mime: fichier.type,
      largeur: null,
      hauteur: null,
      poids: fichier.size,
      credit: texte('credit'),
      decoratif: texte('decoratif') === 'true',
      createurId: texte('createurId') ?? ID_CREATEUR_PRINCIPAL,
      usages: 0,
      declinaisons: [],
      traductions: {
        ...(texte('texteAltFr')
          ? { fr: { texteAlt: texte('texteAltFr') ?? '', legende: null } }
          : {}),
        ...(texte('texteAltEn')
          ? { en: { texteAlt: texte('texteAltEn') ?? '', legende: null } }
          : {}),
      },
      champsAFournir: [],
      creeLe: horodatage(),
      creePar: resumeCompte(garde.compte.id),
      version: 1,
    }
    magasin.medias.unshift(media)
    journaliser(garde.compte, 'creation', 'medias', media.id, null, media)
    return json(enrichirMedia(media), 201)
  }),

  http.patch(`${RACINE}/:id`, async ({ request, params }) => {
    const media = trouver(params['id'])
    if (!media) return introuvable()
    const garde = autoriser(request, 'modifier', 'medias')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, modificationMediaSchema)
    if (!corps.ok) return corps.reponse
    const perimee = versionPerimee(corps.valeur.version, media.version)
    if (perimee) return perimee
    const avant = { ...media }
    const { traductions, version: _version, ...reste } = corps.valeur
    const nouvellesTraductions = { ...media.traductions }
    for (const langue of LANGUES) {
      const ecrite = traductions?.[langue]
      if (ecrite === null) delete nouvellesTraductions[langue]
      else if (ecrite)
        nouvellesTraductions[langue] = {
          texteAlt: ecrite.texteAlt,
          legende: ecrite.legende ?? null,
        }
    }
    Object.assign(media, reste, { traductions: nouvellesTraductions, version: media.version + 1 })
    journaliser(garde.compte, 'modification', 'medias', media.id, avant, media)
    return json(enrichirMedia(media))
  }),

  http.delete(`${RACINE}/:id`, ({ request, params }) => {
    const media = trouver(params['id'])
    if (!media) return introuvable()
    const garde = autoriser(request, 'supprimer', 'medias')
    if (!garde.ok) return garde.reponse
    const perimee = versionPerimee(
      Number(new URL(request.url).searchParams.get('version')),
      media.version,
    )
    if (perimee) return perimee
    const usages = usagesMedia(media.id)
    if (usages.length > 0) {
      return erreur(422, 'RG-08', 'Ce média est utilisé : il ne peut pas être supprimé.', {
        details: { usages },
      })
    }
    magasin.medias = magasin.medias.filter((candidat) => candidat.id !== media.id)
    journaliser(garde.compte, 'suppression', 'medias', media.id, media, null)
    return vide()
  }),
]
