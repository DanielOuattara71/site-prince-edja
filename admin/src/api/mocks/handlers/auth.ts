import { http } from 'msw'
import {
  changerMotDePasseSchema,
  connexionSchema,
  definirMotDePasseSchema,
  motDePasseOublieSchema,
} from '@/api/schemas/auth'
import { compteConnecte, journaliser, magasin, ouvrirSession } from '@/api/mocks/magasin'
import { API, erreur, json, lireCorps, vide } from '@/api/mocks/reponses'

/** Session simulée (`docs/CONTRAT-API.md` § 3.2). */

/** Jeton de lien de mot de passe accepté par le faux serveur (développement seulement). */
export const JETON_EXEMPLE = 'jeton-exemple-valide'

const SEUIL_ECHECS = 5

function moi() {
  const compte = compteConnecte()
  const session = magasin.session
  if (!compte || !session) return null
  return {
    compte,
    csrf: session.csrf,
    session: { expireLe: new Date(session.expireLe).toISOString() },
    reglages: {
      boutiqueEnLigne: false,
      multiVendeurs: magasin.multiVendeurs,
      languesActives: magasin.languesActives,
    },
  }
}

export const handlersAuth = [
  http.post(`${API}/auth/connexion`, async ({ request }) => {
    if (magasin.echecsConnexion >= SEUIL_ECHECS) {
      return erreur(429, 'TROP_DE_REQUETES', 'Trop de tentatives. Réessayez dans un instant.', {
        entetes: { 'Retry-After': '30' },
      })
    }
    const corps = await lireCorps(request, connexionSchema)
    if (!corps.ok) return corps.reponse
    const essai = magasin.comptes.find(
      (candidat) => candidat.compte.email === corps.valeur.email.toLowerCase(),
    )
    // Même réponse que le compte existe ou non (§ 3.2).
    if (!essai || !essai.compte.actif || essai.motDePasse !== corps.valeur.motDePasse) {
      magasin.echecsConnexion += 1
      journaliser(null, 'connexion_refusee', 'comptes', null, null, null)
      return erreur(401, 'IDENTIFIANTS_INVALIDES', 'E-mail ou mot de passe incorrect.')
    }
    magasin.echecsConnexion = 0
    essai.compte.derniereConnexion = new Date().toISOString()
    ouvrirSession(essai.compte.id)
    journaliser(essai.compte, 'connexion', 'comptes', essai.compte.id, null, null)
    return json(moi())
  }),

  http.post(`${API}/auth/deconnexion`, () => {
    magasin.session = null
    return vide()
  }),

  http.get(`${API}/auth/moi`, () => {
    const corps = moi()
    return corps ? json(corps) : erreur(401, 'NON_AUTHENTIFIE', 'Session absente ou expirée.')
  }),

  http.post(`${API}/auth/changer-mot-de-passe`, async ({ request }) => {
    const compte = compteConnecte()
    if (!compte) return erreur(401, 'NON_AUTHENTIFIE', 'Session absente ou expirée.')
    if (request.headers.get('X-CSRF-Token') !== magasin.session?.csrf) {
      return erreur(403, 'CSRF_INVALIDE', 'Jeton de sécurité invalide.')
    }
    const corps = await lireCorps(request, changerMotDePasseSchema)
    if (!corps.ok) return corps.reponse
    const essai = magasin.comptes.find((candidat) => candidat.compte.id === compte.id)
    if (!essai || essai.motDePasse !== corps.valeur.motDePasseActuel) {
      return erreur(401, 'IDENTIFIANTS_INVALIDES', 'Mot de passe actuel incorrect.')
    }
    essai.motDePasse = corps.valeur.nouveauMotDePasse
    essai.compte.doitChangerMotDePasse = false
    journaliser(compte, 'changement_mot_de_passe', 'comptes', compte.id, null, null)
    return vide()
  }),

  http.post(`${API}/auth/mot-de-passe-oublie`, async ({ request }) => {
    const corps = await lireCorps(request, motDePasseOublieSchema)
    if (!corps.ok) return corps.reponse
    return vide() // toujours la même réponse (§ 3.2)
  }),

  http.post(`${API}/auth/definir-mot-de-passe`, async ({ request }) => {
    const corps = await lireCorps(request, definirMotDePasseSchema)
    if (!corps.ok) return corps.reponse
    if (corps.valeur.jeton !== JETON_EXEMPLE) {
      return erreur(422, 'JETON_INVALIDE', 'Ce lien est invalide, expiré ou déjà utilisé.')
    }
    return vide()
  }),
]
