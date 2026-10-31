/**
 * Contrôle du build de production (section 13).
 *
 * Échoue si `dist` contient une trace de MSW, des jeux d'exemple ou des comptes
 * d'essai, ou si le code fait référence à une variable `VITE_*` autre que
 * `VITE_API_URL` (tout ce qui est préfixé `VITE_` finit dans le bundle).
 */
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = fileURLToPath(new URL('..', import.meta.url))
const dist = join(racine, 'dist')
const src = join(racine, 'src')

/** Marqueurs interdits en production. Les mocks (étape 1) portent ces mêmes marqueurs. */
const MARQUEURS = [
  { motif: 'mockServiceWorker', raison: 'service worker MSW' },
  { motif: '[MSW]', raison: 'journal de MSW' },
  { motif: 'setupWorker', raison: 'démarrage de MSW' },
  { motif: '__PE_EXEMPLE__', raison: 'jeu de données d’exemple' },
  { motif: '@exemple.test', raison: 'compte d’essai' },
]

const VARIABLE_AUTORISEE = 'VITE_API_URL'

function fichiers(dossier) {
  return readdirSync(dossier).flatMap((nom) => {
    const chemin = join(dossier, nom)
    return statSync(chemin).isDirectory() ? fichiers(chemin) : [chemin]
  })
}

const erreurs = []

let livres
try {
  livres = fichiers(dist)
} catch {
  console.error('verifier-dist : dossier dist absent. Lancer `npm run build` d’abord.')
  process.exit(1)
}

for (const fichier of livres) {
  const nom = relative(dist, fichier)
  if (nom.includes('mockServiceWorker')) erreurs.push(`${nom} : fichier MSW livré`)
  if (!/\.(js|css|html|json|txt|map|svg)$/.test(nom)) continue
  const contenu = readFileSync(fichier, 'utf8')
  for (const { motif, raison } of MARQUEURS) {
    if (contenu.includes(motif)) erreurs.push(`${nom} : ${raison} (« ${motif} »)`)
  }
  for (const [variable] of contenu.matchAll(/VITE_[A-Z0-9_]+/g)) {
    if (variable !== VARIABLE_AUTORISEE) erreurs.push(`${nom} : variable ${variable}`)
  }
}

for (const fichier of fichiers(src)) {
  if (!/\.(ts|tsx)$/.test(fichier) || /\.test\.tsx?$/.test(fichier)) continue
  const contenu = readFileSync(fichier, 'utf8')
  for (const [variable] of contenu.matchAll(/VITE_[A-Z0-9_]+/g)) {
    if (variable !== VARIABLE_AUTORISEE) {
      erreurs.push(`${relative(racine, fichier)} : variable ${variable} interdite`)
    }
  }
}

if (erreurs.length > 0) {
  console.error(`verifier-dist : ${erreurs.length} problème(s)\n- ${erreurs.join('\n- ')}`)
  process.exit(1)
}

console.log(`verifier-dist : ${livres.length} fichiers contrôlés, aucune trace interdite.`)
