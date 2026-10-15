/**
 * Garde-fou de contraste.
 *
 * La palette est déclarée dans `src/styles/globals.css` : ce script en lit les
 * valeurs et recalcule les ratios WCAG des couples réellement utilisés, texte sur
 * fond. Modifier un token sans revoir sa paire fait échouer le build, au lieu de
 * livrer un texte illisible que personne ne remarque avant la mise en ligne.
 *
 * Une paire absente d'ici n'est pas vérifiée : l'ajouter coûte une ligne, l'oubli se
 * paie en lisibilité. Les combinaisons connues comme non textuelles (un filet d'or
 * sur sable) n'y figurent pas : elles ne relèvent pas du ratio de texte.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const css = readFileSync(join(racine, 'src/styles/globals.css'), 'utf8')

/** `--color-nom: #rrvvbb` ; les alias en `var()` sont ignorés, ils ne portent pas de valeur. */
const couleurs = new Map()
for (const [, nom, hex] of css.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-fA-F]{6})\b/g)) {
  couleurs.set(nom, hex.toLowerCase())
}

/**
 * Couples interdits par la direction artistique. Ils ne sont pas « attendus
 * conformes » : ils ne peuvent pas l'être, et les déclarer comme tels ferait échouer le
 * build en permanence. Ils sont donc mesurés, pour que le motif reste écrit et que
 * personne ne réintroduise l'or en texte sur ivoire en croyant innover.
 */
const INTERDITS = [
  ['sand-50', 'gold-400'],
  ['sand-100', 'gold-400'],
  ['sand-150', 'gold-400'],
]

const PAIRES = [
  ['sand-50', ['ink-900', 'ink-700', 'ink-500', 'clay-600', 'leaf-600'], 4.5],
  ['sand-100', ['ink-900', 'ink-700', 'ink-500', 'clay-600', 'leaf-600'], 4.5],
  ['sand-150', ['ink-900', 'ink-700', 'ink-500', 'clay-600', 'leaf-600'], 4.5],
  ['sand-50', ['promo-500'], 4.5],
  ['night-900', ['cream-100', 'gold-400', 'clay-500'], 4.5],
  ['night-800', ['cream-100'], 4.5],
  ['forest-950', ['cream-100', 'gold-400'], 4.5],
  ['forest-900', ['cream-100'], 4.5],
  // Bouton d'action principal : plein crème sur les surfaces nuit.
  ['cream-100', ['ink-900'], 4.5],
]

function canal(valeur) {
  const c = valeur / 255
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
}

function luminance(hex) {
  const n = Number.parseInt(hex.slice(1), 16)
  return (
    0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255)
  )
}

function ratio(a, b) {
  const [clair, sombre] = [luminance(a), luminance(b)].sort((x, y) => y - x)
  return (clair + 0.05) / (sombre + 0.05)
}

for (const [fond, texte] of INTERDITS) {
  const fondHex = couleurs.get(fond)
  const texteHex = couleurs.get(texte)
  if (!fondHex || !texteHex) continue
  console.log(
    `! ${texte} sur ${fond} : interdit en texte`.padEnd(38),
    `${ratio(texteHex, fondHex).toFixed(2)}:1 — l'or reste un matériau (filets, puces)`,
  )
}

const echecs = []
let verifies = 0

for (const [fond, textes, seuil] of PAIRES) {
  const fondHex = couleurs.get(fond)
  if (!fondHex) {
    echecs.push(`fond « ${fond} » absent de la palette`)
    continue
  }

  for (const texte of textes) {
    const texteHex = couleurs.get(texte)
    if (!texteHex) {
      echecs.push(` texte « ${texte} » absent de la palette`)
      continue
    }

    const valeur = ratio(texteHex, fondHex)
    verifies += 1
    const ok = valeur >= seuil
    if (!ok) echecs.push(`${texte} sur ${fond} : ${valeur.toFixed(2)}:1 (minimum ${seuil}:1)`)
    console.log(
      `${ok ? '✓' : '✗'} ${texte} sur ${fond}`.padEnd(34),
      `${valeur.toFixed(2).padStart(6)}:1  (min ${seuil})`,
    )
  }
}

console.log(`\n${verifies} couples vérifiés.`)

if (echecs.length > 0) {
  console.error(`\n${echecs.length} couple(s) sous le seuil :`)
  for (const echec of echecs) console.error(`  - ${echec}`)
  process.exit(1)
}

console.log('Contraste : tous les couples passent.')
