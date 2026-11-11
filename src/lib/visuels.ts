/**
 * Chemins des visuels de la boutique.
 *
 * Convention unique : `` `${BASE_URL}images/boutique/<slug>.jpg` `` pour la pièce,
 * `` `${BASE_URL}images/boutique/portes/<slug>.jpg` `` pour son porté.
 *
 * Les photographies de porté **n'existent pas encore**. Plutôt que de les déclarer en
 * données (ce qui produirait une URL 404 à chaque visite), la convention est ici, et
 * le composant `PorteePiece` demande l'image puis se replie sur le visuel produit au
 * premier échec. Déposer les fichiers au bon nom suffit à les faire apparaître :
 * aucun code ni aucune donnée à modifier.
 */

import { SITE } from '@/acces/site'

/**
 * Sources alternatives d'une image de contenu.
 *
 * Les visuels livrés font jusqu'à 554 Ko : les servir tels quels à un téléphone de
 * 390 px est un gaspillage de plusieurs centaines de kilooctets. Chaque image possège
 * une déclinaison à 640 px (`<nom>-640.jpg`, générée par `npm run images`), et ce
 * helper construit le `srcset` à partir du chemin — il n'y a donc rien à dupliquer
 * dans les données.
 *
 * Sans déclinaison disponible, la fonction renvoie `undefined` : le navigateur se
 * contente alors de l'image source, comme avant.
 */
export const srcsetContenu = (src: string): string | undefined =>
  src.endsWith('.jpg') ? `${src.replace(/\.jpg$/, '-640.jpg')} 640w, ${src} 1600w` : undefined

/** `sizes` d'une carte de contenu : pleine largeur sur mobile, colonne de grille au-delà. */
export const SIZES_CARTE = '(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 352px'

/** `sizes` d'un visuel de héros ou de grande image. */
export const SIZES_LARGE = '(max-width: 1024px) 100vw, 1024px'

/** Visuel de la pièce, sur fond neutre. */
export const visuelPiece = (slug: string): string =>
  `${import.meta.env.BASE_URL}images/boutique/${slug}.jpg`

/** Emplacement réservé à la photographie de porté. */
export const visuelPorte = (slug: string): string =>
  `${import.meta.env.BASE_URL}images/boutique/portes/${slug}.jpg`

/**
 * Visuel de test unique des cartes produit.
 *
 * Il remplace temporairement les visuels template de toutes les cartes du rail et
 * du catalogue, pour juger la page avec une vraie photographie. Les fiches produit
 * et la section « Le porté » ne l'utilisent pas. À retirer dès que les photos de la
 * collection sont livrées.
 */
export const VISUEL_TEST_CARTE = `${import.meta.env.BASE_URL}images/journal/raconter-pour-exister.jpg`
export const ALT_TEST_CARTE = 'Visuel de test : Prince Edja portant des bagues et parures dorées.'

/**
 * Photographie de couverture du hero.
 *
 * On réutilise le portrait déjà présent sur la page d'accueil (`SITE.heroImage`).
 * Le fichier étant déjà au cache du navigateur, la boutique ne le paie pas deux
 * fois. Les deux largeurs sont celles du hero : un téléphone ne télécharge pas
 * la version grand écran.
 */
export const visuelCouverture = SITE.heroImage
export const visuelCouvertureSrcSet = SITE.heroSrcSet
export const visuelCouvertureSizes = SITE.heroSizes
