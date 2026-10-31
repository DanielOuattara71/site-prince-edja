import { useState } from 'react'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { t } from '@/i18n/fr'

/**
 * Confirmation d'une action (section 10) : elle **nomme** l'objet concerné et, pour une
 * action groupée, le nombre d'éléments touchés. `saisieAttendue` impose de recopier un
 * texte (double saisie de RG-16, changement de rôle). « Annuler » vient en premier : c'est
 * lui que la touche Entrée atteint d'abord.
 *
 * @example
 * <Confirmation ouverte={ouverte} titre="Supprimer le média" objet="Coucher de soleil"
 *   libelleConfirmer="Supprimer" danger surConfirmer={supprimer} surAnnuler={() => setOuverte(false)} />
 */
export function Confirmation({
  ouverte,
  titre,
  objet,
  nombre,
  consequence,
  libelleConfirmer,
  libelleAnnuler = t('confirmation.annuler'),
  danger = false,
  saisieAttendue,
  enCours = false,
  surConfirmer,
  surAnnuler,
}: {
  ouverte: boolean
  titre: string
  /** Nom de l'objet visé, affiché entre guillemets. */
  objet?: string
  /** Nombre d'éléments touchés par une action groupée. */
  nombre?: number
  consequence?: string
  libelleConfirmer: string
  libelleAnnuler?: string
  danger?: boolean
  saisieAttendue?: string
  enCours?: boolean
  surConfirmer: () => void
  surAnnuler: () => void
}) {
  const [saisie, setSaisie] = useState('')
  const [ouverteVue, setOuverteVue] = useState(ouverte)
  // La saisie repart de zéro à chaque ouverture (ajustement pendant le rendu, sans effet).
  if (ouverteVue !== ouverte) {
    setOuverteVue(ouverte)
    if (ouverte) setSaisie('')
  }
  const saisieValide = saisieAttendue === undefined || saisie.trim() === saisieAttendue

  return (
    <BoiteDialogue
      ouverte={ouverte}
      surFermeture={surAnnuler}
      titre={titre}
      description={
        <>
          {objet ? (
            <p>
              {t('confirmation.objet')} <strong className="text-ink-900">« {objet} »</strong>
            </p>
          ) : null}
          {nombre !== undefined ? (
            <p>
              <strong className="tnum text-ink-900">{nombre}</strong>{' '}
              {nombre > 1 ? t('confirmation.elements') : t('confirmation.element')}
            </p>
          ) : null}
          {consequence ? <p className="mt-2">{consequence}</p> : null}
        </>
      }
      actions={
        <>
          <Bouton variante="secondaire" onClick={surAnnuler} disabled={enCours}>
            {libelleAnnuler}
          </Bouton>
          <Bouton
            variante={danger ? 'danger' : 'primaire'}
            onClick={surConfirmer}
            disabled={!saisieValide || enCours}
          >
            {enCours ? t('confirmation.enCours') : libelleConfirmer}
          </Bouton>
        </>
      }
    >
      {saisieAttendue !== undefined ? (
        <Champ
          libelle={`${t('confirmation.recopier')} « ${saisieAttendue} »`}
          value={saisie}
          onChange={(evenement) => setSaisie(evenement.target.value)}
          autoComplete="off"
        />
      ) : null}
    </BoiteDialogue>
  )
}
