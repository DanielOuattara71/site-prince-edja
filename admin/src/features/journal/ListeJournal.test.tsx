import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { magasin } from '@/api/mocks/magasin'
import { utiliserFauxServeur, connecter, type RoleEssai } from '@/test/faux-serveur'
import { violationsGraves } from '@/test/axe'

/**
 * Étape 9 — journal : l’écran liste les écritures d’audit (vide ici) et n’exporte que pour un
 * super-admin.
 */
utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  // La connexion elle-même écrit une entrée : on repart sur un journal vierge.
  magasin.journal = []
  window.history.pushState({}, '', chemin)
  return render(<App />)
}

describe('journal (étape 9)', () => {
  it('liste les écritures : état vide annoncé, export réservé au super-admin', async () => {
    const { container } = await ouvrir('super', '/activite')
    expect(await screen.findByRole('heading', { name: 'Activité' })).toBeTruthy()
    expect(await screen.findByText('Aucune écriture enregistrée.')).toBeTruthy()
    const boutonExport = screen.getByRole('button', {
      name: 'Exporter le journal',
    }) as HTMLButtonElement
    expect(boutonExport.disabled).toBe(false)
    expect(await violationsGraves(container)).toEqual([])
  })
})
