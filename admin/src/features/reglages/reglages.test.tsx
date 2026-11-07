import { render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { navigation, parametres, textesInterface } from '@/api/endpoints/reglages'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'
import { violationsGraves } from '@/test/axe'

/**
 * Lot 4 (§ 13.3, § 13.4, § 13.5) : les réglages singletons du site — lecture, refus d’une
 * écriture sensible, remplacement de la navigation, évolution du dictionnaire, et les trois
 * écrans branchés (rendu + axe).
 */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))
beforeEach(async () => {
  await connecter('admin')
})

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}

describe('lot 4 — réglages singletons', () => {
  it('la vente en ligne reste fermée ; les durées de conservation se modifient', async () => {
    const parametresActuels = await parametres.lire()
    expect(parametresActuels.boutiqueEnLigne).toBe(false)

    const refusVente = await parametres
      .modifier({ boutiqueEnLigne: true, version: parametresActuels.version })
      .then(
        () => null,
        (e: unknown) => e,
      )
    // Un champ super-admin glissé dans une écriture admin est refusé avant la validation (RG-16).
    expect((refusVente as { code?: string } | null)?.code).toBe('DROIT_INSUFFISANT')

    const modification = await parametres.modifier({
      conservationMessagesMois: 24,
      version: parametresActuels.version,
    })
    expect(modification.version).toBe(parametresActuels.version + 1)
  })

  it('la navigation se lit et se remplace en entier', async () => {
    const documentActuel = await navigation.lire()
    expect(documentActuel.version).toBe(1)
    const modifie = await navigation.modifier({
      principale: [
        {
          id: 'nav-exemple',
          libelle: { fr: 'Exemple', en: 'Example' },
          cible: { type: 'page', cle: 'histoires' },
          enfants: [],
        },
      ],
      ctaPrincipal: {
        libelle: { fr: 'Voir l’exemple', en: 'See the example' },
        cible: { type: 'page', cle: 'histoires' },
      },
      piedDePage: [],
      entrees404: [],
      version: documentActuel.version,
    })
    expect(modifie.version).toBe(2)
    expect(modifie.principale).toHaveLength(1)
  })

  it('les textes d’interface évoluent ; une valeur connue est persistée', async () => {
    const avant = await textesInterface.lire()
    const modifie = await textesInterface.modifier({
      valeurs: { 'nav.ouvrirMenu': { fr: 'Ouvrir le menu', en: 'Open menu' } },
      version: avant.version,
    })
    expect(modifie.version).toBe(avant.version + 1)
    expect(modifie.valeurs['nav.ouvrirMenu']?.fr).toBe('Ouvrir le menu')
  })
})

describe('lot 4 — écrans singletons', () => {
  it('/parametres s’affiche sans violation sérieuse', async () => {
    const { container, unmount } = await ouvrir('admin', '/parametres')
    expect(await screen.findByRole('heading', { level: 1, name: 'Réglages du site' })).toBeTruthy()
    expect(await violationsGraves(container)).toEqual([])
    unmount()
  })

  // Écran retiré du menu et des routes (C2) : test conservé, décision en C9 (docs/ELEMENTS-RETIRES.md).
  it.skip('/navigation s’affiche sans violation sérieuse', async () => {
    const { container, unmount } = await ouvrir('admin', '/navigation')
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Navigation du site' }),
    ).toBeTruthy()
    expect(await violationsGraves(container)).toEqual([])
    unmount()
  })

  // Écran retiré du menu et des routes (C2) : test conservé, décision en C9 (docs/ELEMENTS-RETIRES.md).
  it.skip('/textes-interface s’affiche sans violation sérieuse', async () => {
    const { container, unmount } = await ouvrir('admin', '/textes-interface')
    expect(
      await screen.findByRole('heading', { level: 1, name: /Textes d’interface/ }),
    ).toBeTruthy()
    expect(await violationsGraves(container)).toEqual([])
    unmount()
  })
})
