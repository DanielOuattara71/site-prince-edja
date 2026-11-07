import { describe, expect, it } from 'vitest'
import { ErreurApi } from '@/api/erreurs'
import { fr } from '@/i18n/fr'
import { CODES_API, messageErreur } from '@/lib/message-erreur'

/** U13 : chaque code de l'API a un message clair, et aucun code n'est affiché. */
describe('messages d’erreur', () => {
  it.each(CODES_API)('%s a un message dans i18n/fr.ts', (code) => {
    const cle = `erreur.code.${code}` as keyof typeof fr
    expect(fr[cle]).toBeTruthy()
  })

  it('une règle de gestion garde le message du serveur, sans le code', () => {
    const erreur = new ErreurApi({
      status: 422,
      code: 'RG-08',
      message: 'Ce média est utilisé par un article.',
      requeteId: 'r1',
    })
    expect(messageErreur(erreur)).toBe('Ce média est utilisé par un article.')
    expect(messageErreur(erreur)).not.toMatch(/RG-/)
  })

  it('un code technique prend le message du dictionnaire', () => {
    const erreur = new ErreurApi({
      status: 409,
      code: 'VERSION_PERIMEE',
      message: 'version mismatch',
      requeteId: 'r2',
    })
    expect(messageErreur(erreur)).toBe(fr['erreur.code.VERSION_PERIMEE'])
  })
})
