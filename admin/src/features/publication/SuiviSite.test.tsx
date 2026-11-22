import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { magasin } from '@/api/mocks/magasin'
import type { Publication } from '@/api/schemas/site'
import { utiliserFauxServeur, connecter, type RoleEssai } from '@/test/faux-serveur'
import { violationsGraves } from '@/test/axe'

/**
 * Étape 9 — publication du site : état de la dernière reconstruction, relance réelle depuis
 * l'alerte d'échec, et historique des publications (contrat § 14.1).
 */
utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}

function publication(sur: Partial<Publication> = {}): Publication {
  return {
    id: crypto.randomUUID(),
    motif: 'publication',
    etat: 'reussie',
    demandeePar: null,
    declencheeLe: new Date().toISOString(),
    termineeLe: new Date().toISOString(),
    messageErreur: null,
    buildId: 'build-test',
    objet: null,
    ...sur,
  }
}

describe('publication du site (étape 9)', () => {
  it('sans mise à jour en attente : message, puis relance disponible', async () => {
    const { container } = await ouvrir('admin', '/publication')
    expect(await screen.findByRole('heading', { name: 'Publication' })).toBeTruthy()
    expect(await screen.findByText('Aucune mise à jour du site pour le moment.')).toBeTruthy()
    const relancer = screen.getByRole('button', {
      name: 'Relancer la mise à jour',
    }) as HTMLButtonElement
    expect(relancer.disabled).toBe(false)
    expect(await violationsGraves(container)).toEqual([])
  })

  it('un échec WEBHOOK_ABSENT affiche le message et le lien relance déclenche une reconstruction', async () => {
    magasin.publications.unshift(
      publication({ etat: 'echec', messageErreur: 'WEBHOOK_ABSENT' }),
    )
    await ouvrir('admin', '/publication')

    expect(
      await screen.findByText('Aucun service de reconstruction n’est configuré pour cet environnement.'),
    ).toBeTruthy()
    const boutons = screen.getAllByRole('button', { name: 'Relancer la mise à jour' })
    expect(boutons.length).toBeGreaterThanOrEqual(2) // un dans l'alerte, un sous le suivi
    const avant = magasin.publications.length
    fireEvent.click(boutons[0]!)
    await waitFor(() => expect(magasin.publications.length).toBe(avant + 1))
  })

  it('affiche l’historique et filtre par motif', async () => {
    magasin.publications.unshift(
      publication({ motif: 'publication', objet: { ressource: 'articles', id: crypto.randomUUID(), titre: 'Un article' } }),
      publication({ motif: 'reglage' }),
    )
    await ouvrir('admin', '/publication')

    const historique = await screen.findByRole('heading', { name: 'Historique des mises à jour' })
    const section = historique.parentElement!
    expect(await within(section).findByText('Un article')).toBeTruthy()

    fireEvent.change(within(section).getByLabelText('Motif'), { target: { value: 'reglage' } })
    await waitFor(() => expect(within(section).queryByText('Un article')).toBeNull())
  })
})
