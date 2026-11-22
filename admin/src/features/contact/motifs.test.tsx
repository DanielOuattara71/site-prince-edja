import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { magasin } from '@/api/mocks/magasin'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'
import { violationsGraves } from '@/test/axe'

/**
 * Lot 4 (§ 13.6) : `/motifs-contact` — motifs du formulaire de contact, ordonnables, sans cycle
 * de vie. Le titre français est obligatoire ; l’anglais en retombe.
 */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}

describe('lot 4 — motifs de contact', () => {
  // Écran rétabli le 16/11/2026, à la demande du client (décision C2 levée pour cette famille).
  it('admin : les trois motifs du site sont listés, un nouveau motif se crée', async () => {
    const { container } = await ouvrir('admin', '/motifs-contact')
    expect(await screen.findByText('Partenariats')).toBeTruthy()
    expect((await screen.findAllByText('Médias')).length).toBeGreaterThan(0)
    expect(screen.getByText('Événements')).toBeTruthy()
    expect((await screen.findAllByText('Motifs de contact')).length).toBeGreaterThan(0)

    fireEvent.click(await screen.findByRole('button', { name: 'Nouveau motif' }))
    const dialogue = await screen.findByRole('dialog', { name: 'Nouveau motif' })
    fireEvent.change(within(dialogue).getByLabelText(/^Titre \(FR\)/), {
      target: { value: 'Exemple — partenariat' },
    })
    fireEvent.click(await within(dialogue).findByRole('button', { name: 'Enregistrer' }))
    await waitFor(() => expect(magasin.motifsContact).toHaveLength(4))
    expect(await screen.findByText('Exemple — partenariat')).toBeTruthy()
    expect(await violationsGraves(container)).toEqual([])
  })
})
