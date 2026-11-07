import { useState } from 'react'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Bouton } from '@/components/ui/Bouton'
import { t } from '@/i18n/fr'

/**
 * Conflit de version (409 `VERSION_PERIMEE`, ECRANS § 0.3) : rien n'est écrasé en silence.
 * « Copier mon texte » met la saisie dans le presse-papiers ; « Recharger » reprend la version
 * du serveur.
 */
export function DialogueConflit({
  ouverte,
  surRecharger,
  surFermer,
  texte,
}: {
  ouverte: boolean
  surRecharger: () => void
  surFermer: () => void
  /** Saisie courante, lue au moment du clic. */
  texte: () => string
}) {
  const [copie, setCopie] = useState<'ok' | 'echec' | null>(null)

  const copier = async () => {
    try {
      await navigator.clipboard.writeText(texte())
      setCopie('ok')
    } catch {
      setCopie('echec')
    }
  }

  return (
    <BoiteDialogue
      ouverte={ouverte}
      surFermeture={surFermer}
      titre={t('conflit.titre')}
      description={t('conflit.texte')}
      actions={
        <>
          <Bouton variante="secondaire" onClick={() => void copier()}>
            {t('conflit.copier')}
          </Bouton>
          <Bouton onClick={surRecharger}>{t('conflit.recharger')}</Bouton>
        </>
      }
    >
      <p aria-live="polite" className="text-body text-ink-700">
        {copie === 'ok' ? t('conflit.copie') : copie === 'echec' ? t('conflit.copieEchec') : ''}
      </p>
    </BoiteDialogue>
  )
}
