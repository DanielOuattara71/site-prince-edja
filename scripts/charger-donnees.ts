/**
 * Chargeur de données du site public (LIAISON § C.2 ; PLAN-DE-LANCEMENT S2 ; contrat 1.5.0 § 18.1).
 *
 * Lit l'API publique **au moment de la construction**, valide chaque réponse avec Zod et écrit un
 * JSON par famille dans `src/data/generated/`. Le site les lit par sa couche d'accès (`src/acces/`)
 * quand `PUBLIC_DATA_SOURCE=api` ; sinon il garde ses données de départ (`src/data/`).
 *
 *   PUBLIC_API_URL=http://127.0.0.1:3000 npm run charger
 *   PUBLIC_DATA_SOURCE=api npm run build
 *
 * Un appel en échec ou une réponse qui ne ressemble pas au contrat **arrête tout** : jamais un site
 * à moitié vide (LIAISON § C.2). Seules les adresses publiques sont appelées : aucun secret ici.
 * Le cœur du chargeur vit dans `charger-donnees.core.ts` (testable, F1).
 */
import { resolve } from 'node:path'
import { chargerDepuisApi } from './charger-donnees.core.ts'

const API = (process.env['PUBLIC_API_URL'] ?? '').trim().replace(/\/+$/, '')
if (!API) {
  console.error('PUBLIC_API_URL manquante : l’adresse de l’API publique est requise.')
  process.exit(1)
}
const LANGUE = (process.env['PUBLIC_LANGUES'] ?? 'fr').split(',')[0]?.trim() || 'fr'
const DOSSIER = resolve('src/data/generated')

try {
  const rapport = await chargerDepuisApi({ api: API, langue: LANGUE, dossier: DOSSIER })
  console.log(`Données chargées depuis ${rapport.source} (${rapport.langue}) :`, rapport.comptes)
} catch (erreur) {
  console.error(erreur instanceof Error ? erreur.message : erreur)
  process.exit(1)
}
