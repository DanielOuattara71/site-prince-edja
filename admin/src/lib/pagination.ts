/**
 * Tailles de page des listes de l'admin (ECRANS § 0.2, SCHEMAS § 12.1) : 20 par défaut, 50 ou
 * 100 au choix. Une valeur d'adresse inconnue retombe sur 20.
 */
export const TAILLES_PAGE = [20, 50, 100] as const

export function taillePage(valeur: string | null | undefined): number {
  const n = Number(valeur)
  return (TAILLES_PAGE as readonly number[]).includes(n) ? n : TAILLES_PAGE[0]
}

/** Numéro de page lu dans l'adresse : entier ≥ 1, sinon 1. */
export function numeroPage(valeur: string | null | undefined): number {
  const n = Number(valeur)
  return Number.isInteger(n) && n >= 1 ? n : 1
}
