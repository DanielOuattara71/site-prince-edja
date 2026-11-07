import { CODES_CLIENT, estErreurApi } from '@/api/erreurs'
import { t, type CleTraduction } from '@/i18n/fr'

/**
 * Codes d'erreur de l'API (contrat § 4.2, SCHEMAS § 3.3) qui ont chacun un message dans
 * `i18n/fr.ts` (U13) : « ce qui s'est passé », puis « quoi faire ». Un test vérifie que chaque
 * code a son message.
 */
export const CODES_API = [
  'NON_AUTHENTIFIE',
  'IDENTIFIANTS_INVALIDES',
  'CSRF_INVALIDE',
  'MOT_DE_PASSE_A_CHANGER',
  'DROIT_INSUFFISANT',
  'NON_TROUVE',
  'VERSION_PERIMEE',
  'VALIDATION',
  'TRANSITION_INTERDITE',
  'JETON_INVALIDE',
  'FICHIER_REFUSE',
  'SLUG_FIGE',
  'MULTI_VENDEURS_INACTIF',
  'COORDONNEES_HORS_PAYS',
  'CATEGORIE_INCOMPATIBLE',
  'CATEGORIE_UTILISEE',
  'TROP_DE_REQUETES',
  'ERREUR_INTERNE',
] as const

/**
 * Message en français clair, **sans code ni trace technique** (D-17, U13). Le message du serveur
 * (en français, contrat § 4.1) passe en premier : il dit quel champ ou quel objet est en cause.
 * S'il manque, le dictionnaire donne le message du code. Le conflit de version a toujours le
 * message du dictionnaire (« … Rechargez la page »). Une panne donne un message générique.
 */
export function messageErreur(erreur: unknown): string {
  if (!estErreurApi(erreur)) return t('erreur.500.texte')
  if (erreur.code === CODES_CLIENT.reseau) return t('erreur.reseau')
  const connu = (CODES_API as readonly string[]).includes(erreur.code)
  const duDictionnaire = connu ? t(`erreur.code.${erreur.code}` as CleTraduction) : null
  if (erreur.code === 'VERSION_PERIMEE' && duDictionnaire) return duDictionnaire
  if (erreur.status >= 400 && erreur.status < 500) {
    return erreur.message.trim() || duDictionnaire || t('erreur.500.texte')
  }
  return t('erreur.500.texte')
}
