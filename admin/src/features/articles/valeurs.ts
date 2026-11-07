import { z } from 'zod'
import type { Article, EntreeArticle, ModificationArticle } from '@/api/schemas/articles'
import { LANGUES, type Langue } from '@/api/schemas/communs'
import { corpsRicheSchema, type CorpsRiche } from '@/api/schemas/corps-riche'

/**
 * Valeurs du formulaire d'article et conversions vers le contrat (§ 9.1).
 *
 * Une langue est **présente** dès que son titre est saisi. Écrite, une traduction remplace la
 * traduction entière (contrat § 8, B-22 du back end) : le formulaire envoie donc toujours tous
 * ses champs. Une langue vidée qui existait est supprimée (`null`), jamais envoyée vide.
 */
export interface TraductionFormulaire {
  slug: string
  titre: string
  extrait: string
  corps: CorpsRiche | null
  seoTitre: string
  seoDescription: string
}

export interface ValeursArticle {
  /** Nom de la catégorie (texte historique) et son identifiant (famille `article`, SCHEMAS § 4). */
  categorie: string
  categorieId: string
  imageId: string | null
  tagIds: string[]
  aLaUne: boolean
  traductions: Record<Langue, TraductionFormulaire>
}

const traductionVide = (): TraductionFormulaire => ({
  slug: '',
  titre: '',
  extrait: '',
  corps: null,
  seoTitre: '',
  seoDescription: '',
})

export function valeursVides(): ValeursArticle {
  return {
    categorie: '',
    categorieId: '',
    imageId: null,
    tagIds: [],
    aLaUne: false,
    traductions: { fr: traductionVide(), en: traductionVide() },
  }
}

export function valeursDepuisArticle(article: Article): ValeursArticle {
  const traduction = (langue: Langue): TraductionFormulaire => {
    const lue = article.traductions[langue]
    if (!lue) return traductionVide()
    return {
      slug: lue.slug,
      titre: lue.titre,
      extrait: lue.extrait,
      corps: lue.corps,
      seoTitre: lue.seoTitre ?? '',
      seoDescription: lue.seoDescription ?? '',
    }
  }
  return {
    categorie: article.categorie,
    categorieId: article.categorieId ?? '',
    imageId: article.imageId,
    tagIds: article.tagIds,
    aLaUne: article.aLaUne,
    traductions: { fr: traduction('fr'), en: traduction('en') },
  }
}

const presente = (t: TraductionFormulaire) => t.titre.trim().length > 0
const entamee = (t: TraductionFormulaire) =>
  [t.slug, t.extrait, t.seoTitre, t.seoDescription].some((v) => v.trim()) || t.corps !== null

const traductionSchema = z.object({
  slug: z.string().max(120),
  titre: z.string().max(200, 'Au plus 200 caractères.'),
  extrait: z.string().max(400, 'Au plus 400 caractères.'),
  corps: corpsRicheSchema.nullable(),
  seoTitre: z.string().max(70, 'Au plus 70 caractères.'),
  seoDescription: z.string().max(160, 'Au plus 160 caractères.'),
})

/** Validation avant envoi, messages en français, chemins = ids des champs (D-44). */
export const schemaFormulaireArticle = z
  .object({
    categorie: z.string().min(1, 'Choisissez une catégorie.'),
    categorieId: z.string(),
    imageId: z.uuid().nullable(),
    tagIds: z.array(z.uuid()),
    aLaUne: z.boolean(),
    traductions: z.object({ fr: traductionSchema, en: traductionSchema }),
  })
  .superRefine((valeurs, ctx) => {
    const { fr, en } = valeurs.traductions
    if (!presente(fr) && !presente(en)) {
      ctx.addIssue({
        code: 'custom',
        path: ['traductions', 'fr', 'titre'],
        message: 'Un titre est obligatoire.',
      })
    }
    for (const langue of LANGUES) {
      const traduction = valeurs.traductions[langue]
      if (!presente(traduction) && entamee(traduction)) {
        ctx.addIssue({
          code: 'custom',
          path: ['traductions', langue, 'titre'],
          message: 'Saisissez le titre de cette langue, ou videz ses autres champs.',
        })
      }
      if (traduction.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(traduction.slug)) {
        ctx.addIssue({
          code: 'custom',
          path: ['traductions', langue, 'slug'],
          message: 'Minuscules, chiffres et tirets seulement.',
        })
      }
    }
  })

function traductionEcrite(t: TraductionFormulaire) {
  return {
    ...(t.slug.trim() ? { slug: t.slug.trim() } : {}),
    titre: t.titre.trim(),
    extrait: t.extrait,
    corps: t.corps,
    seoTitre: t.seoTitre.trim() || null,
    seoDescription: t.seoDescription.trim() || null,
  }
}

function traductionsEcrites(valeurs: ValeursArticle, existantes: Langue[]) {
  const ecrites: EntreeArticle['traductions'] = {}
  for (const langue of LANGUES) {
    const traduction = valeurs.traductions[langue]
    if (presente(traduction)) ecrites[langue] = traductionEcrite(traduction)
    else if (existantes.includes(langue)) ecrites[langue] = null
  }
  return ecrites
}

export function versEntree(valeurs: ValeursArticle): EntreeArticle {
  return {
    categorie: valeurs.categorie,
    ...(valeurs.categorieId ? { categorieId: valeurs.categorieId } : {}),
    imageId: valeurs.imageId,
    tagIds: valeurs.tagIds,
    aLaUne: valeurs.aLaUne,
    traductions: traductionsEcrites(valeurs, []),
  }
}

export function versModification(valeurs: ValeursArticle, article: Article): ModificationArticle {
  return {
    categorie: valeurs.categorie,
    ...(valeurs.categorieId ? { categorieId: valeurs.categorieId } : {}),
    imageId: valeurs.imageId,
    tagIds: valeurs.tagIds,
    aLaUne: valeurs.aLaUne,
    traductions: traductionsEcrites(valeurs, article.languesPresentes),
    version: article.version,
  }
}

/** Champs du formulaire, pour rattacher les `422` du serveur (D-44). */
export const CHAMPS_ARTICLE: readonly string[] = [
  'categorie',
  'imageId',
  'tagIds',
  'aLaUne',
  ...LANGUES.flatMap((l) =>
    ['slug', 'titre', 'extrait', 'corps', 'seoTitre', 'seoDescription'].map(
      (champ) => `traductions.${l}.${champ}`,
    ),
  ),
]

/** Libellés lisibles des chemins de `champsAFournir` et des manques RG-03. */
export const LIBELLES_ARTICLE: Record<string, string> = {
  titre: 'Titre',
  extrait: 'Résumé',
  corps: 'Corps',
  imageId: 'Image principale',
  tagIds: 'Tag de format',
  categorie: 'Catégorie',
}
