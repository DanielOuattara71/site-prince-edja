// @vitest-environment node
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/** Bloc `@theme` suivi de la couche sémantique `:root`, tel qu'il figure dans le fichier. */
function blocJetons(css: string): string {
  const debut = css.indexOf('@theme {')
  const racine = css.indexOf(':root {', debut)
  const fin = css.indexOf('\n}\n', racine)
  if (debut < 0 || racine < 0 || fin < 0) throw new Error('Bloc de jetons introuvable.')
  return css.slice(debut, fin + 2)
}

const lire = (chemin: string) =>
  readFileSync(fileURLToPath(new URL(chemin, import.meta.url)), 'utf8')

describe('jetons du design system', () => {
  it('reprennent à l’identique ceux du site public', () => {
    const admin = lire('../styles/globals.css')
    const sitePublic = lire('../../../src/styles/globals.css')
    expect(blocJetons(admin)).toBe(blocJetons(sitePublic))
  })
})
