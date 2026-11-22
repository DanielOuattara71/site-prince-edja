/**
 * Chemins des visuels de la boutique.
 *
 * Convention unique : `` img(`images/boutique/<slug>.jpg`) `` pour la pièce,
 * `` img(`images/boutique/portes/<slug>.jpg`) `` pour son porté.
 *
 * Les photographies de porté **n'existent pas encore**. Plutôt que de les déclarer en
 * données (ce qui produirait une URL 404 à chaque visite), la convention est ici, et
 * le composant `PorteePiece` demande l'image puis se replie sur le visuel produit au
 * premier échec. Déposer les fichiers au bon nom suffit à les faire apparaître :
 * aucun code ni aucune donnée à modifier.
 */
import { photoFixe, srcsetFixe } from '@/acces/photos'
import { img } from '@/lib/images'

import { SITE } from '@/acces/site'

/**
 * Sources alternatives d'une image de contenu.
 *
 * Les visuels statiques du dépôt font jusqu'à 554 Ko : les servir tels quels à un téléphone de
 * 390 px est un gaspillage de plusieurs centaines de kilooctets. Chacun possède une déclinaison
 * à 640 px (`<nom>-640.jpg`, générée par `npm run images`), et ce helper construit le `srcset` à
 * partir du chemin — il n'y a donc rien à dupliquer dans les données.
 *
 * Les médias servis par l'API sont des URL absolues avec leurs propres déclinaisons WebP
 * (480/960/1600) : en leur appliquant `-640.jpg`, on fabriquerait une URL inexistante (404, image
 * vide). Pour eux, on ne renvoie rien et le navigateur utilise l'image source.
 */
export const srcsetContenu = (src: string): string | undefined => {
  if (!src.endsWith('.jpg') || /^https?:\/\//.test(src)) return undefined
  return `${src.replace(/\.jpg$/, '-640.jpg')} 640w, ${src} 1600w`
}

/** `sizes` d'une carte de contenu : pleine largeur sur mobile, colonne de grille au-delà. */
export const SIZES_CARTE = '(max-width: 640px) 92vw, (max-width: 1024px) 46vw, 352px'

/** `sizes` d'un visuel de héros ou de grande image. */
export const SIZES_LARGE = '(max-width: 1024px) 100vw, 1024px'

/** Visuel de la pièce, sur fond neutre. */
export const visuelPiece = (slug: string): string =>
  img(`images/boutique/${slug}.jpg`)

/** Emplacement réservé à la photographie de porté. */
export const visuelPorte = (slug: string): string =>
  img(`images/boutique/portes/${slug}.jpg`)

/**
 * Visuel de test unique des cartes produit.
 *
 * Il remplace temporairement les visuels template de toutes les cartes du rail et
 * du catalogue, pour juger la page avec une vraie photographie. Les fiches produit
 * et la section « Le porté » ne l'utilisent pas. À retirer dès que les photos de la
 * collection sont livrées.
 */
export const VISUEL_TEST_CARTE = img(`images/journal/raconter-pour-exister.jpg`)
export const ALT_TEST_CARTE = 'Visuel de test : Prince Edja portant des bagues et parures dorées.'

/**
 * Photographie de couverture du hero.
 *
 * L'emplacement « Boutique — bandeau » (contrat § 22.4) prime : la maison peut remplacer
 * l'image depuis le CMS sans redéployer de fichier. Tant que le slot est vide, l'image du
 * hero d'accueil (« Accueil — héros ») reste rendue — elle est déjà au cache du navigateur.
 */
const bandeaux = photoFixe('boutique.bandeau')
/**
 * Couverture de template pour une page de projet sans image validée par la maison.
 * C'est le visuel générique du site — jamais une photo attribuée au projet.
 */
export const VISUEL_COUVERTURE_PROJET = img(`images/hero/hero-prince-edja-2000.jpg`)

/**
 * Couverture d'un projet (bandeau renseigné dans l'admin, sinon son affiche, sinon le
 * visuel générique). Les pages dédiées historiques — `/xplore`, `/taste-and-travel`,
 * `/archive-afrique` — l'utilisent pour afficher la vraie image du projet au lieu du
 * visuel de remplacement codé en dur qu'elles avaient au départ.
 */
export function couvertureProjet(projet: { bandeau?: string; image?: string } | undefined): string {
  return projet?.bandeau || projet?.image || VISUEL_COUVERTURE_PROJET
}
export const visuelCouverture = bandeaux?.url ?? SITE.heroImage
export const visuelCouvertureSrcSet = bandeaux ? srcsetFixe(bandeaux) : SITE.heroSrcSet
export const visuelCouvertureSizes = SITE.heroSizes
