import { z } from 'zod'
import { LANGUES, type Langue } from '@/api/schemas/communs'
import type { Createur, EntreeCreateur, ModificationCreateur } from '@/api/schemas/createurs'

/**
 * Valeurs du formulaire d'un créateur et conversions vers le contrat (§ 10.2). Une traduction
 * écrite remplace la traduction entière (§ 8) : le formulaire envoie tous ses champs. Le taux
 * de commission n'est jamais prérempli ; `actif` n'est envoyé que s'il change.
 */
export interface TraductionCreateurFormulaire {
  bio: string
  accroche: string
}

export interface ValeursCreateur {
  nom: string
  slug: string
  pays: string
  ville: string
  photoId: string | null
  actif: boolean
  /** Saisie libre : vide = non défini (jamais `0`). */
  tauxCommission: string
  traductions: Record<Langue, TraductionCreateurFormulaire>
}

const vide = (): TraductionCreateurFormulaire => ({ bio: '', accroche: '' })

export function valeursVides(): ValeursCreateur {
  return {
    nom: '',
    slug: '',
    pays: '',
    ville: '',
    photoId: null,
    actif: false,
    tauxCommission: '',
    traductions: { fr: vide(), en: vide() },
  }
}

export function valeursDepuisCreateur(c: Createur): ValeursCreateur {
  const traduction = (langue: Langue): TraductionCreateurFormulaire => {
    const lue = c.traductions[langue]
    return lue ? { bio: lue.bio, accroche: lue.accroche ?? '' } : vide()
  }
  return {
    nom: c.nom,
    slug: c.slug,
    pays: c.pays ?? '',
    ville: c.ville ?? '',
    photoId: c.photoId,
    actif: c.actif,
    tauxCommission: c.tauxCommission === null ? '' : String(c.tauxCommission),
    traductions: { fr: traduction('fr'), en: traduction('en') },
  }
}

const traductionSchema = z.object({
  bio: z.string().max(4000, 'Au plus 4 000 caractères.'),
  accroche: z.string().max(200, 'Au plus 200 caractères.'),
})

/** Validation avant envoi, messages en français, chemins = ids des champs (D-44). */
export const schemaFormulaireCreateur = z.object({
  nom: z.string().trim().min(1, 'Nom obligatoire.').max(120, 'Au plus 120 caractères.'),
  slug: z
    .string()
    .max(120)
    .refine((s) => !s || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s), {
      message: 'Minuscules, chiffres et tirets seulement.',
    }),
  pays: z.string().max(120, 'Au plus 120 caractères.'),
  ville: z.string().max(120, 'Au plus 120 caractères.'),
  photoId: z.uuid().nullable(),
  actif: z.boolean(),
  tauxCommission: z.string().refine((s) => {
    if (!s.trim()) return true
    const n = Number(s.replace(',', '.'))
    return Number.isFinite(n) && n >= 0 && n <= 100
  }, 'Un pourcentage entre 0 et 100.'),
  traductions: z.object({ fr: traductionSchema, en: traductionSchema }),
})

const texte = (s: string) => s.trim() || null
const taux = (s: string) => (s.trim() ? Number(s.replace(',', '.')) : null)
const entamee = (t: TraductionCreateurFormulaire) => Boolean(t.bio.trim() || t.accroche.trim())

function traductionsEcrites(v: ValeursCreateur, existantes: Langue[]) {
  const ecrites: NonNullable<EntreeCreateur['traductions']> = {}
  for (const langue of LANGUES) {
    const t = v.traductions[langue]
    // Le français reste toujours présent : c'est la langue de référence du site.
    if (langue === 'fr' || entamee(t)) ecrites[langue] = { bio: t.bio, accroche: texte(t.accroche) }
    else if (existantes.includes(langue)) ecrites[langue] = null
  }
  return ecrites
}

export function versEntree(v: ValeursCreateur): EntreeCreateur {
  return {
    nom: v.nom.trim(),
    ...(v.slug.trim() ? { slug: v.slug.trim() } : {}),
    pays: texte(v.pays),
    ville: texte(v.ville),
    photoId: v.photoId,
    ...(v.actif ? { actif: true } : {}),
    ...(taux(v.tauxCommission) === null ? {} : { tauxCommission: taux(v.tauxCommission) }),
    traductions: traductionsEcrites(v, []),
  }
}

export function versModification(v: ValeursCreateur, c: Createur): ModificationCreateur {
  return {
    nom: v.nom.trim(),
    ...(v.slug.trim() && v.slug.trim() !== c.slug ? { slug: v.slug.trim() } : {}),
    pays: texte(v.pays),
    ville: texte(v.ville),
    photoId: v.photoId,
    ...(v.actif !== c.actif ? { actif: v.actif } : {}),
    ...(taux(v.tauxCommission) !== c.tauxCommission
      ? { tauxCommission: taux(v.tauxCommission) }
      : {}),
    traductions: traductionsEcrites(v, c.languesPresentes),
    version: c.version,
  }
}

export const CHAMPS_CREATEUR: readonly string[] = [
  'nom',
  'slug',
  'pays',
  'ville',
  'photoId',
  'actif',
  'tauxCommission',
  ...LANGUES.flatMap((l) => [`traductions.${l}.bio`, `traductions.${l}.accroche`]),
]

export const LIBELLES_CREATEUR: Record<string, string> = {
  nom: 'Nom',
  bio: 'Biographie',
  accroche: 'Accroche',
  photoId: 'Photo',
  pays: 'Pays',
  ville: 'Ville',
  slug: 'Adresse',
}
