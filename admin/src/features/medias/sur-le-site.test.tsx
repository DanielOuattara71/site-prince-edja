import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { emplacementsPhotos } from '@/api/endpoints/emplacements'
import type { ErreurApi } from '@/api/erreurs'
import { IDS_EXEMPLE } from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'
import { peut, type CompteDroits } from '@/auth/permissions'
import { connecter, utiliserFauxServeur } from '@/test/faux-serveur'

/** C6 : photos fixes (PROMPT-CORRECTION § 7.3, § 10), médiathèque (U9). */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

const echec = (promesse: Promise<unknown>) =>
  promesse.then(
    () => null,
    (e: unknown) => e as ErreurApi,
  )

describe('photos fixes : règles et droits', () => {
  it('huit emplacements de départ ; aucun format conseillé inventé', async () => {
    await connecter('editeur')
    const { items } = await emplacementsPhotos.lister()
    expect(items.map((e) => e.cle)).toContain('accueil.heros')
    expect(items).toHaveLength(8)
    expect(items.every((e) => e.formatConseille === null && e.mediaId === null)).toBe(true)
  })

  it('l’éditeur lit mais ne change pas une photo fixe (E4) ; l’admin la change', async () => {
    const image = magasin.medias.find(
      (m) => m.mime.startsWith('image/') && m.traductions.fr?.texteAlt.trim(),
    )
    if (!image) throw new Error('Jeu d’exemple absent.')
    await connecter('editeur')
    expect((await echec(emplacementsPhotos.changer('accueil.heros', image.id)))?.status).toBe(403)
    await connecter('admin')
    const change = await emplacementsPhotos.changer('accueil.heros', image.id)
    expect(change.media?.id).toBe(image.id)
    expect(magasin.publications.length).toBeGreaterThan(0)
  })

  it('RG-08 : une image sans texte alternatif est refusée', async () => {
    await connecter('admin')
    const refus = await echec(emplacementsPhotos.changer('accueil.heros', IDS_EXEMPLE.mediaSansAlt))
    expect(refus?.code).toBe('RG-08')
  })

  it('un vendeur n’a accès ni aux photos fixes ni aux galeries ; il garde ses médias', () => {
    const vendeur: CompteDroits = { id: 'v', role: 'vendeur', actif: true, createurId: 'c' }
    expect(peut(vendeur, 'lire', 'emplacements-photos')).toBe(false)
    expect(peut(vendeur, 'lire', 'galerie')).toBe(false)
    expect(peut(vendeur, 'lire', 'medias', { createurId: 'c' })).toBe(true)
    expect(peut(vendeur, 'lire', 'medias', { createurId: 'autre' })).toBe(false)
  })
})

describe('médiathèque (U9)', () => {
  it('le texte alternatif se saisit dans la grille, sans ouvrir la fiche', async () => {
    await connecter('admin')
    window.history.pushState({}, '', '/medias')
    render(<App />)
    const grille = await screen.findByRole('list', { name: 'Médiathèque' })
    const champ = within(grille).getAllByLabelText('Texte alternatif (FR)')[0] as HTMLInputElement
    const carte = champ.closest('li') as HTMLElement
    fireEvent.change(champ, { target: { value: 'Exemple : pirogue au port' } })
    fireEvent.click(within(carte).getByRole('button', { name: 'Enregistrer' }))
    await waitFor(() =>
      expect(
        magasin.medias.some((m) => m.traductions.fr?.texteAlt === 'Exemple : pirogue au port'),
      ).toBe(true),
    )
  })
})
