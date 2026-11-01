import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app/App'
import { medias } from '@/api/endpoints/contenus'
import { ErreurApi } from '@/api/erreurs'
import { mediasInitiaux } from '@/api/mocks/donnees'
import { IDS_EXEMPLE } from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'
import { violationsGraves } from '@/test/axe'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'

/** Étape 5 : médiathèque (section 9) — envoi, description, usages, suppression refusée. */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}
const grille = () => screen.findByRole('list', { name: 'Médias' })

describe('grille', () => {
  it('filtre « à fournir » dans l’adresse ; aucune violation axe', async () => {
    const { container } = await ouvrir('editeur', '/medias')
    expect(within(await grille()).getAllByRole('listitem')).toHaveLength(2)
    fireEvent.click(screen.getByLabelText(/Seulement les contenus « à fournir »/))
    await waitFor(() => expect(window.location.search).toContain('aFournir=true'))
    await waitFor(async () =>
      expect(within(await grille()).getAllByRole('listitem')).toHaveLength(1),
    )
    expect(await violationsGraves(container)).toEqual([])
  })

  it('envoi multiple : un appel par fichier, chacun avec son résultat', async () => {
    // jsdom ne sait pas transmettre un `FormData` au `fetch` de Node : l'envoi réel est vérifié
    // en navigateur contre l'API (e2e G2). Ici, l'écran : un appel par fichier, un résultat chacun.
    const [exemple] = mediasInitiaux()
    if (!exemple) throw new Error('Jeu d’exemple absent.')
    const envoyer = vi
      .spyOn(medias, 'envoyer')
      .mockResolvedValueOnce({ ...exemple, id: crypto.randomUUID() })
      .mockRejectedValueOnce(
        new ErreurApi({
          status: 422,
          code: 'FICHIER_REFUSE',
          message: 'Ce type de fichier n’est pas accepté.',
        }),
      )
    await ouvrir('editeur', '/medias')
    await grille()
    const champ = document.querySelector('input[type="file"][multiple]') as HTMLInputElement
    fireEvent.change(champ, {
      target: {
        files: [
          new File([new Uint8Array([1, 2, 3])], 'a.png', { type: 'image/png' }),
          new File(['pas une image'], 'b.txt', { type: 'text/plain' }),
        ],
      },
    })
    expect(await screen.findByText(/envoyé ; à décrire/)).toBeTruthy()
    expect(await screen.findByText(/refusé : Ce type de fichier n’est pas accepté/)).toBeTruthy()
    expect(envoyer.mock.calls.map(([fichier]) => fichier.name)).toEqual(['a.png', 'b.txt'])
  })
})

describe('fiche', () => {
  it('décrire un média le sort de « à fournir »', async () => {
    const { container } = await ouvrir('editeur', `/medias/${IDS_EXEMPLE.mediaSansAlt}`)
    await screen.findByRole('heading', { level: 1, name: 'Sans texte alternatif' })
    fireEvent.change(document.getElementById('traductions.fr.texteAlt') as HTMLElement, {
      target: { value: 'Exemple : vue sur la lagune' },
    })
    fireEvent.change(screen.getByLabelText(/^Crédit/), { target: { value: 'Exemple : crédit' } })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(
      await screen.findByRole('heading', { level: 1, name: 'Exemple : vue sur la lagune' }),
    ).toBeTruthy()
    const media = magasin.medias.find((m) => m.id === IDS_EXEMPLE.mediaSansAlt)
    expect(media).toMatchObject({
      credit: 'Exemple : crédit',
      traductions: { fr: { texteAlt: 'Exemple : vue sur la lagune' } },
    })
    expect(await violationsGraves(container)).toEqual([])
  })

  it('l’éditeur ne supprime pas ; l’admin voit le refus d’un média utilisé (RG-08)', async () => {
    await ouvrir('editeur', `/medias/${IDS_EXEMPLE.mediaComplet}`)
    await screen.findByText(/contenus l’utilisent/)
    expect(screen.queryByRole('button', { name: 'Supprimer' })).toBeNull()
    window.history.pushState({}, '', '/')
  })

  it('un média utilisé ne se supprime pas ; un média libre, si', async () => {
    await ouvrir('admin', `/medias/${IDS_EXEMPLE.mediaComplet}`)
    await screen.findByText(/contenus l’utilisent/)
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
    const dialogue = await screen.findByRole('dialog', { name: 'Supprimer ce média' })
    fireEvent.click(within(dialogue).getByRole('button', { name: 'Supprimer' }))
    expect(
      await screen.findByText(/Ce média est utilisé : il ne peut pas être supprimé\. \(RG-08\)/),
    ).toBeTruthy()
    expect(magasin.medias.some((m) => m.id === IDS_EXEMPLE.mediaComplet)).toBe(true)
  })
})
