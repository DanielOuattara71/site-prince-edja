import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { definirJetonCsrf, surCsrfInvalide } from '@/api/client'
import { seConnecter } from '@/api/endpoints/auth'
import { MOT_DE_PASSE_ESSAI } from '@/api/mocks/donnees'
import { handlers } from '@/api/mocks/handlers'
import { reinitialiserMagasin } from '@/api/mocks/magasin'

/**
 * Faux serveur des tests : les mêmes gestionnaires qu'en développement, sans latence.
 * Une requête sans gestionnaire fait échouer le test (aucun appel réseau réel).
 */
export const serveur = setupServer(...handlers)

export function utiliserFauxServeur(): void {
  beforeAll(() => serveur.listen({ onUnhandledFrame: 'error' }))
  afterEach(() => {
    serveur.resetHandlers()
    reinitialiserMagasin()
    definirJetonCsrf(null)
    surCsrfInvalide(null)
  })
  afterAll(() => serveur.close())
}

export type RoleEssai = 'editeur' | 'admin' | 'super'

/** Ouvre une session avec un des trois comptes d'essai. */
export function connecter(role: RoleEssai) {
  return seConnecter(`${role}@exemple.test`, MOT_DE_PASSE_ESSAI)
}
