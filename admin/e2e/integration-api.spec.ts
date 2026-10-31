import { AxeBuilder } from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

/**
 * I-0 : l'admin se connecte à l'API réelle, lit sa session, se déconnecte. Le refus d'un
 * mauvais mot de passe passe par le vrai serveur. Audit axe complet, contraste compris :
 * dans un vrai navigateur, il se mesure (ce que jsdom ne peut pas).
 */
const email = process.env['E2E_EMAIL'] ?? ''
const motDePasse = process.env['E2E_MOT_DE_PASSE'] ?? ''

test.skip(!email || !motDePasse, 'E2E_EMAIL et E2E_MOT_DE_PASSE requis (compte de l’API locale).')

test('connexion refusée : message générique venu du serveur', async ({ page }) => {
  await page.goto('/connexion')
  await page.getByLabel(/Adresse e-mail/).fill(email)
  await page.getByLabel(/^Mot de passe/).fill('pas le bon mot de passe')
  await page.getByRole('button', { name: 'Se connecter' }).click()
  await expect(page.getByText('E-mail ou mot de passe incorrect.')).toBeVisible()
})

test('page de connexion : aucune violation axe, contraste compris', async ({ page }) => {
  await page.goto('/connexion')
  await expect(page.getByRole('heading', { level: 1, name: 'Connexion' })).toBeVisible()
  const resultat = await new AxeBuilder({ page }).analyze()
  const graves = resultat.violations.filter(
    (v) => v.impact === 'serious' || v.impact === 'critical',
  )
  expect(
    graves.map((v) => `${v.id} : ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`),
  ).toEqual([])
})

test('connexion, session relue au rechargement, déconnexion', async ({ page, context }) => {
  await page.goto('/connexion')
  await page.getByLabel(/Adresse e-mail/).fill(email)
  await page.getByLabel(/^Mot de passe/).fill(motDePasse)
  await page.getByRole('button', { name: 'Se connecter' }).click()

  await expect(page.getByRole('heading', { level: 1, name: 'Tableau de bord' })).toBeVisible()
  const cookie = (await context.cookies()).find((c) => c.name === 'pe_session')
  expect(cookie).toMatchObject({ httpOnly: true, sameSite: 'Lax' })

  // La session est relue au serveur (GET /auth/moi), pas gardée dans le navigateur.
  await page.reload()
  await expect(page.getByRole('heading', { level: 1, name: 'Tableau de bord' })).toBeVisible()
  expect(await page.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0])

  await page.getByRole('button', { name: /Se déconnecter/ }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Connexion' })).toBeVisible()
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Connexion' })).toBeVisible()
})
