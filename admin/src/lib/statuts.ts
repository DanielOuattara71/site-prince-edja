import type { StatutContenu } from '@/api/schemas/communs'

/**
 * États affichés d'un contenu (`docs/CONTRAT-API.md` § 7.2, D-18) : les quatre statuts réels,
 * plus deux états **dérivés** que le serveur ne stocke pas.
 * - `programme` : publié avec une date de publication future (RG-05) ;
 * - `a_fournir` : `champsAFournir` non vide.
 */
export type EtatAffiche = StatutContenu | 'programme' | 'a_fournir'

export function etatAffiche(
  statut: StatutContenu,
  publieLe: string | null | undefined,
  maintenant: number = Date.now(),
): Exclude<EtatAffiche, 'a_fournir'> {
  if (statut === 'publie' && publieLe && Date.parse(publieLe) > maintenant) return 'programme'
  return statut
}

/**
 * Actions de la barre de statut, dans l'ordre du circuit (§ 7.3). `publier` depuis un
 * brouillon enchaîne deux appels (soumettre, puis publier) : le contrat l'autorise.
 */
export type ActionStatut =
  'soumettre' | 'publier' | 'refuser' | 'depublier' | 'archiver' | 'desarchiver'

export const ACTIONS_DEPUIS: Record<StatutContenu, ActionStatut[]> = {
  brouillon: ['soumettre', 'publier'],
  en_relecture: ['publier', 'refuser'],
  publie: ['depublier', 'archiver'],
  archive: ['desarchiver'],
}

/** Statut visé par chaque action (`refuser` et `depublier` ramènent au brouillon). */
export const CIBLE_ACTION: Record<ActionStatut, StatutContenu> = {
  soumettre: 'en_relecture',
  publier: 'publie',
  refuser: 'brouillon',
  depublier: 'brouillon',
  archiver: 'archive',
  desarchiver: 'brouillon',
}
