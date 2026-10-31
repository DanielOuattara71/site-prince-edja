import { corpsRicheSchema, type NoeudRiche } from '@/api/schemas/corps-riche'
import { t } from '@/i18n/fr'

/**
 * Comparaison simple « avant / après » de deux versions d'un objet (section 10,
 * `HistoriqueVersions`) : liste des chemins dont la valeur diffère, avec une valeur lisible.
 * Les champs techniques (version, dates, champs calculés) sont ignorés.
 */
const IGNORES = new Set([
  'version',
  'modifieLe',
  'creeLe',
  'champsAFournir',
  'languesPresentes',
  'usages',
  'declinaisons',
])

export interface Difference {
  chemin: string
  avant: string
  apres: string
}

function texteDuCorps(noeuds: NoeudRiche[] | undefined): string {
  return (noeuds ?? [])
    .map((noeud) => noeud.text ?? texteDuCorps(noeud.content))
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Valeur affichable : un corps riche devient son texte, une liste ses éléments. */
export function valeurLisible(valeur: unknown): string {
  if (valeur === null || valeur === undefined || valeur === '') return '—'
  if (typeof valeur === 'boolean') return valeur ? t('commun.oui') : t('commun.non')
  if (typeof valeur === 'string' || typeof valeur === 'number') return String(valeur)
  const corps = corpsRicheSchema.safeParse(valeur)
  if (corps.success) return texteDuCorps(corps.data.content) || '—'
  if (Array.isArray(valeur)) return valeur.map(valeurLisible).join(', ') || '—'
  return JSON.stringify(valeur)
}

function aplatir(valeur: unknown, prefixe: string, sortie: Map<string, unknown>) {
  const estObjet = typeof valeur === 'object' && valeur !== null && !Array.isArray(valeur)
  if (estObjet && !corpsRicheSchema.safeParse(valeur).success) {
    for (const [cle, enfant] of Object.entries(valeur)) {
      if (IGNORES.has(cle)) continue
      aplatir(enfant, prefixe ? `${prefixe}.${cle}` : cle, sortie)
    }
  } else {
    sortie.set(prefixe, valeur)
  }
}

export function comparer(avant: unknown, apres: unknown): Difference[] {
  const a = new Map<string, unknown>()
  const b = new Map<string, unknown>()
  aplatir(avant, '', a)
  aplatir(apres, '', b)
  const chemins = [...new Set([...a.keys(), ...b.keys()])].sort()
  return chemins
    .map((chemin) => ({
      chemin,
      avant: valeurLisible(a.get(chemin)),
      apres: valeurLisible(b.get(chemin)),
    }))
    .filter((difference) => difference.avant !== difference.apres)
}
