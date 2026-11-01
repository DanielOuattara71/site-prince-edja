import { expect, test, type Page } from '@playwright/test'

/**
 * Étape 6 contre l'API réelle (I-2) : catégories de départ, créateur principal protégé, bijou
 * créé avec sa variante vide, prix saisi mais non confirmé → « sur demande ». Hors
 * multi-vendeurs, aucun sélecteur ni filtre de créateur. Compte fourni par l'environnement.
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

test('boutique : catégories, créateur principal, bijou « sur demande »', async ({ page }) => {
  test.setTimeout(120_000)
  await seConnecter(page)

  await page.goto('/categories')
  const liste = page.getByRole('list', { name: 'Ordre des catégories' })
  await expect(liste.getByRole('listitem')).toHaveCount(8)

  await page.goto('/createurs')
  await expect(page.getByText('plateforme').first()).toBeVisible()
  await page.getByRole('row').filter({ hasText: 'plateforme' }).getByRole('link').click()
  await expect(page.getByText(/Créateur principal de la plateforme/)).toBeVisible()
  await expect(page.getByRole('switch', { name: /Actif/ })).toBeDisabled()

  const numero = String(Date.now()).slice(-6)
  await page.goto('/bijoux/nouveau')
  await page.locator('[id="numero"]').fill(numero)
  await page.locator('[id="traductions.fr.nom"]').fill(`Exemple E2E ${numero}`)
  await page.getByLabel(/^Catégorie/).selectOption({ label: 'Bijoux & accessoires' })
  await expect(page.getByLabel(/Créateur du produit/)).toHaveCount(0)
  await page.getByRole('button', { name: 'Enregistrer' }).last().click()
  await expect(page).toHaveURL(/\/bijoux\/[0-9a-f-]{36}$/)
  await expect(page.getByText(`Variante ${numero}-1`, { exact: true })).toBeVisible()

  await page.getByRole('button', { name: `Modifier ${numero}-1` }).click()
  const dialogue = page.getByRole('dialog', { name: `Variante ${numero}-1` })
  await expect(dialogue.getByLabel(/^Stock/)).toHaveCount(0)
  await dialogue.getByLabel(/^Prix \(FCFA\)/).fill('45000')
  await dialogue.getByRole('button', { name: 'Enregistrer la variante' }).click()
  await expect(page.getByText(/45\s000\sFCFA/)).toBeVisible()

  await page.getByRole('tab', { name: 'Aperçu' }).click()
  await expect(page.getByText('Sur demande', { exact: true })).toBeVisible()
})
