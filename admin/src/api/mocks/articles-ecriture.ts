import type { Article, EntreeArticle, ModificationArticle } from '@/api/schemas/articles'
import { LANGUES, type Langue, type ResumeContenu } from '@/api/schemas/communs'
import { magasin, resumeCompte } from '@/api/mocks/magasin'
import { erreur } from '@/api/mocks/reponses'
import { enrichirArticle, slugifier, slugPris, suggestionSlug } from '@/api/mocks/regles'

/** Conversion des corps d'écriture en article stocké, et contrôles de slug (RG-04). */

type TraductionStockee = NonNullable<Article['traductions']['fr']>
type TraductionsEcrites = NonNullable<EntreeArticle['traductions']>

/**
 * Applique les traductions écrites : `null` supprime la langue ; un objet **remplace** la
 * traduction entière (contrat § 8, B-22 du back end). Seul le slug omis est conservé.
 */
export function fusionnerTraductions(
  existantes: Article['traductions'],
  ecrites: TraductionsEcrites | undefined,
): Article['traductions'] {
  const resultat: Article['traductions'] = { ...existantes }
  for (const langue of LANGUES) {
    const ecrite = ecrites?.[langue]
    if (ecrite === undefined) continue
    if (ecrite === null) {
      delete resultat[langue]
      continue
    }
    const avant = existantes[langue]
    const fusionnee: TraductionStockee = {
      slug: ecrite.slug ?? avant?.slug ?? slugifier(ecrite.titre),
      titre: ecrite.titre,
      extrait: ecrite.extrait ?? '',
      corps: ecrite.corps ?? null,
      seoTitre: ecrite.seoTitre ?? null,
      seoDescription: ecrite.seoDescription ?? null,
    }
    resultat[langue] = fusionnee
  }
  return resultat
}

/** RG-04 : refus d'un slug déjà pris dans la même langue, avec une variante proposée. */
export function controlerSlugs(article: Article): Response | null {
  for (const langue of LANGUES) {
    const slug = article.traductions[langue]?.slug
    if (slug && slugPris(slug, langue, article.id)) {
      return erreur(422, 'RG-04', 'Cette adresse est déjà utilisée par un autre article.', {
        champ: `traductions.${langue}.slug`,
        details: { suggestion: suggestionSlug(slug, langue, article.id) },
      })
    }
  }
  return null
}

export function nouvelArticle(
  entree: EntreeArticle,
  auteurId: string,
  maintenant: string,
): Article {
  return {
    id: crypto.randomUUID(),
    statut: 'brouillon',
    publieLe: null,
    creeLe: maintenant,
    modifieLe: maintenant,
    auteurId,
    version: 1,
    champsAFournir: [],
    languesPresentes: [],
    dernierMotifRefus: null,
    categorie: entree.categorie,
    imageId: entree.imageId ?? null,
    tagIds: entree.tagIds ?? [],
    aLaUne: entree.aLaUne ?? false,
    dureeLecture: null,
    traductions: fusionnerTraductions({}, entree.traductions),
  }
}

export function articleModifie(article: Article, modification: ModificationArticle): Article {
  return {
    ...article,
    ...(modification.categorie !== undefined ? { categorie: modification.categorie } : {}),
    ...(modification.imageId !== undefined ? { imageId: modification.imageId } : {}),
    ...(modification.tagIds !== undefined ? { tagIds: modification.tagIds } : {}),
    ...(modification.aLaUne !== undefined ? { aLaUne: modification.aLaUne } : {}),
    traductions: fusionnerTraductions(article.traductions, modification.traductions),
  }
}

/** Un brouillon doit garder au moins une langue : sans elle, il n'a plus de titre. */
export function sansTraduction(article: Article): Response | null {
  if (article.traductions.fr || article.traductions.en) return null
  return erreur(422, 'VALIDATION', 'Un article garde au moins une traduction.', {
    champ: 'traductions',
  })
}

export function resumeArticle(article: Article): ResumeContenu {
  const enrichi = enrichirArticle(article)
  const traduction = article.traductions.fr ?? article.traductions.en
  return {
    id: article.id,
    statut: article.statut,
    titre: traduction?.titre ?? '',
    slug: article.traductions.fr?.slug ?? null,
    publieLe: article.publieLe,
    modifieLe: article.modifieLe,
    auteur: resumeCompte(article.auteurId),
    version: article.version,
    champsAFournir: enrichi.champsAFournir,
    languesPresentes: enrichi.languesPresentes,
    imageId: article.imageId,
  }
}

/** Filtres de liste (`docs/CONTRAT-API.md` § 2 et § 9.1). */
export function filtrerArticles(url: URL): Article[] {
  const p = url.searchParams
  const q = p.get('q')?.toLowerCase()
  const statut = p.get('statut')
  const langue = p.get('langue') as Langue | null
  const sansLangue = p.get('sansLangue') as Langue | null
  const tags = p.getAll('tag')
  const categorie = p.get('categorie')
  return magasin.articles.filter((article) => {
    const textes = LANGUES.flatMap((l) => {
      const t = article.traductions[l]
      return t ? [t.titre, t.slug] : []
    })
    if (q && !textes.some((texte) => texte.toLowerCase().includes(q))) return false
    if (statut && article.statut !== statut) return false
    if (langue && !article.traductions[langue]) return false
    if (sansLangue && article.traductions[sansLangue]) return false
    if (tags.length && !tags.every((tag) => article.tagIds.includes(tag))) return false
    if (categorie && article.categorie !== categorie) return false
    if (p.get('aLaUne') === 'true' && !article.aLaUne) return false
    if (p.get('aFournir') === 'true' && enrichirArticle(article).champsAFournir.length === 0) {
      return false
    }
    return true
  })
}
