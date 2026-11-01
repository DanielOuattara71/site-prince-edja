/**
 * Slug depuis un titre (RG-04) : minuscules, sans accent, mots séparés par des tirets, 120
 * caractères au plus. Même règle que le serveur (`prince-edja-api`, `slugifier`) : l'adresse
 * proposée pendant la saisie est celle que le serveur aurait produite.
 */
export function slugifier(texte: string): string {
  return texte
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 120)
    .replace(/-+$/g, '')
}
