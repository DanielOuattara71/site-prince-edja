import { useState } from 'react'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Bouton } from '@/components/ui/Bouton'
import { ZoneTexte } from '@/components/ui/ZoneTexte'
import { t } from '@/i18n/fr'

/**
 * Refus d'un contenu en relecture (§ 7.3) : le motif est obligatoire (3 à 1000 caractères), il
 * est conservé sur le contenu (`dernierMotifRefus`) et visible par son auteur.
 */
export function DialogueRefus({
  ouverte,
  titreContenu,
  enCours,
  surRefus,
  surAnnuler,
}: {
  ouverte: boolean
  titreContenu: string
  enCours: boolean
  surRefus: (motif: string) => void
  surAnnuler: () => void
}) {
  const [motif, setMotif] = useState('')
  const [ouverteVue, setOuverteVue] = useState(ouverte)
  if (ouverteVue !== ouverte) {
    setOuverteVue(ouverte)
    if (ouverte) setMotif('')
  }
  const valide = motif.trim().length >= 3

  return (
    <BoiteDialogue
      ouverte={ouverte}
      surFermeture={surAnnuler}
      titre={t('refus.titre')}
      description={`${t('refus.description')} « ${titreContenu} »`}
      actions={
        <>
          <Bouton variante="secondaire" onClick={surAnnuler} disabled={enCours}>
            {t('confirmation.annuler')}
          </Bouton>
          <Bouton onClick={() => surRefus(motif.trim())} disabled={!valide || enCours}>
            {enCours ? t('confirmation.enCours') : t('refus.confirmer')}
          </Bouton>
        </>
      }
    >
      <ZoneTexte
        libelle={t('refus.motif')}
        aide={t('refus.aide')}
        required
        maxLength={1000}
        value={motif}
        onChange={(evenement) => setMotif(evenement.target.value)}
      />
    </BoiteDialogue>
  )
}
