import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { App } from '@/app/App'
import { abonnes } from '@/api/endpoints/audience'
import { connecter, utiliserFauxServeur } from '@/test/faux-serveur'

/**
 * L'export n'accepte que `q` et `statut` (contrat § 12.3) : l'ancien envoi de `page` /
 * `pageSize` produisait un 422 en mode API réel, masqué par les mocks.
 */
utiliserFauxServeur()
afterEach(() => {
  window.history.pushState({}, '', '/')
  vi.restoreAllMocks()
})

describe('abonnés — export CSV', () => {
  it('n’envoie ni page ni pageSize à l’API', async () => {
    const exporter = vi
      .spyOn(abonnes, 'exporterAbonnes')
      .mockResolvedValue('email;prenom\na@b.ci;Awa\n')
    await connecter('admin')
    window.history.pushState({}, '', '/abonnes')
    render(<App />)

    fireEvent.click(await screen.findByRole('button', { name: 'Exporter' }, { timeout: 15000 }))

    await waitFor(() => expect(exporter).toHaveBeenCalledTimes(1))
    const parametres = exporter.mock.calls[0]?.[0] as Record<string, unknown>
    expect(parametres).not.toHaveProperty('page')
    expect(parametres).not.toHaveProperty('pageSize')
  })
})
