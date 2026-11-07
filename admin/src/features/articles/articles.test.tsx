import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import { App } from '@/app/App'
import { articlesInitiaux, idCategorieArticle, IDS_EXEMPLE } from '@/api/mocks/donnees'
import { avancer, magasin } from '@/api/mocks/magasin'
import { violationsGraves } from '@/test/axe'
import { connecter, utiliserFauxServeur, type RoleEssai } from '@/test/faux-serveur'
import {
  schemaFormulaireArticle,
  valeursDepuisArticle,
  valeursVides,
  versEntree,
  versModification,
} from './valeurs'

/** Étape 4 : articles de bout en bout, parcours éditeur puis admin (section 13). */

utiliserFauxServeur()
afterEach(() => window.history.pushState({}, '', '/'))

async function ouvrir(role: RoleEssai, chemin: string) {
  await connecter(role)
  window.history.pushState({}, '', chemin)
  return render(<App />)
}
const titre = (nom: string | RegExp) => screen.findByRole('heading', { level: 1, name: nom })

describe('valeurs du formulaire', () => {
  const [brouillon] = articlesInitiaux()
  if (!brouillon) throw new Error('Jeu d’exemple absent.')

  it('une traduction écrite est complète ; une langue vidée qui existait est supprimée', () => {
    const valeurs = valeursDepuisArticle({ ...brouillon, languesPresentes: ['fr', 'en'] })
    valeurs.traductions.en.titre = ''
    const modification = versModification(valeurs, { ...brouillon, languesPresentes: ['fr', 'en'] })
    expect(modification.traductions?.en).toBeNull()
    expect(modification.traductions?.fr).toEqual({
      slug: 'exemple-brouillon',
      titre: brouillon.traductions.fr?.titre,
      extrait: '',
      corps: null,
      seoTitre: null,
      seoDescription: null,
    })
  })

  it('une langue jamais saisie n’est pas envoyée ; le slug vide laisse le serveur le tirer du titre', () => {
    const valeurs = valeursVides()
    valeurs.categorie = 'Voyage'
    valeurs.traductions.fr.titre = 'Exemple'
    expect(versEntree(valeurs).traductions).toEqual({
      fr: { titre: 'Exemple', extrait: '', corps: null, seoTitre: null, seoDescription: null },
    })
  })

  it('refuse un formulaire sans titre, ou une langue entamée sans titre', () => {
    const vide = schemaFormulaireArticle.safeParse({ ...valeursVides(), categorie: 'Voyage' })
    expect(vide.success).toBe(false)
    const entamee = valeursVides()
    entamee.categorie = 'Voyage'
    entamee.traductions.fr.titre = 'Exemple'
    entamee.traductions.en.extrait = 'Résumé sans titre'
    const lu = schemaFormulaireArticle.safeParse(entamee)
    expect(lu.success ? [] : lu.error.issues.map((i) => i.path.join('.'))).toEqual([
      'traductions.en.titre',
    ])
  })
})

describe('parcours éditeur', () => {
  it('crée un brouillon, l’adresse suit le titre ; une soumission incomplète liste les manques', async () => {
    await ouvrir('editeur', '/articles/nouveau')
    await titre('Nouvel article')
    fireEvent.change(document.getElementById('traductions.fr.titre') as HTMLElement, {
      target: { value: 'Exemple : Grand-Bassam l’été' },
    })
    expect((document.getElementById('traductions.fr.slug') as HTMLInputElement).value).toBe(
      'exemple-grand-bassam-l-ete',
    )
    fireEvent.change(await screen.findByRole('combobox', { name: /^Catégorie/ }), {
      target: { value: idCategorieArticle('Voyage') },
    })
    await waitFor(() =>
      expect(
        (screen.getByRole('combobox', { name: /^Catégorie/ }) as HTMLSelectElement).value,
      ).toBe(idCategorieArticle('Voyage')),
    )
    fireEvent.click(
      screen.getAllByRole('button', { name: 'Enregistrer le brouillon' })[0] as HTMLElement,
    )
    await waitFor(() => expect(window.location.pathname).toMatch(/^\/articles\/[0-9a-f-]{36}$/))
    expect(await titre('Exemple : Grand-Bassam l’été')).toBeTruthy()
    expect(magasin.articles[0]?.traductions.fr?.slug).toBe('exemple-grand-bassam-l-ete')

    fireEvent.click(await screen.findByRole('button', { name: 'Soumettre à relecture' }))
    const resume = await screen.findByText('Le formulaire contient des erreurs')
    const liste = resume.closest('[role="alert"]') as HTMLElement
    expect(within(liste).getByRole('link', { name: 'Résumé manquant.' })).toBeTruthy()
    expect(within(liste).getByRole('link', { name: 'Image principale manquante.' })).toBeTruthy()
    // Chaque manque mène au champ.
    fireEvent.click(within(liste).getByRole('link', { name: 'Résumé manquant.' }))
    await waitFor(() => expect(document.activeElement?.id).toBe('traductions.fr.extrait'))
  }, 40_000)

  it('un article en relecture est en lecture seule pour l’éditeur, sans « Publier »', async () => {
    await ouvrir('editeur', `/articles/${IDS_EXEMPLE.articleRelecture}`)
    await titre('Exemple — article prêt à publier')
    expect(screen.getByText(/Votre rôle ne permet pas de modifier ce contenu/)).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Publier' })).toBeNull()
  })
})

describe('parcours admin', () => {
  it('publie un article relu, puis suit la mise à jour du site (RG-19)', async () => {
    await ouvrir('admin', `/articles/${IDS_EXEMPLE.articleRelecture}`)
    await titre('Exemple — article prêt à publier')
    fireEvent.click(await screen.findByRole('button', { name: 'Publier' }))
    expect(await screen.findByText('Site en cours de mise à jour…')).toBeTruthy()
    expect(magasin.articles.find((a) => a.id === IDS_EXEMPLE.articleRelecture)?.statut).toBe(
      'publie',
    )
    avancer(5000)
    expect(await screen.findByText('Le site est à jour.', {}, { timeout: 8000 })).toBeTruthy()
  }, 40_000)

  it('un refus exige un motif, conservé sur le contenu', async () => {
    await ouvrir('admin', `/articles/${IDS_EXEMPLE.articleRelecture}`)
    await titre('Exemple — article prêt à publier')
    fireEvent.click(await screen.findByRole('button', { name: 'Refuser' }))
    const dialogue = await screen.findByRole('dialog', { name: 'Refuser la publication' })
    const confirmer = within(dialogue).getByRole('button', { name: 'Refuser' }) as HTMLButtonElement
    expect(confirmer.disabled).toBe(true)
    fireEvent.change(within(dialogue).getByLabelText(/Motif du refus/), {
      target: { value: 'Sources à préciser.' },
    })
    fireEvent.click(confirmer)
    expect(await screen.findByText('Sources à préciser.')).toBeTruthy()
    expect(magasin.articles.find((a) => a.id === IDS_EXEMPLE.articleRelecture)).toMatchObject({
      statut: 'brouillon',
      dernierMotifRefus: 'Sources à préciser.',
    })
  })
})

describe('liste des articles', () => {
  it('filtre par statut dans l’adresse ; suppression groupée confirmée (admin)', async () => {
    const { container } = await ouvrir('admin', '/articles')
    await titre('Articles')
    expect(await screen.findAllByRole('link', { name: /Exemple —/ })).toHaveLength(6)
    fireEvent.change(screen.getByLabelText('Statut'), { target: { value: 'brouillon' } })
    await waitFor(() => expect(window.location.search).toContain('statut=brouillon'))
    await waitFor(() => expect(screen.getAllByRole('link', { name: /Exemple —/ })).toHaveLength(2))

    const tableau = screen.getByRole('table', { name: 'Articles' })
    fireEvent.click(within(tableau).getByRole('checkbox', { name: 'Sélectionner toute la page' }))
    fireEvent.click(screen.getByRole('button', { name: 'Supprimer' }))
    const dialogue = await screen.findByRole('dialog', {
      name: 'Supprimer les contenus sélectionnés',
    })
    expect(dialogue.textContent).toContain('1 élément concerné.')
    fireEvent.click(within(dialogue).getByRole('button', { name: 'Supprimer' }))
    await waitFor(() =>
      expect(magasin.articles.some((a) => a.id === IDS_EXEMPLE.articleBrouillon)).toBe(false),
    )
    expect(await violationsGraves(container)).toEqual([])
  })

  it('formulaire : aucune violation axe', async () => {
    const { container } = await ouvrir('admin', `/articles/${IDS_EXEMPLE.articleBrouillon}`)
    await titre('Exemple — brouillon sans texte alternatif')
    await screen.findByRole('button', { name: 'Changer d’image' })
    expect(await violationsGraves(container)).toEqual([])
  })
})
