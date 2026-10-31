import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Onglets (motif ARIA « tabs ») : flèches gauche et droite, Début et Fin pour passer d'un
 * onglet à l'autre, un seul arrêt de tabulation pour la liste. **Tous les panneaux restent
 * montés** (masqués par `hidden`) : un champ de formulaire ne perd pas sa valeur quand on
 * change d'onglet.
 *
 * @example
 * <Onglets libelle="Langues" onglets={[
 *   { id: 'fr', libelle: 'Français', contenu: <Champ … /> },
 *   { id: 'en', libelle: 'Anglais', indicateur: <span>À traduire</span>, contenu: <Champ … /> },
 * ]} />
 */
export interface Onglet {
  id: string
  libelle: string
  /** Complément affiché dans l'onglet (état de traduction, compteur). */
  indicateur?: ReactNode
  contenu: ReactNode
}

export function Onglets({
  libelle,
  onglets,
  actif,
  surChange,
  className,
}: {
  libelle: string
  onglets: Onglet[]
  /** Onglet affiché, si le parent le pilote. */
  actif?: string
  surChange?: (id: string) => void
  className?: string
}) {
  const base = useId()
  const [interne, setInterne] = useState(onglets[0]?.id ?? '')
  const courant = actif ?? interne
  const boutons = useRef(new Map<string, HTMLButtonElement>())

  const choisir = (id: string, focaliser = false) => {
    setInterne(id)
    surChange?.(id)
    if (focaliser) boutons.current.get(id)?.focus()
  }

  const auClavier = (evenement: KeyboardEvent, index: number) => {
    const dernier = onglets.length - 1
    const cible =
      evenement.key === 'ArrowRight'
        ? index === dernier
          ? 0
          : index + 1
        : evenement.key === 'ArrowLeft'
          ? index === 0
            ? dernier
            : index - 1
          : evenement.key === 'Home'
            ? 0
            : evenement.key === 'End'
              ? dernier
              : null
    if (cible === null) return
    evenement.preventDefault()
    const onglet = onglets[cible]
    if (onglet) choisir(onglet.id, true)
  }

  return (
    <div className={className}>
      <div role="tablist" aria-label={libelle} className="flex gap-1 border-b border-sand-200">
        {onglets.map((onglet, index) => {
          const selectionne = onglet.id === courant
          return (
            <button
              key={onglet.id}
              ref={(element) => {
                if (element) boutons.current.set(onglet.id, element)
                else boutons.current.delete(onglet.id)
              }}
              type="button"
              role="tab"
              id={`${base}-onglet-${onglet.id}`}
              aria-selected={selectionne}
              aria-controls={`${base}-panneau-${onglet.id}`}
              tabIndex={selectionne ? 0 : -1}
              onClick={() => choisir(onglet.id)}
              onKeyDown={(evenement) => auClavier(evenement, index)}
              className={cn(
                '-mb-px inline-flex min-h-11 items-center gap-2 border-b-2 px-3 text-button transition-colors duration-(--d-fast)',
                selectionne
                  ? 'border-clay-600 font-semibold text-ink-900'
                  : 'border-transparent text-ink-700 hover:text-ink-900',
              )}
            >
              {onglet.libelle}
              {onglet.indicateur}
            </button>
          )
        })}
      </div>
      {onglets.map((onglet) => (
        <div
          key={onglet.id}
          role="tabpanel"
          id={`${base}-panneau-${onglet.id}`}
          aria-labelledby={`${base}-onglet-${onglet.id}`}
          hidden={onglet.id !== courant}
          className="pt-4"
        >
          {onglet.contenu}
        </div>
      ))}
    </div>
  )
}
