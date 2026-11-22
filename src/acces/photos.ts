/**
 * Photos fixes du site (contrat § 22.4) — le site les lit **à la construction** (LIAISON § C.2).
 * Tant qu'une photo n'est pas assignée dans le CMS (Médiathèque › Sur le site), l'emplacement
 * rend `null` : chaque consommateur retombe sur son actif historique. Aucune image n'est
 * inventée ; un emplacement non rempli laisse la page telle quelle.
 */
import { lireGenere, SOURCE_API } from './source'
import type { ImagePublique } from './adaptateurs'

export interface PhotoFixe {
  cle: string
  libelle: string
  formatConseille: string | null
  /** Résolution complète { url, alt, largeur, hauteur, declinaisons }, ou null si non assignée. */
  image: ImagePublique | null
}

const PHOTOS: ReadonlyMap<string, PhotoFixe> = new Map(
  (SOURCE_API ? lireGenere<PhotoFixe[]>('photos-fixes') : []).map((p) => [p.cle, p]),
)

/** La photo d'un emplacement, ou `null` si jamais assignée. */
export const photoFixe = (cle: string): ImagePublique | null => PHOTOS.get(cle)?.image ?? null

/** Attribut `srcSet` d'une photo (déclinaisons WebP générées à l'envoi). */
export const srcsetFixe = (image: ImagePublique): string =>
  image.declinaisons.length > 0
    ? image.declinaisons.map((d) => `${d.url} ${d.largeur}w`).join(', ')
    : image.url

/** Résolution complète d'un emplacement, avec repli sur un chemin du dépôt. */
export function photoOuRepli(cle: string, repli: string): { src: string; srcSet?: string } {
  const image = photoFixe(cle)
  if (!image) return { src: repli }
  return { src: image.url, srcSet: srcsetFixe(image) }
}
