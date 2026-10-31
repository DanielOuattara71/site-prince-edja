import { X } from 'lucide-react'
import { useEffect, useId, useRef, type ReactNode } from 'react'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Boîte de dialogue modale sur `<dialog>` natif (D-34) : piège de focus, fond inerte et
 * fermeture sur Échap fournis par le navigateur. Le focus revient à l'élément qui l'a
 * ouverte. `fermable={false}` retire la croix et ignore Échap (écran verrouillé).
 *
 * @example
 * <BoiteDialogue ouverte={ouverte} surFermeture={() => setOuverte(false)} titre="Choisir une image"
 *   actions={<Bouton onClick={valider}>Choisir</Bouton>}>
 *   …
 * </BoiteDialogue>
 */
export function BoiteDialogue({
  ouverte,
  surFermeture,
  titre,
  description,
  children,
  actions,
  taille = 'normale',
  fermable = true,
}: {
  ouverte: boolean
  surFermeture: () => void
  titre: string
  description?: ReactNode
  children?: ReactNode
  actions?: ReactNode
  taille?: 'normale' | 'large'
  fermable?: boolean
}) {
  const ref = useRef<HTMLDialogElement>(null)
  const declencheur = useRef<Element | null>(null)
  const id = useId()
  // Dernière valeur des props lue par les écouteurs natifs, sans les réabonner.
  const etat = useRef({ ouverte, surFermeture, fermable })
  useEffect(() => {
    etat.current = { ouverte, surFermeture, fermable }
  })

  useEffect(() => {
    const dialogue = ref.current
    if (!dialogue) return
    if (ouverte && !dialogue.open) {
      declencheur.current = document.activeElement
      // jsdom n'implémente pas `showModal` : l'attribut suffit pour les tests.
      if (typeof dialogue.showModal === 'function') dialogue.showModal()
      else dialogue.setAttribute('open', '')
    } else if (!ouverte && dialogue.open) {
      if (typeof dialogue.close === 'function') dialogue.close()
      else dialogue.removeAttribute('open')
    }
  }, [ouverte])

  useEffect(() => {
    const dialogue = ref.current
    if (!dialogue) return
    const surAnnulation = (evenement: Event) => {
      if (!etat.current.fermable) evenement.preventDefault()
    }
    const surFermetureNative = () => {
      if (declencheur.current instanceof HTMLElement) declencheur.current.focus()
      declencheur.current = null
      if (etat.current.ouverte) etat.current.surFermeture()
    }
    dialogue.addEventListener('cancel', surAnnulation)
    dialogue.addEventListener('close', surFermetureNative)
    return () => {
      dialogue.removeEventListener('cancel', surAnnulation)
      dialogue.removeEventListener('close', surFermetureNative)
    }
  }, [])

  return (
    <dialog
      ref={ref}
      aria-labelledby={`${id}-titre`}
      aria-describedby={description ? `${id}-description` : undefined}
      className={cn(
        'm-auto max-h-[90svh] w-[calc(100%-2rem)] overflow-y-auto rounded-xl bg-sand-50 p-0 text-ink-900 shadow-xl backdrop:bg-night-900/60',
        taille === 'large' ? 'max-w-4xl' : 'max-w-lg',
      )}
    >
      {ouverte ? (
        <div className="flex flex-col gap-4 p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <h2 id={`${id}-titre`} className="font-display text-heading-sm text-ink-900 uppercase">
              {titre}
            </h2>
            {fermable ? (
              <button
                type="button"
                onClick={surFermeture}
                className="-mt-2 -mr-2 inline-flex size-11 shrink-0 items-center justify-center rounded-md text-ink-900 hover:bg-sand-100"
              >
                <X aria-hidden className="size-5" />
                <span className="sr-only">{t('dialogue.fermer')}</span>
              </button>
            ) : null}
          </div>
          {description ? (
            <div id={`${id}-description`} className="text-body text-ink-700">
              {description}
            </div>
          ) : null}
          {children}
          {actions ? (
            <div className="flex flex-col-reverse gap-2 border-t border-sand-200 pt-4 sm:flex-row sm:justify-end">
              {actions}
            </div>
          ) : null}
        </div>
      ) : null}
    </dialog>
  )
}
