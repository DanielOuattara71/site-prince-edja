export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

/**
 * Un montant en francs CFA : séparateur de milliers insécable, suffixe espacé,
 * aucune décimale. À préférer à tout `toLocaleString` isolé dans un composant.
 */
export function formatFCFA(montant: number): string {
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(montant)}\u202fFCFA`
}

/** Un compteur de chapitrage : `03 / 07`. */
export function formatChapitre(index: number, total: number): string {
  const deux = (n: number) => String(n).padStart(2, '0')
  return `${deux(index + 1)} / ${deux(total)}`
}
