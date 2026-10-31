import axe from 'axe-core'

/**
 * Audit axe d'un conteneur rendu en jsdom. Renvoie les violations sérieuses et
 * critiques (seuil de la section 13). Le contraste n'est pas mesurable sans moteur
 * de rendu : il est vérifié par Playwright et par les jetons du site public.
 */
export async function violationsGraves(conteneur: Element): Promise<axe.Result[]> {
  const resultat = await axe.run(conteneur, {
    rules: { 'color-contrast': { enabled: false } },
  })
  return resultat.violations.filter(
    (violation) => violation.impact === 'serious' || violation.impact === 'critical',
  )
}
