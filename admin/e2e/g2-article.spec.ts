import { expect, test, type Page } from '@playwright/test'

/**
 * Critère G2 du lot 1 (contrat § 19), contre l'API réelle : un éditeur crée un brouillon avec
 * une image envoyée et décrite, et le soumet ; un admin le publie ; l'action est au journal ;
 * la reconstruction du site est suivie. Comptes fournis par l'environnement (jamais le dépôt).
 */
const editeur = {
  email: process.env['E2E_EDITEUR_EMAIL'] ?? '',
  motDePasse: process.env['E2E_EDITEUR_MDP'] ?? '',
}
const admin = {
  email: process.env['E2E_ADMIN_EMAIL'] ?? '',
  motDePasse: process.env['E2E_ADMIN_MDP'] ?? '',
}

test.skip(!editeur.email || !admin.email, 'Comptes E2E_EDITEUR_* et E2E_ADMIN_* requis.')
test.skip(({ isMobile }) => isMobile, 'Parcours de rédaction : vérifié sur bureau.')

/** PNG valide de 1 × 1 pixel : le serveur en lit le type réel et le réencode. */
const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
  'base64',
)

async function seConnecter(page: Page, compte: { email: string; motDePasse: string }) {
  await page.goto('/connexion')
  await page.getByLabel(/Adresse e-mail/).fill(compte.email)
  await page.getByLabel(/^Mot de passe/).fill(compte.motDePasse)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Tableau de bord' })).toBeVisible()
}

async function seDeconnecter(page: Page) {
  await page.getByRole('button', { name: /Se déconnecter/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Connexion' })).toBeVisible()
}

const champ = (page: Page, id: string) => page.locator(`[id="${id}"]`)

test('G2 : un éditeur rédige et soumet, un admin publie, le journal et la reconstruction suivent', async ({
  page,
}) => {
  test.setTimeout(150_000)
  const titre = `Exemple E2E ${Date.now()}`

  // — Éditeur —
  await seConnecter(page, editeur)
  await page.goto('/articles/nouveau')
  await champ(page, 'traductions.fr.titre').fill(titre)
  await page.getByLabel(/^Catégorie/).selectOption('Voyage')
  await champ(page, 'traductions.fr.extrait').fill(
    'Exemple de résumé écrit par le test de bout en bout.',
  )
  await champ(page, 'traductions.fr.corps').click()
  await page.keyboard.type('Exemple de corps saisi dans l’éditeur riche.')

  await page.locator('#imageId').click()
  const mediatheque = page.getByRole('dialog', { name: 'Choisir une image' })
  await mediatheque
    .locator('input[type="file"]')
    .setInputFiles({ name: 'e2e.png', mimeType: 'image/png', buffer: PNG })
  await mediatheque.getByLabel(/Texte alternatif \(FR\)/).fill('Exemple : carré de test')
  await mediatheque.getByLabel(/^Crédit/).fill('Exemple : test automatisé')
  await mediatheque.getByRole('button', { name: 'Enregistrer et choisir' }).click()
  await expect(mediatheque).toBeHidden()

  await page.getByLabel('Récit').check()
  await page.getByRole('button', { name: 'Enregistrer le brouillon' }).first().click()
  await expect(page).toHaveURL(/\/articles\/[0-9a-f-]{36}$/)
  const id = page.url().split('/').pop() ?? ''

  await page.getByRole('button', { name: 'Soumettre à relecture' }).click()
  await expect(page.getByText('Contenu soumis à relecture.')).toBeVisible()
  await expect(page.getByText('En relecture', { exact: true }).first()).toBeVisible()
  await seDeconnecter(page)

  // — Admin —
  await seConnecter(page, admin)
  await page.goto(`/articles/${id}`)
  await page.getByRole('button', { name: 'Publier' }).click()
  await expect(page.getByText('Site en cours de mise à jour…')).toBeVisible()
  await expect(page.getByText('Publié', { exact: true }).first()).toBeVisible()

  // Le journal garde chaque étape (RG-17), lu par l'API d'administration réelle.
  const journal = await page.request.get(`/admin/api/v1/journal?entite=articles&entiteId=${id}`)
  expect(journal.ok()).toBe(true)
  const actions = ((await journal.json()) as { items: { action: string }[] }).items.map(
    (e) => e.action,
  )
  expect(actions).toEqual(
    expect.arrayContaining(['creation', 'transition:en_relecture', 'transition:publie']),
  )

  // La reconstruction aboutit ou échoue, et l'écran le dit (sans service de build en local :
  // « aucun service de reconstruction n'est configuré »).
  await expect(
    page.getByText(/Le site est à jour\.|Le site n’a pas pu être mis à jour\./),
  ).toBeVisible({ timeout: 100_000 })
})
