/**
 * Résolveur unique des images servies par le dépôt (`public/images/`).
 *
 * Développement et build par défaut : chemin local sous la base du site
 * (`${BASE_URL}images/…`), exactement comme avant. Pour la mise en ligne :
 * **`PUBLIC_IMAGES_BASE_URL`** (adresse du dossier Cloudinary du site, p. ex.
 * `https://res.cloudinary.com/<cloud>/image/upload/prince-edja/site`) redirige tous les
 * visuels vers le CDN — les fichiers **restent dans `public/images/`** (repli local,
 * régénération, exemples). Jamais les deux : sans la variable, le site se comporte
 * comme hier. Le push des fichiers se fait avec `scripts/pousser-images-cloudinary.mjs`
 * le jour de la mise en ligne (voir `docs/IMAGES-CLOUDINARY.md`).
 */
const BASE_CLOUDINARY = import.meta.env.PUBLIC_IMAGES_BASE_URL?.trim().replace(/\/+$/, '')

export const img = (chemin: `images/${string}`): string =>
  BASE_CLOUDINARY ? `${BASE_CLOUDINARY}/${chemin.slice('images/'.length)}` : `${import.meta.env.BASE_URL}${chemin}`

