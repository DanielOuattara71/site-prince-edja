import { defineConfig, devices } from '@playwright/test'

/**
 * Parcours de bout en bout contre la **vraie** API (point d'intégration I-0, D-47).
 *
 * Prérequis : l'API locale tourne (`npm run dev` dans `prince-edja-api`, port 3000) et un
 * compte existe ; ses identifiants viennent de l'environnement (`E2E_EMAIL`,
 * `E2E_MOT_DE_PASSE`), jamais du dépôt. Playwright lance l'admin en mode `api`.
 */
export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  fullyParallel: false,
  workers: 1,
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:5180',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'bureau', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 7'] } },
  ],
  webServer: {
    command: 'npm run dev:api',
    url: 'http://localhost:5180',
    reuseExistingServer: true,
    timeout: 60_000,
  },
})
