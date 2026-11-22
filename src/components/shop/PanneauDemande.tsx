import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import { useDemande, envoyerDemande, varianteIdsDe } from '@/lib/demande'
import { SITE } from '@/acces/site'
import { useLangue } from '@/i18n/contexteLangue'
import { formatFCFA } from '@/lib/format'
import { LazyImage } from '@/components/media/LazyImage'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Field'
import { AvisFormulaireFerme } from '@/components/ui/AvisFormulaireFerme'
import { estRobot, formulairesOuverts, posterDemande } from '@/lib/formulaire'
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll'
import { usePiegeFocus } from '@/hooks/usePiegeFocus'

type Statut = 'idle' | 'sending' | 'success' | 'messagerie' | 'error'

/**
 * Panneau de la demande.
 *
 * Il ne calcule aucun total : sans prix validé, additionner des montants inventés
 * serait mentir. Il liste les pièces choisies et les transmet à la maison, qui répond
 * avec les disponibilités, les matières et les délais.
 *
 * L'envoi passe par l'API publique (`POST /public/api/v1/demandes`, contrat § 18) quand
 * une API est configurée pour ce build **et** que chaque pièce porte ses `varianteIds`
 * (catalogue servi par l'API). Sinon, comme pour les autres formulaires du site, la
 * messagerie du visiteur s'ouvre avec l'e-mail prêt à partir — rien n'est simulé.
 */
export function PanneauDemande({ ouvert, onFermer }: { ouvert: boolean; onFermer: () => void }) {
  const { pieces, retirer, vider } = useDemande()
  const { t, l } = useLangue()
  // Même piège que la lightbox et la recherche : focus amené à l'ouverture, rendu au
  // déclencheur à la fermeture. Le panneau avait son propre hook, qui ne rendait pas
  // le focus — le clavier se retrouvait en haut de la page sans explication.
  const panneau = usePiegeFocus<HTMLDivElement>(ouvert)
  const formRef = useRef<HTMLFormElement>(null)
  const succesRef = useRef<HTMLDivElement>(null)
  const [statut, setStatut] = useState<Statut>('idle')

  useLockBodyScroll(ouvert)

  // Remise à zéro de l'état d'envoi à la fermeture : ajustée pendant le rendu (patron
  // habituel du repo), pas dans un effet — un effet déclenche un rendu de plus, visible.
  const [precOuvert, setPrecOuvert] = useState(ouvert)
  if (precOuvert !== ouvert) {
    setPrecOuvert(ouvert)
    if (!ouvert) setStatut('idle')
  }

  useEffect(() => {
    if (!ouvert) return
    const surEchap = (evenement: KeyboardEvent) => {
      if (evenement.key === 'Escape') onFermer()
    }
    window.addEventListener('keydown', surEchap)
    return () => window.removeEventListener('keydown', surEchap)
  }, [ouvert, onFermer])

  // Le focus suivait le dernier élément interactif, démonté avec le formulaire : il retombait
  // sur le `<body>`, et un lecteur d'écran ne disait plus rien. Il va sur la confirmation.
  useEffect(() => {
    if (statut === 'success' || statut === 'messagerie') succesRef.current?.focus()
  }, [statut])

  if (!ouvert) return null

  async function handleSubmit(evenement: React.FormEvent<HTMLFormElement>) {
    evenement.preventDefault()
    if (!formRef.current || estRobot(formRef.current)) return

    const donnees = new FormData(formRef.current)
    const varianteIds = varianteIdsDe(pieces)
    // Sans API, sans id serveur ou plus de 20 variantes (plafond du contrat) : la
    // messagerie s'ouvre avec l'e-mail prêt — même règle que les autres formulaires.
    if (!formulairesOuverts || varianteIds.length === 0 || varianteIds.length > 20) {
      envoyerDemande(pieces, SITE.email, donnees)
      setStatut('messagerie')
      return
    }

    setStatut('sending')
    const envoye = await posterDemande(donnees, varianteIds)
    if (envoye) {
      // La demande est bien chez la maison : la sélection est purgée.
      vider()
      setStatut('success')
    } else {
      setStatut('error')
    }
  }

  if (statut === 'success' || statut === 'messagerie') {
    return (
      <div className="fixed inset-0 z-80 flex justify-end">
        <button
          type="button"
          aria-label={t('demande.fermer')}
          onClick={onFermer}
          className="absolute inset-0 bg-night-900/60"
        />
        <div
          ref={succesRef}
          role="status"
          tabIndex={-1}
          className="relative flex h-full w-full max-w-md flex-col items-start justify-center gap-5 overflow-y-auto bg-sand-50 px-8"
        >
          <p className="font-display uppercase text-heading-md text-ink-900">
            {l({ fr: 'Demande envoyée', en: 'Request sent' })}
            <span aria-hidden className="text-clay-500">
              .
            </span>
          </p>
          <p className="text-body text-ink-700">
            {statut === 'messagerie' ? t('demande.messagerie') : t('demande.envoyee')}
          </p>
          <Button variant="ghost-dark" onClick={onFermer}>
            {t('demande.fermer')}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-80 flex justify-end">
      <button
        type="button"
        aria-label={t('demande.fermer')}
        onClick={onFermer}
        className="absolute inset-0 bg-night-900/60"
      />

      <form ref={formRef} onSubmit={handleSubmit} className="relative flex h-full w-full max-w-md flex-col bg-sand-50">
        <div
          ref={panneau}
          role="dialog"
          aria-modal="true"
          aria-label={t('demande.titre')}
          className="flex h-full flex-col"
        >
        <div className="flex items-center justify-between gap-4 border-b border-sand-200 px-6 py-5">
          <h2 className="font-display uppercase text-heading-sm">{t('demande.titre')}</h2>
          <button
            type="button"
            onClick={onFermer}
            aria-label={t('demande.fermer')}
            className="flex size-11 items-center justify-center rounded-full border border-ink-500 text-ink-700 transition-colors duration-(--d-fast) hover:bg-sand-200"
          >
            <X aria-hidden className="size-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {!formulairesOuverts && <AvisFormulaireFerme />}
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
                    <p className="label-caps text-ink-900">{piece.nom}</p>
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

          {pieces.length > 0 && (
            <div className="mt-6 space-y-4">
              {/* Champ piège du contrat (`siteWeb`) : invisible, laissé vide par un humain. */}
              <input
                type="text"
                name="siteWeb"
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
                aria-hidden
              />
              <Input label={t('demande.nom')} id="nom" autoComplete="name" required />
              <Input
                label={t('demande.email')}
                id="email"
                type="email"
                autoComplete="email"
                required
              />
              <Textarea
                label={t('demande.message')}
                id="message"
                rows={3}
                placeholder={l({
                  fr: 'Matière, taille, couleur, occasion…',
                  en: 'Material, size, colour, occasion…',
                })}
              />
            </div>
          )}
        </div>

        <div className="space-y-4 border-t border-sand-200 px-6 py-5">
          {statut === 'error' && (
            <p role="alert" className="text-body text-ink-700">
              {t('demande.echec')}{' '}
              <a href={`mailto:${SITE.email}`} className="text-clay-600 underline underline-offset-2">
                {SITE.email}
              </a>
            </p>
          )}
          {pieces.length > 0 && (
            <>
              <Button variant="primary" magnetic={false} type="submit" disabled={statut === 'sending'} className="w-full">
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
            {l({
              fr: 'Aucune transaction n’a lieu sur ce site.',
              en: 'No transaction happens on this site.',
            })}
          </p>
        </div>
        </div>
      </form>
    </div>
  )
}
