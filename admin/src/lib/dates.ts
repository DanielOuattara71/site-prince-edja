/**
 * Dates de l'admin : le serveur stocke en UTC, l'admin affiche en `Africa/Abidjan`
 * (`docs/CONTRAT-API.md` § 2), et le dit à côté de toute heure saisie (RG-05).
 */
export const FUSEAU = 'Africa/Abidjan'

const formatDateHeure = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU,
  dateStyle: 'long',
  timeStyle: 'short',
})

const formatDate = new Intl.DateTimeFormat('fr-FR', { timeZone: FUSEAU, dateStyle: 'medium' })

export function formaterDateHeure(iso: string): string {
  return formatDateHeure.format(new Date(iso))
}

export function formaterDate(iso: string): string {
  return formatDate.format(new Date(iso))
}
