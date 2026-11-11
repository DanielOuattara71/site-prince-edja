import cauri from '@/assets/motifs/motif-cauri-africain.svg?raw'
import circulaire from '@/assets/motifs/motif-circulaire-03.svg?raw'
import lineaire from '@/assets/motifs/motif-lineaire-05.svg?raw'
import linear from '@/assets/motifs/motif-linear-01.svg?raw'
import spiral from '@/assets/motifs/motif-spiral-02.svg?raw'
import symetrique from '@/assets/motifs/motif-symetrique-04.svg?raw'

/**
 * Les six motifs fournis, désignés par le nom de leur fichier. Les cinq premiers sont
 * des dessins linéaires carrés ; le cauri est une silhouette pleine, au format paysage.
 * Il sert de sceau, pas de texture de ruban.
 */
export type MotifAfricain =
  'linear-01' | 'spiral-02' | 'circulaire-03' | 'symetrique-04' | 'lineaire-05' | 'cauri-africain'

/**
 * Prépare un SVG fourni pour un rendu décoratif.
 *
 * - la déclaration XML et les `<title>`/`<desc>` sont retirés : les cinq motifs
 *   linéaires donnaient tous `id="title"`, et plusieurs motifs sur une même page
 *   produisaient des identifiants en double ; le cauri ajoutait un `<desc>` ;
 * - `role="img"` et `aria-labelledby` tombent avec eux : le motif est décoratif, le
 *   conteneur porte déjà `aria-hidden` ;
 * - le trait et l'aplat passent en `currentColor` pour que la couleur soit pilotée
 *   par le parent (les cinq motifs sont tracés, le cauri est rempli).
 */
function preparer(svg: string): string {
  return svg
    .replace(/<\?xml[^>]*\?>\s*/g, '')
    .replace(/<title[^>]*>[\s\S]*?<\/title>\s*/g, '')
    .replace(/<desc[^>]*>[\s\S]*?<\/desc>\s*/g, '')
    .replace(/\s+role="img"/g, '')
    .replace(/\s+aria-labelledby="[^"]*"/g, '')
    .replace(/#4b3018/gi, 'currentColor')
    .replace(/#211a15/gi, 'currentColor')
}

export const MOTIFS: Record<MotifAfricain, string> = {
  'linear-01': preparer(linear),
  'spiral-02': preparer(spiral),
  'circulaire-03': preparer(circulaire),
  'symetrique-04': preparer(symetrique),
  'lineaire-05': preparer(lineaire),
  'cauri-africain': preparer(cauri),
}

/**
 * Le contenu d'un motif, sans sa balise `<svg>` : il peut ainsi être placé dans un
 * groupe transformé, au sein d'une tuile de ruban.
 */
export function contenuMotif(motif: MotifAfricain): string {
  return MOTIFS[motif].replace(/^<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '')
}
