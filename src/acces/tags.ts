/**
 * Étiquettes publiques (contrat 1.20.0 § 37.3) : le vocabulaire de la maison, lu depuis
 * `etiquettes.json` à la construction. Les codes restent la clé dans les contenus ; le libellé
 * administrable sert à l'affichage et à la recherche. Un code inconnu reste tel quel.
 */
import { lireGenere, SOURCE_API } from './source'

export interface Etiquette {
  id: string
  code: string
  type: string
  libelle: string
}

const ETIQUETTES: Etiquette[] = SOURCE_API ? lireGenere<Etiquette[]>('etiquettes') : []
const PAR_CODE = new Map(ETIQUETTES.map((e) => [e.code, e]))

export const etiquettes = ETIQUETTES

/** Libellé d'un code d'étiquette, avec repli sur le code lui-même. */
export function libelleTag(code: string | null | undefined): string {
  if (!code) return ''
  return PAR_CODE.get(code)?.libelle ?? code
}

/** Codes et libellés d'un type, pour les filtres. */
export function etiquettesDuType(type: string): Etiquette[] {
  return ETIQUETTES.filter((e) => e.type === type)
}
