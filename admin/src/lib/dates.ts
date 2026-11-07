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

const formatHeure = new Intl.DateTimeFormat('fr-FR', {
  timeZone: FUSEAU,
  hour: '2-digit',
  minute: '2-digit',
})

/** « 14:32 » (heure d'Abidjan) : indicateur « Enregistré à » (U6). */
export function formaterHeure(iso: string): string {
  return formatHeure.format(new Date(iso))
}

/** Instant présent, en ISO (appelé dans un gestionnaire, jamais pendant le rendu). */
export function maintenantIso(): string {
  return new Date().toISOString()
}
