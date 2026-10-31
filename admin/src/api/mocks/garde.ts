import type { Compte } from '@/api/schemas/communs'
import { peut, type Action, type ObjetCible, type Ressource } from '@/auth/permissions'
import { compteConnecte, magasin } from '@/api/mocks/magasin'
import { erreur } from '@/api/mocks/reponses'

/**
 * Contrôles communs à toute route protégée (`docs/CONTRAT-API.md` § 3.1 et 4.2) :
 * session (`401`), jeton anti-CSRF sur les écritures (`403 CSRF_INVALIDE`), mot de passe
 * à changer (`403 MOT_DE_PASSE_A_CHANGER`).
 */

export type Garde = { ok: true; compte: Compte } | { ok: false; reponse: Response }

const METHODES_ECRITURE = new Set(['POST', 'PATCH', 'PUT', 'DELETE'])

export function garder(requete: Request): Garde {
  const compte = compteConnecte()
  if (!compte || !compte.actif) {
    return { ok: false, reponse: erreur(401, 'NON_AUTHENTIFIE', 'Session absente ou expirée.') }
  }
  if (METHODES_ECRITURE.has(requete.method)) {
    const jeton = requete.headers.get('X-CSRF-Token')
    if (!jeton || jeton !== magasin.session?.csrf) {
      return { ok: false, reponse: erreur(403, 'CSRF_INVALIDE', 'Jeton de sécurité invalide.') }
    }
  }
  if (compte.doitChangerMotDePasse) {
    return {
      ok: false,
      reponse: erreur(403, 'MOT_DE_PASSE_A_CHANGER', 'Changez votre mot de passe pour continuer.'),
    }
  }
  return { ok: true, compte }
}

/**
 * Session valide **et** droit d'agir. Le refus porte le code de la règle quand il y en a
 * une (RG-02 pour une publication), `DROIT_INSUFFISANT` sinon.
 */
export function autoriser(
  requete: Request,
  action: Action,
  ressource: Ressource,
  objet?: ObjetCible,
  codeRegle = 'DROIT_INSUFFISANT',
): Garde {
  const garde = garder(requete)
  if (!garde.ok) return garde
  if (!peut(garde.compte, action, ressource, objet)) {
    return {
      ok: false,
      reponse: erreur(403, codeRegle, 'Votre rôle ne permet pas cette action.'),
    }
  }
  return garde
}

/** `409 VERSION_PERIMEE` si la version envoyée n'est pas la version courante. */
export function versionPerimee(
  envoyee: number | null | undefined,
  courante: number,
): Response | null {
  if (envoyee === courante) return null
  return erreur(409, 'VERSION_PERIMEE', 'Ce contenu a été modifié entre-temps. Rechargez-le.', {
    details: { versionCourante: courante },
  })
}
