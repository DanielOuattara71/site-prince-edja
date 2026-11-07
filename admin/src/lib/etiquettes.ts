import type { TypeTag } from '@/api/schemas/tags'

/**
 * Étiquettes proposées par formulaire (U8, PROMPT-CORRECTION § 7.6) : chaque formulaire ne
 * montre que les types qui le concernent. Un bijou ne propose donc pas d'étiquette de format
 * (« Article », « Documentaire »…).
 *
 * Tableau unique, aligné sur SCHEMAS : article (§ 4 : format exigé, pays, ville, thème, année,
 * projet). Pour les autres familles, aucun document ne fixe la liste : on garde les types
 * proposés jusqu'ici (format, pays, thème, projet) et on retire seulement le format des produits.
 * Voir `docs/QUESTIONS.md` (Q-C4-1). Quand le back end acceptera `?contexte=` (§ 7.6), ce
 * tableau deviendra le paramètre de la requête.
 */
export type ContexteEtiquettes =
  'article' | 'episode' | 'projet' | 'destination' | 'ville' | 'archive' | 'bijou' | 'livre'

const HISTORIQUES: TypeTag[] = ['format', 'pays', 'theme', 'projet']

export const TYPES_PAR_CONTEXTE: Record<ContexteEtiquettes, TypeTag[]> = {
  article: ['format', 'pays', 'ville', 'theme', 'annee', 'projet'],
  episode: HISTORIQUES,
  projet: HISTORIQUES,
  destination: HISTORIQUES,
  ville: HISTORIQUES,
  archive: HISTORIQUES,
  bijou: ['pays', 'theme', 'projet'],
  livre: ['pays', 'theme', 'projet'],
}
