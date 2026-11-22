import { fireEvent, render, screen, waitFor } from '@testing-library/react'

const saisiePanel = async () => {
  await waitFor(() => expect(document.getElementById('categorieId-nom')).toBeTruthy())
  return document.getElementById('categorieId-nom') as HTMLInputElement
}
const boutonPanel = (nom: string) => {
  const panneaux = document.querySelectorAll('div.w-full.rounded-md.border.border-sand-200')
  const boutons = Array.from(panneaux[panneaux.length - 1]?.querySelectorAll('button') ?? []).filter(
    (b) => b.textContent?.trim() === nom,
  )
  return boutons.at(-1) as HTMLElement
}
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { magasin } from '@/api/mocks/magasin'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'

/**
 * Création et modification de la catégorie de projet (contrat § 10, RG-29) : depuis le
 * formulaire de projet, « créer » la catégorie (sans quitter l'écran), puis la « changer ».
 */
utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

const titre = (nom: string) => screen.findByRole('heading', { level: 1, name: nom })

async function ouvrir(chemin: string, role: RoleEssai = 'admin') {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}

const COMBO = { name: /^Catégorie/ } as const

describe('SelectuerCategorie (ex. : projet)', () => {
  it('crée une catégorie depuis le formulaire — créer + sélectionner', async () => {
    await ouvrir('/projets/nouveau')
    await titre('Nouveau projet')
    const combo = await screen.findByRole('combobox', COMBO)
    fireEvent.change(combo, { target: { value: '__creer' } })

    fireEvent.change(await saisiePanel(), {
      target: { value: 'Mon film' },
    })
    fireEvent.click(boutonPanel('Créer'))

    await waitFor(() =>
      expect(magasin.categories.some((c) => c.traductions.fr?.nom === 'Mon film')).toBe(true),
    )
    const creee = magasin.categories.find((c) => c.traductions.fr?.nom === 'Mon film')
    await waitFor(() =>
      expect((screen.getByRole('combobox', COMBO) as HTMLSelectElement).value).toBe(creee?.id),
    )
    expect(creee?.famille).toBe('projet')
  }, 40_000)

  it('la catégorie est verrouillée dès que le projet existe', async () => {
    const projet = magasin.projets[0]
    if (!projet || !projet.categorieId) throw new Error('Jeu d’exemple absent.')
    await ouvrir('/projets/' + projet.id)
    await screen.findByRole('combobox', COMBO)
    await waitFor(() =>
      expect((screen.getByRole('combobox', COMBO) as HTMLSelectElement).value).toBe(
        projet.categorieId,
      ),
    )
    expect((screen.getByRole('combobox', COMBO) as HTMLSelectElement).disabled).toBe(true)
    expect(screen.queryByRole('button', { name: 'Changer la catégorie' })).toBeNull()
    expect(
      await screen.findByText('Verrouillé — la catégorie est assignée au projet et ne change plus.'),
    ).toBeTruthy()
  }, 40_000)
})
