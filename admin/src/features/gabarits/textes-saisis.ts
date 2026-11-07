/**
 * Tous les textes saisis d'un formulaire, à plat (« Copier mon texte » d'un conflit de version) :
 * chaque chaîne non vide, précédée de son chemin, pour que rien ne se perde au rechargement.
 */
export function textesDe(valeurs: unknown, chemin = ''): string {
  if (typeof valeurs === 'string') return valeurs.trim() ? `${chemin}\n${valeurs.trim()}\n` : ''
  if (Array.isArray(valeurs)) return valeurs.map((v, i) => textesDe(v, `${chemin}[${i}]`)).join('')
  if (valeurs && typeof valeurs === 'object') {
    return Object.entries(valeurs as Record<string, unknown>)
      .map(([cle, v]) => textesDe(v, chemin ? `${chemin}.${cle}` : cle))
      .join('')
  }
  return ''
}
