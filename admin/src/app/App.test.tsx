import { fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { MOT_DE_PASSE_ESSAI } from '@/api/mocks/donnees'
import { magasin } from '@/api/mocks/magasin'
import { violationsGraves } from '@/test/axe'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'

/** Critère de l'étape 2 du prompt admin : parcours de connexion pour les trois rôles. */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

function rendre(chemin: string) {
  window.history.pushState({}, '', chemin)
  return render(<App />)
}

const titre = (nom: string) => screen.findByRole('heading', { level: 1, name: nom })

async function seConnecterParLeFormulaire(email: string, motDePasse: string) {
  await titre('Connexion')
  fireEvent.change(screen.getByLabelText(/Adresse e-mail/), { target: { value: email } })
  fireEvent.change(screen.getByLabelText(/^Mot de passe/), { target: { value: motDePasse } })
  fireEvent.click(screen.getByRole('button', { name: 'Se connecter' }))
}

describe('accès', () => {
  it('sans session, une page protégée renvoie à la connexion en mémorisant le retour', async () => {
    rendre('/articles')
    await titre('Connexion')
    expect(window.location.search).toBe('?retour=%2Farticles')
  })

  it('un mot de passe faux donne un message générique, sans dire si le compte existe', async () => {
    rendre('/connexion')
    await seConnecterParLeFormulaire('admin@exemple.test', 'mauvais')
    // La zone d'erreurs des notifications est un second `role="alert"`, vide, toujours présent.
    const message = await screen.findByText('E-mail ou mot de passe incorrect.')
    expect(message.closest('[role="alert"]')?.textContent).toBe('E-mail ou mot de passe incorrect.')
  })

  it('après connexion, revient à la page demandée', async () => {
    rendre('/articles')
    await seConnecterParLeFormulaire('editeur@exemple.test', MOT_DE_PASSE_ESSAI)
    expect(await titre('Articles')).toBeTruthy()
    // Écran livré à l'étape 4 : la vraie liste, plus « en préparation ».
    expect(await screen.findByRole('link', { name: 'Nouvel article' })).toBeTruthy()
  })
})

describe('menu filtré par peut() pour chaque rôle', () => {
  const cas: [RoleEssai, string[], string[]][] = [
    [
      'editeur',
      ['Articles', 'Médias', 'Bijoux'],
      ['Messages', 'Comptes', 'Journal', 'Tags', 'Créateurs', 'Publication du site'],
    ],
    [
      'admin',
      ['Articles', 'Messages', 'Tags', 'Créateurs', 'Journal', 'Comptes', 'Publication du site'],
      [],
    ],
    ['super', ['Articles', 'Messages', 'Journal', 'Comptes'], []],
  ]

  it.each(cas)('%s', async (role, visibles, absents) => {
    rendre('/connexion')
    await seConnecterParLeFormulaire(`${role}@exemple.test`, MOT_DE_PASSE_ESSAI)
    await titre('Tableau de bord')
    const menu = screen.getByRole('navigation', { name: 'Navigation principale' })
    for (const nom of visibles) expect(within(menu).getByRole('link', { name: nom })).toBeTruthy()
    for (const nom of absents) expect(within(menu).queryByRole('link', { name: nom })).toBeNull()
  })
})

describe('première connexion', () => {
  it('impose le changement de mot de passe avant tout autre écran', async () => {
    const editeur = magasin.comptes.find((essai) => essai.compte.role === 'editeur')
    if (editeur) editeur.compte.doitChangerMotDePasse = true
    rendre('/connexion')
    await seConnecterParLeFormulaire('editeur@exemple.test', MOT_DE_PASSE_ESSAI)
    await titre('Changer de mot de passe')
    expect(screen.getByText(/première connexion/)).toBeTruthy()

    fireEvent.change(screen.getByLabelText(/^Mot de passe actuel/), {
      target: { value: MOT_DE_PASSE_ESSAI },
    })
    fireEvent.change(screen.getByLabelText(/^Nouveau mot de passe/), {
      target: { value: 'une phrase assez longue' },
    })
    fireEvent.change(screen.getByLabelText(/^Confirmer/), {
      target: { value: 'une phrase assez longue' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Enregistrer' }))
    expect(await titre('Tableau de bord')).toBeTruthy()
  })
})

describe('pages d’erreur et déconnexion', () => {
  it('un éditeur sur /comptes voit « Accès refusé », sans redirection', async () => {
    await connecter('editeur')
    rendre('/comptes')
    expect(await titre('Accès refusé')).toBeTruthy()
    expect(window.location.pathname).toBe('/comptes')
  })

  it('une adresse inconnue affiche « Page introuvable »', async () => {
    await connecter('admin')
    rendre('/nulle-part')
    expect(await titre('Page introuvable')).toBeTruthy()
  })

  it('la déconnexion ramène à la connexion', async () => {
    await connecter('admin')
    rendre('/')
    await titre('Tableau de bord')
    fireEvent.click(screen.getByRole('button', { name: /Se déconnecter/ }))
    expect(await titre('Connexion')).toBeTruthy()
  })
})

describe('accessibilité', () => {
  it('connexion : lien d’évitement en premier, titre de document, aucune violation axe', async () => {
    const { container } = rendre('/connexion')
    await titre('Connexion')
    expect(container.querySelector('a, button, input')?.textContent).toBe('Aller au contenu')
    expect(document.title).toBe('Connexion · Administration Prince Edja')
    expect(await violationsGraves(container)).toEqual([])
  })

  it('coque : repères header, nav, main ; un seul h1 ; aucune violation axe', async () => {
    await connecter('admin')
    const { container } = rendre('/')
    await titre('Tableau de bord')
    expect(screen.getByRole('banner')).toBeTruthy()
    expect(screen.getByRole('main')).toBeTruthy()
    expect(screen.getAllByRole('heading', { level: 1 })).toHaveLength(1)
    expect(await violationsGraves(container)).toEqual([])
  })
})
