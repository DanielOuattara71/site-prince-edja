// @vitest-environment node
import { http } from 'msw'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { requete, surCsrfInvalide } from '@/api/client'
import { lireMoi } from '@/api/endpoints/auth'
import { articles } from '@/api/endpoints/contenus'
import { aLeCode, CODES_CLIENT, ErreurApi } from '@/api/erreurs'
import { magasin } from '@/api/mocks/magasin'
import { API, json } from '@/api/mocks/reponses'
import { connecter, serveur, utiliserFauxServeur } from '@/test/faux-serveur'

utiliserFauxServeur()

describe('client HTTP', () => {
  it('traduit une absence de session en 401 NON_AUTHENTIFIE, avec le requeteId', async () => {
    const erreur = await lireMoi().catch((e: unknown) => e)
    expect(erreur).toBeInstanceOf(ErreurApi)
    expect(erreur).toMatchObject({ status: 401, code: 'NON_AUTHENTIFIE' })
    expect((erreur as ErreurApi).requeteId).toMatch(/^req-/)
  })

  it('envoie le jeton CSRF reçu à la connexion sur chaque écriture', async () => {
    await connecter('editeur')
    const cree = await articles.creer({
      categorie: 'Voyage',
      traductions: { fr: { titre: 'Exemple — test' } },
    })
    expect(cree.statut).toBe('brouillon')
    expect(cree.traductions.fr?.slug).toBe('exemple-test')
  })

  it('sur 403 CSRF_INVALIDE, rafraîchit la session puis rejoue une seule fois', async () => {
    await connecter('editeur')
    // Le serveur change de jeton : celui du client est périmé.
    if (magasin.session) magasin.session.csrf = 'jeton-renouvele'
    let rafraichissements = 0
    surCsrfInvalide(async () => {
      rafraichissements += 1
      await lireMoi()
    })
    const cree = await articles.creer({
      categorie: 'Voyage',
      traductions: { fr: { titre: 'Exemple — rejoué' } },
    })
    expect(cree.id).toBeTruthy()
    expect(rafraichissements).toBe(1)
  })

  it('ne rejoue pas indéfiniment si le jeton reste refusé', async () => {
    await connecter('editeur')
    serveur.use(
      http.post(`${API}/articles`, () =>
        json({ status: 403, code: 'CSRF_INVALIDE', message: 'refusé', requeteId: 'r' }, 403),
      ),
    )
    let rafraichissements = 0
    surCsrfInvalide(async () => {
      rafraichissements += 1
    })
    const erreur = await articles
      .creer({ categorie: 'Voyage', traductions: { fr: { titre: 'Exemple' } } })
      .catch((e: unknown) => e)
    expect(aLeCode(erreur, 'CSRF_INVALIDE')).toBe(true)
    expect(rafraichissements).toBe(1)
  })

  it('signale une réponse hors contrat au lieu de la transmettre', async () => {
    serveur.use(http.get(`${API}/hors-contrat`, () => json({ inattendu: true })))
    const erreur = await requete('/hors-contrat', {
      schema: z.object({ attendu: z.string() }),
    }).catch((e: unknown) => e)
    expect(aLeCode(erreur, CODES_CLIENT.reponseInvalide)).toBe(true)
  })

  it('refuse d’envoyer un champ inconnu avant tout appel réseau (D-22)', () => {
    expect(() =>
      articles.creer({
        categorie: 'Voyage',
        traductions: { fr: { titre: 'Exemple' } },
        statut: 'publie',
      } as never),
    ).toThrow()
  })
})
