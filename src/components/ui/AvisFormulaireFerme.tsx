import { SITE } from '@/acces/site'
import { useLangue } from '@/i18n/contexteLangue'

/**
 * Formulaire sans API publique configurée (`formulairesOuverts` faux) : repli par e-mail, décidé
 * par le client le 07/11/2026 (rapport d'audit V2, § 8.1).
 *
 * - `ferme` : annoncé dès l'arrivée — le bouton préparera un e-mail, pas un envoi en ligne.
 * - `messagerie` : après le clic — la messagerie s'ouvre ; si rien ne s'ouvre, l'adresse reste là.
 */
export function AvisFormulaireFerme({ etat = 'ferme' }: { etat?: 'ferme' | 'messagerie' }) {
  const { t } = useLangue()
  return (
    <p className="rounded-md border border-sand-300 bg-sand-150 p-4 text-body text-ink-700">
      {t(etat === 'ferme' ? 'formulaire.ferme' : 'formulaire.messagerie')}{' '}
      <a
        href={`mailto:${SITE.email}`}
        className="font-semibold text-clay-600 underline underline-offset-4 hover:text-clay-700"
      >
        {SITE.email}
      </a>
      .
    </p>
  )
}
