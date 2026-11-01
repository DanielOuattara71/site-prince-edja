import { move } from '@dnd-kit/helpers'
import { DragDropProvider } from '@dnd-kit/react'
import { useSortable } from '@dnd-kit/react/sortable'
import { ArrowDown, ArrowUp, GripVertical } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Liste réordonnable (section 10) : glisser-déposer (dnd-kit) **et** boutons « monter » et
 * « descendre », qui rendent l'ordre indépendant de la souris (D-03). Chaque déplacement est
 * annoncé (« … en position 2 sur 5 ») et le focus suit l'élément déplacé. Le composant émet
 * le nouvel ordre ; l'écran l'enregistre (`PATCH /{ressource}/ordre`).
 *
 * @example
 * <ListeOrdonnable libelle="Ordre des jalons" elements={jalons} cle={(j) => j.id}
 *   nom={(j) => j.titre} surOrdre={(nouveaux) => ordonner.mutate(nouveaux.map((j) => j.id))} />
 */
export function ListeOrdonnable<T>({
  libelle,
  elements,
  cle,
  nom,
  renderLigne,
  surOrdre,
  desactivee = false,
}: {
  libelle: string
  elements: T[]
  cle: (element: T) => string
  /** Nom court de l'élément, lu dans les annonces et les boutons. */
  nom: (element: T) => string
  /** Contenu d’une ligne (nom de prop « render… » : rendu à la demande, pas un composant). */
  renderLigne?: (element: T) => ReactNode
  surOrdre: (elements: T[]) => void
  desactivee?: boolean
}) {
  const [annonce, setAnnonce] = useState('')
  const [focusApres, setFocusApres] = useState<{ id: string; sens: 'haut' | 'bas' } | null>(null)
  const boutons = useRef(new Map<string, HTMLButtonElement>())
  const parId = new Map(elements.map((element) => [cle(element), element]))

  useEffect(() => {
    if (!focusApres) return
    const voulu = boutons.current.get(`${focusApres.id}-${focusApres.sens}`)
    const autre = boutons.current.get(
      `${focusApres.id}-${focusApres.sens === 'haut' ? 'bas' : 'haut'}`,
    )
    ;(voulu && !voulu.disabled ? voulu : autre)?.focus()
  }, [focusApres])

  const annoncer = (ordre: T[], id: string) => {
    const index = ordre.findIndex((element) => cle(element) === id)
    const element = ordre[index]
    if (!element) return
    setAnnonce(
      `« ${nom(element)} » ${t('ordre.enPosition')} ${index + 1} ${t('ordre.sur')} ${ordre.length}.`,
    )
  }

  const deplacer = (index: number, sens: 'haut' | 'bas') => {
    const cible = sens === 'haut' ? index - 1 : index + 1
    const element = elements[index]
    if (!element || cible < 0 || cible >= elements.length) return
    const ordre = [...elements]
    ordre.splice(index, 1)
    ordre.splice(cible, 0, element)
    surOrdre(ordre)
    annoncer(ordre, cle(element))
    setFocusApres({ id: cle(element), sens })
  }

  return (
    <div>
      <DragDropProvider
        onDragEnd={(evenement) => {
          if (evenement.canceled || desactivee) return
          const ids = move(elements.map(cle), evenement)
          const ordre = ids
            .map((id) => parId.get(String(id)))
            .filter((e): e is T => e !== undefined)
          const source = evenement.operation.source?.id
          if (ids.some((id, index) => id !== cle(elements[index] as T))) {
            surOrdre(ordre)
            if (source !== undefined) annoncer(ordre, String(source))
          }
        }}
      >
        <ol aria-label={libelle} className="space-y-2">
          {elements.map((element, index) => (
            <ElementOrdonnable
              key={cle(element)}
              id={cle(element)}
              index={index}
              nom={nom(element)}
              premier={index === 0}
              dernier={index === elements.length - 1}
              desactivee={desactivee}
              enregistrerBouton={(sens, bouton) => {
                const cleBouton = `${cle(element)}-${sens}`
                if (bouton) boutons.current.set(cleBouton, bouton)
                else boutons.current.delete(cleBouton)
              }}
              surDeplacer={(sens) => deplacer(index, sens)}
            >
              {renderLigne ? renderLigne(element) : nom(element)}
            </ElementOrdonnable>
          ))}
        </ol>
      </DragDropProvider>
      <p aria-live="assertive" className="sr-only">
        {annonce}
      </p>
    </div>
  )
}

function ElementOrdonnable({
  id,
  index,
  nom,
  premier,
  dernier,
  desactivee,
  enregistrerBouton,
  surDeplacer,
  children,
}: {
  id: string
  index: number
  nom: string
  premier: boolean
  dernier: boolean
  desactivee: boolean
  enregistrerBouton: (sens: 'haut' | 'bas', bouton: HTMLButtonElement | null) => void
  surDeplacer: (sens: 'haut' | 'bas') => void
  children: ReactNode
}) {
  const { ref, handleRef, isDragging } = useSortable({ id, index, disabled: desactivee })
  const classesBouton =
    'inline-flex size-11 items-center justify-center rounded-md text-ink-900 hover:bg-sand-200 disabled:cursor-not-allowed disabled:opacity-40'

  return (
    <li
      ref={ref}
      className={cn(
        'flex items-center gap-2 rounded-md border border-sand-200 bg-sand-50 p-1.5',
        isDragging && 'opacity-60 shadow-lg',
      )}
    >
      <span
        ref={handleRef}
        aria-hidden
        className="inline-flex size-11 shrink-0 cursor-grab items-center justify-center text-ink-700"
      >
        <GripVertical className="size-5" />
      </span>
      <span className="tnum w-6 shrink-0 text-caption text-ink-700">{index + 1}.</span>
      <div className="min-w-0 flex-1 text-body text-ink-900">{children}</div>
      <button
        ref={(bouton) => enregistrerBouton('haut', bouton)}
        type="button"
        className={classesBouton}
        disabled={premier || desactivee}
        onClick={() => surDeplacer('haut')}
      >
        <ArrowUp aria-hidden className="size-5" />
        <span className="sr-only">
          {t('ordre.monter')} « {nom} »
        </span>
      </button>
      <button
        ref={(bouton) => enregistrerBouton('bas', bouton)}
        type="button"
        className={classesBouton}
        disabled={dernier || desactivee}
        onClick={() => surDeplacer('bas')}
      >
        <ArrowDown aria-hidden className="size-5" />
        <span className="sr-only">
          {t('ordre.descendre')} « {nom} »
        </span>
      </button>
    </li>
  )
}
