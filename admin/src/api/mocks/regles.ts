import type { Article } from '@/api/schemas/articles'
import type { Langue, StatutContenu, Usage } from '@/api/schemas/communs'
import { mediasDuCorps, motsDuCorps } from '@/api/schemas/corps-riche'
import type { Media } from '@/api/schemas/medias'
import { magasin } from '@/api/mocks/magasin'

/**
 * Règles de gestion appliquées par le faux serveur (section 7 du prompt admin).
 *
 * Elles reproduisent le contrat pour que les écrans rencontrent les vrais refus. Elles ne
 * prouvent rien sur le vrai serveur (D-14) : celui-ci a ses propres tests.
 */

/** Diagramme des transitions (`docs/CONTRAT-API.md` § 7.3). */
export const TRANSITIONS: Record<
  StatutContenu,
  Partial<Record<StatutContenu, 'tous' | 'admin'>>
> = {
  brouillon: { en_relecture: 'tous' },
  en_relecture: { publie: 'admin', brouillon: 'admin' },
  publie: { brouillon: 'admin', archive: 'admin' },
  archive: { brouillon: 'admin' },
}

export function transitionsDepuis(statut: StatutContenu): StatutContenu[] {
  return Object.keys(TRANSITIONS[statut]) as StatutContenu[]
}

export interface Manquant {
  champ: string
  langue?: Langue
  message: string
}

/** Exigences de publication d'un média utilisé (RG-03, RG-08, § 7.5). */
function manquesMedia(media: Media | undefined, champ: string, langues: Langue[]): Manquant[] {
  if (!media) return [{ champ, message: 'Le média cité n’existe plus.' }]
  const manques: Manquant[] = []
  if (!media.decoratif) {
    for (const langue of langues) {
      if (!media.traductions[langue]?.texteAlt.trim()) {
        manques.push({
          champ,
          langue,
          message: `Texte alternatif manquant (${langue}) sur un média utilisé.`,
        })
      }
    }
  }
  if (!media.credit) manques.push({ champ, message: 'Crédit manquant sur un média utilisé.' })
  return manques
}

/** RG-03 et RG-06 pour un article, dans chaque langue active. */
export function exigencesArticle(article: Article, langues: Langue[]): Manquant[] {
  const manques: Manquant[] = []
  for (const langue of langues) {
    const traduction = article.traductions[langue]
    const prefixe = `traductions.${langue}`
    if (!traduction) {
      manques.push({ champ: prefixe, langue, message: `Traduction ${langue} absente.` })
      continue
    }
    if (!traduction.titre.trim())
      manques.push({ champ: `${prefixe}.titre`, langue, message: 'Titre manquant.' })
    if (!traduction.extrait.trim())
      manques.push({ champ: `${prefixe}.extrait`, langue, message: 'Résumé manquant.' })
    if (!traduction.corps?.content.length)
      manques.push({ champ: `${prefixe}.corps`, langue, message: 'Corps manquant.' })
  }
  if (!article.imageId) {
    manques.push({ champ: 'imageId', message: 'Image principale manquante.' })
  } else {
    manques.push(...manquesMedia(trouverMedia(article.imageId), 'imageId', langues))
  }
  for (const langue of langues) {
    for (const mediaId of mediasDuCorps(article.traductions[langue]?.corps)) {
      manques.push(...manquesMedia(trouverMedia(mediaId), `traductions.${langue}.corps`, langues))
    }
  }
  return manques
}

export function aUnTagDeFormat(tagIds: string[]): boolean {
  return tagIds.some((id) => magasin.tags.find((tag) => tag.id === id)?.type === 'format')
}

function trouverMedia(id: string): Media | undefined {
  return magasin.medias.find((media) => media.id === id)
}

/** Champs calculés à chaque lecture (`champsAFournir`, langues présentes, durée de lecture). */
export function enrichirArticle(article: Article): Article {
  const langues = (['fr', 'en'] as const).filter((langue) => article.traductions[langue])
  const mots = motsDuCorps(article.traductions.fr?.corps ?? article.traductions.en?.corps)
  const champs = new Set(exigencesArticle(article, magasin.languesActives).map((m) => m.champ))
  return {
    ...article,
    languesPresentes: langues,
    dureeLecture: mots > 0 ? Math.max(1, Math.ceil(mots / 200)) : null,
    champsAFournir: [...champs],
  }
}

export function enrichirMedia(media: Media): Media {
  const champs: string[] = []
  if (!media.decoratif) {
    for (const langue of magasin.languesActives) {
      if (!media.traductions[langue]?.texteAlt.trim()) champs.push(`traductions.${langue}.texteAlt`)
    }
  }
  if (!media.credit) champs.push('credit')
  return { ...media, champsAFournir: champs, usages: usagesMedia(media.id).length }
}

/** Tous les contenus qui citent un média : image principale et corps (RG-08). */
export function usagesMedia(id: string): Usage[] {
  const usages: Usage[] = []
  for (const article of magasin.articles) {
    const titre = article.traductions.fr?.titre ?? article.traductions.en?.titre ?? ''
    const base = { ressource: 'articles', id: article.id, titre, statut: article.statut }
    if (article.imageId === id) usages.push({ ...base, champ: 'imageId' })
    for (const langue of ['fr', 'en'] as const) {
      if (mediasDuCorps(article.traductions[langue]?.corps).includes(id)) {
        usages.push({ ...base, champ: `traductions.${langue}.corps` })
      }
    }
  }
  return usages
}

export function usagesTag(id: string): Usage[] {
  return magasin.articles
    .filter((article) => article.tagIds.includes(id))
    .map((article) => ({
      ressource: 'articles',
      id: article.id,
      titre: article.traductions.fr?.titre ?? article.traductions.en?.titre ?? '',
      champ: 'tagIds',
      statut: article.statut,
    }))
}

/** Slug depuis un titre : minuscules, sans accent, mots séparés par des tirets. */
export function slugifier(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
}

/** RG-04 : un slug est unique par type et par langue. */
export function slugPris(slug: string, langue: Langue, idExclu?: string): boolean {
  return magasin.articles.some(
    (article) => article.id !== idExclu && article.traductions[langue]?.slug === slug,
  )
}

export function suggestionSlug(slug: string, langue: Langue, idExclu?: string): string {
  let rang = 2
  while (slugPris(`${slug}-${rang}`, langue, idExclu)) rang += 1
  return `${slug}-${rang}`
}
