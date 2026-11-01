/**
 * Formats d'affichage partagés avec le site public (`src/lib/format.ts` du dépôt) : l'aperçu
 * montre exactement ce que le site affichera.
 */

/** Un montant en francs CFA : séparateur de milliers insécable, aucune décimale. */
export function formatFCFA(montant: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(montant)} FCFA`
}
