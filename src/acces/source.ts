/**
 * Source des données du site (PLAN-DE-LANCEMENT S2 ; LIAISON § C.2).
 *
 * - `PUBLIC_DATA_SOURCE=api` : les JSON que `npm run charger` a écrits depuis l'API publique
 *   (`src/data/generated/`, contrat 1.5.0 § 18.1). `vite.config.ts` refuse de construire s'ils
 *   manquent : jamais un site à moitié vide.
 * - sinon (par défaut, et donc en CI aujourd'hui) : les données de départ de `src/data/`.
 *
 * Tout est lu **à la construction** : aucun appel à l'API pendant l'affichage.
 */
export const SOURCE_API = import.meta.env.PUBLIC_DATA_SOURCE === 'api'

// Hors mode API, rien n'est importé : un dossier `generated/` resté sur le disque ne pèse rien.
const GENERES: Record<string, unknown> = SOURCE_API
  ? import.meta.glob('../data/generated/*.json', { eager: true, import: 'default' })
  : {}

/** Contenu d'un fichier chargé (`articles`, `categories-produit`…), déjà validé par le chargeur. */
export function lireGenere<T>(nom: string): T {
  const valeur = GENERES[`../data/generated/${nom}.json`]
  if (valeur === undefined) {
    throw new Error(
      `Données « ${nom} » absentes : lancer \`npm run charger\` avant une construction en mode API.`,
    )
  }
  return valeur as T
}
