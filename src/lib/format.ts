export function formatDate(date: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

/** Formate un prix en FCFA (fr-FR, séparateurs de milliers) */
export function formatPrice(prix: number): string {
  return `${new Intl.NumberFormat('fr-FR').format(prix)} FCFA`
}
