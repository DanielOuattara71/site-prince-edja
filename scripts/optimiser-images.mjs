/**
 * Optimisation des images de contenu.
 *
 * Les visuels livrés arrivent souvent en PNG de plusieurs mégaoctets : le site en
 * servait 47 Mo. Ce script convertit chaque PNG au-delà d'un seuil en JPEG (et
 * WebP si demandé), à 1920 px de large au plus, puis remplace la référence dans
 * les sources.
 *
 *   node scripts/optimiser-images.mjs <dossier> [--webp] [--seuil-ko 100]
 *
 * Exemple : node scripts/optimiser-images.mjs public/images/journal --webp
 *
 * Les PNG conservent leur transparence (logo, curseur) : ils ne passent pas par ce
 * script, qui ne traite que les dossiers de contenu qu'on lui donne.
 */
import { readdirSync, statSync, rmSync, existsSync, readFileSync, writeFileSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import sharp from 'sharp'

const args = process.argv.slice(2)
const dossier = args.find((a) => !a.startsWith('--'))

if (!dossier) {
  console.error('Usage : node scripts/optimiser-images.mjs <dossier> [--webp] [--seuil-ko 100]')
  process.exit(1)
}

const seuil = Number(args[args.indexOf('--seuil-ko') + 1] ?? 100) * 1024
const avecWebp = args.includes('--webp')
const racine = process.cwd()

/** Références dans les sources : elles doivent suivre le changement d'extension. */
function majReferences(avant, apres) {
  const sources = ['src']
  for (const base of sources) {
    for (const fichier of lister(base)) {
      if (!/\.(ts|tsx)$/.test(fichier)) continue
      const contenu = readFileSync(fichier, 'utf8')
      if (!contenu.includes(avant)) continue
      writeFileSync(fichier, contenu.split(avant).join(apres), 'utf8')
      console.log(`  référence mise à jour : ${fichier}`)
    }
  }
}

function* lister(base) {
  if (!existsSync(base)) return
  for (const entree of readdirSync(base)) {
    const chemin = join(base, entree)
    if (statSync(chemin).isDirectory()) yield* lister(chemin)
    else yield chemin
  }
}

let economie = 0
let convertis = 0

for (const fichier of lister(dossier)) {
  if (extname(fichier).toLowerCase() !== '.png') continue
  if (statSync(fichier).size < seuil) {
    console.log(`conservé (sous le seuil) : ${fichier}`)
    continue
  }

  const base = fichier.replace(/\.png$/i, '')
  const image = sharp(fichier).resize(1920, null, { withoutEnlargement: true })

  const info = await image.clone().jpeg({ quality: 82, mozjpeg: true, progressive: true })
    .toFile(`${base}.jpg`)
  if (avecWebp) {
    await sharp(fichier).resize(1920, null, { withoutEnlargement: true })
      .webp({ quality: 82 })
      .toFile(`${base}.webp`)
  }

  const avant = statSync(fichier).size
  rmSync(fichier)
  majReferences(
    join(dirname(fichier), fichier.split('/').pop().replace(/\.png$/i, '.png')).replace(racine + '/', ''),
    `${dirname(fichier).replace(racine + '/', '')}/${fichier.split('/').pop().replace(/\.png$/i, '.jpg')}`,
  )

  economie += avant - info.size
  convertis += 1
  console.log(
    `${fichier.split('/').pop()} : ${(avant / 1048576).toFixed(2)} Mo → ${(info.size / 1024).toFixed(0)} Ko`,
  )
}

console.log(`\n${convertis} fichier(s) converti(s), ${(economie / 1048576).toFixed(1)} Mo économisés.`)
