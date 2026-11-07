import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { magasin } from '@/api/mocks/magasin'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'
import { violationsGraves } from '@/test/axe'

/**
 * Lot 4 (§ 13.2) : `/audience` — chiffres d’audience par plateforme, ordonnables, sans cycle de
 * vie. Un chiffre sans date ne s’affiche pas comme validé sur le site.
 */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}

describe('lot 4 — chiffres d’audience', () => {
  it('admin : les plateformes structurelles sont listées, un nouveau chiffre se crée', async () => {
    const { container } = await ouvrir('admin', '/audience')
    expect(await screen.findByText('Exemple — Instagram')).toBeTruthy()
    expect(screen.getByText('Exemple — LinkedIn')).toBeTruthy()
    expect(screen.getByText('Exemple — TikTok')).toBeTruthy()
    expect((await screen.findAllByText('Audience par plateforme')).length).toBeGreaterThan(0)

    fireEvent.click(await screen.findByRole('button', { name: 'Nouveau chiffre' }))
    const dialogue = await screen.findByRole('dialog', { name: 'Nouveau chiffre' })
    fireEvent.change(within(dialogue).getByLabelText(/^Plateforme/), {
      target: { value: 'Exemple — Newsletter' },
    })
    fireEvent.change(within(dialogue).getByLabelText(/^Taille du public/), {
      target: { value: '12000' },
    })
    fireEvent.change(within(dialogue).getByLabelText(/^Portée mensuelle/), {
      target: { value: '3400' },
    })
    fireEvent.click(await within(dialogue).findByRole('button', { name: 'Enregistrer' }))
    await waitFor(() => expect(magasin.chiffresAudience).toHaveLength(4))
    expect(await screen.findByText('Exemple — Newsletter')).toBeTruthy()
    expect(await violationsGraves(container)).toEqual([])
  })
})
