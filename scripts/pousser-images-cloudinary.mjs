/**
 * Pousse `public/images/` sur Cloudinary (dossier `<DOSSIER>/site/<chemin relatif>`).
 *
 *   CLOUDINARY_CLOUD_NAME=… CLOUDINARY_API_KEY=… CLOUDINARY_API_SECRET=… \
 *     node scripts/pousser-images-cloudinary.mjs            # dépose, ignore les existants
 *     node scripts/pousser-images-cloudinary.mjs --ecrase   # remplace tout (invalidate Cloudinary)
 *     node scripts/pousser-images-cloudinary.mjs --verifier # après envoi : HEAD de chaque URL
 *
 * Idempotent par défaut : une seconde exécution ne dépose rien de nouveau, ne touche à rien
 * d'autre sur le compte. `--ecrase` est réservé au remplacement de placeholders par les vraies
 * photographies (les navigateurs reçoivent une nouvelle image, le cache Cloudinary est invalidé).
 *
 * Aucune dépendance : `fetch` et `node:crypto`. Aucune clé ne vit dans le dépôt ni dans les
 * journaux — un échec n'affiche jamais l'URL signée ni le secret.
 */
import { readdir, readFile } from 'node:fs/promises'
import { createHash } from 'node:crypto'
import { join, relative, extname, sep } from 'node:path'

const ECRASE = process.argv.includes('--ecrase')
const VERIFIER = process.argv.includes('--verifier')
const DOSSIER = (process.env.CLOUDINARY_DOSSIER ?? 'prince-edja').trim().replace(/^\/+|\/+$/g, '')

const MANQUANTS = ['CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET'].filter(
  (n) => !process.env[n]?.trim(),
)
if (MANQUANTS.length > 0) {
  console.error(`Secrets manquants : ${MANQUANTS.join(', ')}`)
  console.error('Créez le compte Cloudinary (docs/IMAGES-CLOUDINARY.md), puis relancez.')
  process.exit(1)
}

const CLOUD = process.env.CLOUDINARY_CLOUD_NAME.trim()
const API_KEY = process.env.CLOUDINARY_API_KEY.trim()
const API_SECRET = process.env.CLOUDINARY_API_SECRET.trim()
const RACINE = new URL('..', import.meta.url).pathname
const SOURCE = join(RACINE, 'public', 'images')
const CLOUD_DIR = `${DOSSIER}/site`

const TYPES = new Map([
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
  ['.webp', 'image/webp'],
  ['.svg', 'image/svg+xml'],
  ['.gif', 'image/gif'],
])

/** Signature Cloudinary : SHA-1 de `nom=valeur&…` trié par nom, suffex du secret. */
function signature(parametres, secret) {
  const chaine = Object.entries(parametres)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([nom, valeur]) => `${nom}=${valeur}`)
    .join('&')
  return createHash('sha1')
    .update(chaine + secret)
    .digest('hex')
}

const urlPublique = (cheminRelatif) => {
  const cle = cheminRelatif.replace(/\.[^./]+$/, '')
  return `https://res.cloudinary.com/${CLOUD}/image/upload/${CLOUD_DIR}/${cle}`
}

async function deposer(cheminRelatif, contenu, type) {
  const publicId = `${CLOUD_DIR}/${cheminRelatif.replace(/\.[^./]+$/, '')}`
  const timestamp = String(Math.floor(Date.now() / 1000))
  const parametres = {
    public_id: publicId,
    timestamp,
    overwrite: ECRASE ? 'true' : 'false',
    ...(ECRASE ? { invalidate: 'true' } : {}),
  }
  const corps = new FormData()
  corps.append('file', new Blob([contenu], { type }), cheminRelatif.split('/').pop())
  corps.append('api_key', API_KEY)
  for (const [nom, valeur] of Object.entries(parametres)) corps.append(nom, valeur)
  corps.append('signature', signature(parametres, API_SECRET))
  const reponse = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`, {
    method: 'POST',
    body: corps,
    signal: AbortSignal.timeout(60_000),
  })
  if (reponse.ok) return 'ok'
  // Cloudinary refuse avec 400 « already exists » quand overwrite=false : c'est le comportement
  // attendu d'une ré-exécution, pas une panne.
  const corpsReponse = await reponse.json().catch(() => null)
  const message = String(corpsReponse?.error?.message ?? '')
  if (!ECRASE && /exist/i.test(message)) return 'existant'
  return 'echec'
}

const fichiers = []
async function balayer(dossier) {
  for (const entree of await readdir(dossier, { withFileTypes: true })) {
    const cheminComplet = join(dossier, entree.name)
    if (entree.isDirectory()) await balayer(cheminComplet)
    else if (TYPES.has(extname(entree.name).toLowerCase())) fichiers.push(cheminComplet)
  }
}
await balayer(SOURCE)

let deposes = 0
let ignores = 0
const echecs = []
for (const chemin of fichiers) {
  const relatif = relative(SOURCE, chemin).split(sep).join('/')
  const contenu = await readFile(chemin)
  const type = TYPES.get(extname(chemin).toLowerCase()) ?? 'application/octet-stream'
  try {
    const verdict = await deposer(relatif, contenu, type)
    if (verdict === 'ok') {
      if (ECRASE) { deposes += 1; console.log(`remplacé  ${relatif}`) } else { ignores += 1 }
    } else if (verdict === 'existant') {
      ignores += 1
    } else {
      echecs.push(relatif)
      console.error(`ÉCHEC      ${relatif}`)
    }
  } catch {
    echecs.push(relatif)
    console.error(`ÉCHEC      ${relatif}`)
  }
}

console.log(`\n${fichiers.length} fichier(s) dans public/images/`)
if (ECRASE) console.log(`images remplacées : ${deposes}`)
else console.log(`déposés ou déjà présents : ${ignores}, échecs : ${echecs.length}`)
if (echecs.length > 0) {
  console.error(`${echecs.length} échec(s) — relancez après correction.`)
  process.exitCode = 1
} else if (VERIFIER) {
  console.log('Vérification des URLs publiques…')
  let inaccessibles = 0
  for (const chemin of fichiers) {
    const relatif = relative(SOURCE, chemin).split(sep).join('/')
    const reponse = await fetch(urlPublique(relatif), { method: 'HEAD', signal: AbortSignal.timeout(15_000) })
    if (!reponse.ok) { inaccessibles += 1; console.error(`INACCESSIBLE ${urlPublique(relatif)} (${reponse.status})`) }
  }
  console.log(inaccessibles === 0 ? 'Toutes les URLs répondent.' : `${inaccessibles} URL(s) inaccessible(s).`)
  if (inaccessibles > 0) process.exitCode = 1
}
