import { z } from 'zod'
import type { Bijou, EntreeBijou, ModificationBijou } from '@/api/schemas/boutique'
import { LANGUES, type Langue } from '@/api/schemas/communs'

/**
 * Valeurs du formulaire d'un bijou et conversions vers le contrat (§ 10.3). Les variantes ont
 * leurs propres routes : le formulaire ne les envoie pas. Les nombres se saisissent en texte :
 * vide = non communiqué, jamais `0` (§ 2). `prixConfirme` n'est envoyé que par un admin.
 */
export interface TraductionBijouFormulaire {
  slug: string
  nom: string
  culture: string
  histoire: string
}

export interface ValeursBijou {
  numero: string
  categorieId: string
  createurId: string | null
  imageId: string | null
  galerieMediaIds: string[]
  tagIds: string[]
  visible: boolean
  prixConfirme: boolean
  editionNumero: string
  editionTotal: string
  atelier: string
  village: string
  poids: string
  traductions: Record<Langue, TraductionBijouFormulaire>
}

const vide = (): TraductionBijouFormulaire => ({ slug: '', nom: '', culture: '', histoire: '' })

export function valeursVides(): ValeursBijou {
  return {
    numero: '',
    categorieId: '',
    createurId: null,
    imageId: null,
    galerieMediaIds: [],
    tagIds: [],
    visible: true,
    prixConfirme: false,
    editionNumero: '',
    editionTotal: '',
    atelier: '',
    village: '',
    poids: '',
    traductions: { fr: vide(), en: vide() },
  }
}

export function valeursDepuisBijou(b: Bijou): ValeursBijou {
  const traduction = (langue: Langue): TraductionBijouFormulaire => {
    const lue = b.traductions[langue]
    return lue
      ? { slug: lue.slug, nom: lue.nom, culture: lue.culture ?? '', histoire: lue.histoire }
      : vide()
  }
  return {
    numero: b.numero,
    categorieId: b.categorieId,
    createurId: b.createurId,
    imageId: b.imageId,
    galerieMediaIds: b.galerieMediaIds,
    tagIds: b.tagIds,
    visible: b.visible,
    prixConfirme: b.prixConfirme,
    editionNumero: b.edition ? String(b.edition.numero) : '',
    editionTotal: b.edition ? String(b.edition.total) : '',
    atelier: b.atelier ?? '',
    village: b.village ?? '',
    poids: b.poids === null ? '' : String(b.poids),
    traductions: { fr: traduction('fr'), en: traduction('en') },
  }
}

const presente = (t: TraductionBijouFormulaire) => t.nom.trim().length > 0
const entamee = (t: TraductionBijouFormulaire) =>
  [t.slug, t.culture, t.histoire].some((v) => v.trim().length > 0)
const entier = (s: string) => (/^\d+$/.test(s.trim()) ? Number(s.trim()) : null)
const nombre = (s: string) => {
  const n = Number(s.trim().replace(',', '.'))
  return s.trim() && Number.isFinite(n) ? n : null
}

const traductionSchema = z.object({
  slug: z.string().max(120),
  nom: z.string().max(200, 'Au plus 200 caractères.'),
  culture: z.string().max(200, 'Au plus 200 caractères.'),
  histoire: z.string().max(600, 'Au plus 600 caractères.'),
})

/** Validation avant envoi, messages en français, chemins = ids des champs (D-44). */
export const schemaFormulaireBijou = z
  .object({
    numero: z.string().trim().min(1, 'Numéro obligatoire.').max(10, 'Au plus 10 caractères.'),
    categorieId: z.string().min(1, 'Choisissez une catégorie.'),
    createurId: z.uuid().nullable(),
    imageId: z.uuid().nullable(),
    galerieMediaIds: z.array(z.uuid()).max(20, 'Au plus 20 images.'),
    tagIds: z.array(z.uuid()),
    visible: z.boolean(),
    prixConfirme: z.boolean(),
    editionNumero: z.string(),
    editionTotal: z.string(),
    atelier: z.string().max(120, 'Au plus 120 caractères.'),
    village: z.string().max(120, 'Au plus 120 caractères.'),
    poids: z.string(),
    traductions: z.object({ fr: traductionSchema, en: traductionSchema }),
  })
  .superRefine((v, ctx) => {
    const { fr, en } = v.traductions
    if (!presente(fr) && !presente(en)) {
      ctx.addIssue({
        code: 'custom',
        path: ['traductions', 'fr', 'nom'],
        message: 'Un nom est obligatoire.',
      })
    }
    for (const langue of LANGUES) {
      const t = v.traductions[langue]
      if (!presente(t) && entamee(t)) {
        ctx.addIssue({
          code: 'custom',
          path: ['traductions', langue, 'nom'],
          message: 'Saisissez le nom de cette langue, ou videz ses autres champs.',
        })
      }
      if (t.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(t.slug)) {
        ctx.addIssue({
          code: 'custom',
          path: ['traductions', langue, 'slug'],
          message: 'Minuscules, chiffres et tirets seulement.',
        })
      }
    }
    const [n, total] = [v.editionNumero.trim(), v.editionTotal.trim()]
    if (n || total) {
      const [en1, en2] = [entier(n), entier(total)]
      if (en1 === null || en1 < 1) {
        ctx.addIssue({ code: 'custom', path: ['editionNumero'], message: 'Un entier positif.' })
      }
      if (en2 === null || en2 < 1) {
        ctx.addIssue({ code: 'custom', path: ['editionTotal'], message: 'Un entier positif.' })
      }
      if (en1 !== null && en2 !== null && en1 > en2) {
        ctx.addIssue({
          code: 'custom',
          path: ['editionNumero'],
          message: 'Le numéro d’édition dépasse le tirage.',
        })
      }
    }
    if (v.poids.trim()) {
      const p = nombre(v.poids)
      if (p === null || p <= 0) {
        ctx.addIssue({ code: 'custom', path: ['poids'], message: 'Un poids positif, en grammes.' })
      }
    }
  })

const texte = (s: string) => s.trim() || null

function traductionsEcrites(v: ValeursBijou, existantes: Langue[]) {
  const ecrites: EntreeBijou['traductions'] = {}
  for (const langue of LANGUES) {
    const t = v.traductions[langue]
    if (presente(t)) {
      ecrites[langue] = {
        ...(t.slug.trim() ? { slug: t.slug.trim() } : {}),
        nom: t.nom.trim(),
        culture: texte(t.culture),
        histoire: t.histoire,
      }
    } else if (existantes.includes(langue)) ecrites[langue] = null
  }
  return ecrites
}

function champsCommuns(v: ValeursBijou) {
  const numeroEdition = entier(v.editionNumero)
  const total = entier(v.editionTotal)
  return {
    numero: v.numero.trim(),
    categorieId: v.categorieId,
    ...(v.createurId ? { createurId: v.createurId } : {}),
    imageId: v.imageId,
    galerieMediaIds: v.galerieMediaIds,
    tagIds: v.tagIds,
    visible: v.visible,
    edition: numeroEdition !== null && total !== null ? { numero: numeroEdition, total } : null,
    atelier: texte(v.atelier),
    village: texte(v.village),
    poids: nombre(v.poids),
  }
}

export function versEntree(v: ValeursBijou, admin: boolean): EntreeBijou {
  return {
    ...champsCommuns(v),
    ...(admin && v.prixConfirme ? { prixConfirme: true } : {}),
    traductions: traductionsEcrites(v, []),
  }
}

export function versModification(v: ValeursBijou, b: Bijou): ModificationBijou {
  return {
    ...champsCommuns(v),
    ...(v.prixConfirme !== b.prixConfirme ? { prixConfirme: v.prixConfirme } : {}),
    traductions: traductionsEcrites(v, b.languesPresentes),
    version: b.version,
  }
}

export const CHAMPS_BIJOU: readonly string[] = [
  'numero',
  'categorieId',
  'createurId',
  'imageId',
  'galerieMediaIds',
  'tagIds',
  'visible',
  'prixConfirme',
  'editionNumero',
  'editionTotal',
  'atelier',
  'village',
  'poids',
  ...LANGUES.flatMap((l) =>
    ['slug', 'nom', 'culture', 'histoire'].map((champ) => `traductions.${l}.${champ}`),
  ),
]

const LIBELLES: Record<string, string> = {
  nom: 'Nom',
  culture: 'Culture d’origine',
  histoire: 'Histoire',
  imageId: 'Image principale',
  galerieMediaIds: 'Galerie (5 images attendues)',
  edition: 'Édition',
  atelier: 'Atelier',
  village: 'Village',
  poids: 'Poids',
  variantes: 'Variantes',
  prixConfirme: 'Prix confirmé',
}

/** Libellés des chemins de `champsAFournir`, variantes comprises (`variantes.0.prix`). */
export function libellesBijou(b: Bijou | null): Record<string, string> {
  const variantes = Object.fromEntries(
    (b?.variantes ?? []).flatMap((v, i) => [
      [`variantes.${i}.prix`, `Prix — variante ${v.reference}`],
      [`variantes.${i}.matiere`, `Matière — variante ${v.reference}`],
      [`variantes.${i}.stock`, `Stock — variante ${v.reference}`],
    ]),
  )
  return { ...LIBELLES, ...variantes }
}
