import { expect, test, type Page } from '@playwright/test'

/**
 * Écrans de la simplification (PROMPT-CORRECTION C2 à C7, E1) contre l'**API réelle** (D-81) :
 * menu à neuf entrées, hub Projets et ses templates, catégories des trois familles, photos fixes,
 * réglages du lot 4. Compte admin fourni par l'environnement, jamais par le dépôt.
 */
const admin = {
  email: process.env['E2E_ADMIN_EMAIL'] ?? '',
  motDePasse: process.env['E2E_ADMIN_MDP'] ?? '',
}

test.skip(!admin.email, 'Compte E2E_ADMIN_* requis.')
test.skip(({ isMobile }) => isMobile, 'Parcours de saisie : vérifié sur bureau.')

async function seConnecter(page: Page) {
  await page.goto('/connexion')
  await page.getByLabel(/Adresse e-mail/).fill(admin.email)
  await page.getByLabel(/^Mot de passe/).fill(admin.motDePasse)
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Tableau de bord' })).toBeVisible()
}

/** Une page de l'admin s'affiche avec ses données : son titre, et aucun « Chargement impossible ». */
async function ouvrir(page: Page, chemin: string, titre: string | RegExp) {
  await page.goto(chemin)
  await expect(page.getByRole('heading', { level: 1, name: titre })).toBeVisible()
  await expect(page.getByText('Chargement impossible')).toHaveCount(0)
}

test('menu à neuf entrées et écrans servis par l’API', async ({ page }) => {
  await seConnecter(page)
  for (const entree of [
    'Tableau de bord',
    'Journal',
    'Projets',
    'Boutique',
    'Médiathèque',
    'Preuves et presse',
    'Boîte de réception',
    'Réglages',
    'Technique',
  ]) {
    await expect(page.getByRole('link', { name: entree, exact: true }).first()).toBeVisible()
  }

  // Catégories des trois familles, dont celles des projets décidées par le client.
  await ouvrir(page, '/categories', 'Catégories')
  for (const nom of ['Film', 'Tourisme', 'Patrimoine', 'Voyage', 'Bijoux & accessoires']) {
    await expect(page.getByText(nom, { exact: true }).first()).toBeVisible()
  }

  // Photos fixes (C6) : les huit emplacements semés par le back end.
  await ouvrir(page, '/galerie', /Sur le site/)
  await expect(page.getByText('Accueil — héros').first()).toBeVisible()

  // Lot 3 et lot 4, servis depuis B-63 et B-64.
  for (const [chemin, titre] of [
    ['/partenaires', /Partenaires/],
    ['/pages-legales', /Pages légales/],
    ['/audience', /Audience/],
    ['/parametres', 'Réglages du site'],
    ['/livres', /Livres/],
  ] as const) {
    await ouvrir(page, chemin, titre)
  }
})

test('hub Projets : un projet Programme créé avec sa catégorie, relu, puis supprimé', async ({
  page,
}) => {
  test.setTimeout(90_000)
  await seConnecter(page)
  await page.goto('/projets')
  await page.getByRole('link', { name: /Template Programme/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Template Programme' })).toBeVisible()
  await page.getByRole('link', { name: 'Nouveau projet' }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Nouveau projet' })).toBeVisible()
  await expect(page.getByRole('radio', { name: /Template Programme/ })).toBeChecked()
  await expect(page.getByRole('group', { name: 'Escales' })).toBeVisible()

  const marque = String(Date.now()).slice(-6)
  await page.getByRole('combobox', { name: /^Format/ }).selectOption('Émission')
  await page.getByRole('combobox', { name: /^Avancement/ }).selectOption('en_preparation')
  await page.locator('[id="traductions.fr.titre"]').fill(`Exemple E2E programme ${marque}`)
  await page.getByRole('combobox', { name: /^Catégorie de projet/ }).selectOption({
    label: 'Tourisme',
  })
  await page.getByRole('button', { name: 'Enregistrer' }).last().click()
  await expect(page).toHaveURL(/\/projets\/[0-9a-f-]{36}$/)
  const id = page.url().split('/').pop() ?? ''

  // Relu depuis l'API : template et catégorie gardés.
  await page.reload()
  await expect(page.getByRole('radio', { name: /Template Programme/ })).toBeChecked()
  await expect(
    page.getByRole('combobox', { name: /^Catégorie de projet/ }).locator('option:checked'),
  ).toHaveText('Tourisme')

  // Ménage : le brouillon est supprimé par l'API (session et jeton CSRF de la page).
  const moi = await (await page.request.get('/admin/api/v1/auth/moi')).json()
  const lu = await (await page.request.get(`/admin/api/v1/projets/${id}`)).json()
  const suppression = await page.request.delete(
    `/admin/api/v1/projets/${id}?version=${lu.version}`,
    { headers: { 'x-csrf-token': moi.csrf } },
  )
  expect(suppression.status()).toBe(204)
})
