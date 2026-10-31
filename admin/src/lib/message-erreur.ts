import { CODES_CLIENT, estErreurApi } from '@/api/erreurs'
import { t } from '@/i18n/fr'

/**
 * Message en français clair, sans trace technique (D-17) : le message du serveur pour une
 * erreur de l'utilisateur (4xx), un message générique pour une panne. Les codes RG sont
 * rappelés en petit, pour faire le lien avec la documentation (section 11).
 */
export function messageErreur(erreur: unknown): string {
  if (!estErreurApi(erreur)) return t('erreur.500.texte')
  if (erreur.code === CODES_CLIENT.reseau) return t('erreur.reseau')
  if (erreur.status >= 400 && erreur.status < 500) {
    return erreur.code.startsWith('RG-') ? `${erreur.message} (${erreur.code})` : erreur.message
  }
  return t('erreur.500.texte')
}
