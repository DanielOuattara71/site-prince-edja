export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

/** Un montant en francs CFA : séparateur de milliers insécable, aucune décimale. */
export function formatFCFA(montant: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(montant)} FCFA`
}

/** Un compteur de chapitrage : `02 / 10`. */
export function formatChapitre(index: number, total: number): string {
  const deux = (n: number) => String(n).padStart(2, '0')
  return `${deux(index + 1)} / ${deux(total)}`
}

/** Nombre lisible, sans décimale : 600000 devient 600 000. */
export function formatNombre(valeur: number): string {
  return new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(valeur)
}
