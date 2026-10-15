import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useDemande, envoyerDemande } from '@/lib/demande'
import { SITE } from '@/data/site'
import { useLangue } from '@/i18n/contexteLangue'
import { formatFCFA } from '@/lib/format'
import { LazyImage } from '@/components/media/LazyImage'
import { Button } from '@/components/ui/Button'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { usePiegeFocus } from '@/hooks/usePiegeFocus'

/**
 * Panneau de la demande.
 *
 * Il ne calcule aucun total : sans prix validé, additionner des montants inventés
 * serait mentir. Il liste les pièces choisies et les transmet à la maison, qui répond
 * avec les disponibilités, les matières et les délais.
 */
export function PanneauDemande({ ouvert, onFermer }: { ouvert: boolean; onFermer: () => void }) {
  const { pieces, retirer, vider } = useDemande()
  const { t, l } = useLangue()
  // Même piège que la lightbox et la recherche : focus amené à l'ouverture, rendu au
  // déclencheur à la fermeture. Le panneau avait son propre hook, qui ne rendait pas
  // le focus — le clavier se retrouvait en haut de la page sans explication.
  const panneau = usePiegeFocus<HTMLDivElement>(ouvert)
  const [envoye, setEnvoye] = useState(false)

  useLockBodyScroll(ouvert)

  useEffect(() => {
    if (!ouvert) return
    const surEchap = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') onFermer()
    }
    window.addEventListener('keydown', surEchap)
    return () => window.removeEventListener('keydown', surEchap)
  }, [ouvert, onFermer])

  useEffect(() => {
    if (!ouvert) setEnvoye(false)
  }, [ouvert])

  if (!ouvert) return null

  return (
    <div className="fixed inset-0 z-80 flex justify-end">
      <button
        type="button"
        aria-label={t('demande.fermer')}
        onClick={onFermer}
        className="absolute inset-0 bg-night-900/60"
      />

      <div
        ref={panneau}
        role="dialog"
        aria-modal="true"
        aria-label={t('demande.titre')}
        className="relative flex h-full w-full max-w-md flex-col bg-sand-50"
      >
        <div className="flex items-center justify-between gap-4 border-b border-sand-200 px-6 py-5">
          <h2 className="font-display uppercase text-heading-sm">{t('demande.titre')}</h2>
          <button
            type="button"
            onClick={onFermer}
            aria-label={t('demande.fermer')}
            className="flex size-11 items-center justify-center rounded-full border border-sand-300 text-ink-700 transition-colors duration-(--d-fast) hover:bg-sand-200"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {pieces.length === 0 ? (
            <p className="text-body text-ink-500">{t('demande.vide')}</p>
          ) : (
            <ul className="space-y-4">
              {pieces.map((piece) => (
                <li key={piece.slug} className="flex gap-4 border-b border-sand-200 pb-4">
                  <LazyImage
                    src={piece.image}
                    alt={piece.nom}
                    ratio="4/5"
                    className="w-20 shrink-0 overflow-hidden rounded-md bg-sand-200"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="label-caps text-ink-900">
                      {piece.nom}
                    </p>
                    <p className="mt-1 text-caption text-ink-500">
                      {piece.commerce?.prix != null && piece.commerce.prixConfirme
                        ? formatFCFA(piece.commerce.prix)
                        : t('demande.surDemande')}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => retirer(piece.slug)}
                    className="inline-flex min-h-11 items-center self-start px-2 text-caption text-ink-500 underline"
                  >
                    {t('demande.retirer')}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="space-y-4 border-t border-sand-200 px-6 py-5">
          {envoye ? (
            <p className="text-body text-ink-700">{t('demande.envoyee')}</p>
          ) : (
            <>
              <Button
                variant="primary"
                magnetic={false}
                onClick={() => {
                  envoyerDemande(pieces, SITE.email)
                  setEnvoye(true)
                }}
              >
                {t('demande.envoyer')}
              </Button>
              <p className="text-caption text-ink-500">{t('demande.explication')}</p>
            </>
          )}
          {pieces.length > 0 && (
            <button
              type="button"
              onClick={vider}
              className="inline-flex min-h-11 items-center text-caption text-ink-500 underline"
            >
              {t('demande.vider')}
            </button>
          )}
          <p className="sr-only">
            {l({ fr: 'Aucune transaction n’a lieu sur ce site.', en: 'No transaction happens on this site.' })}
          </p>
        </div>
      </div>
    </div>
  )
}
