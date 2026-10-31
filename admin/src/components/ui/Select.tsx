import { ChevronDown } from 'lucide-react'
import { forwardRef, type ReactNode, type SelectHTMLAttributes } from 'react'
import { classesControle } from '@/components/ui/classes'
import { EnveloppeChamp } from '@/components/ui/EnveloppeChamp'
import { cn } from '@/lib/cn'

/**
 * Liste déroulante native : clavier, recherche par saisie et lecteurs d'écran fournis par
 * le navigateur. `options` ou des `<option>` en enfants.
 *
 * @example
 * <Select libelle="Catégorie" options={CATEGORIES.map((c) => ({ valeur: c, libelle: c }))} {...register('categorie')} />
 */
export interface OptionSelect {
  valeur: string
  libelle: string
  desactivee?: boolean
}

export interface PropsSelect extends SelectHTMLAttributes<HTMLSelectElement> {
  libelle: string
  aide?: ReactNode
  erreur?: string | undefined
  options?: OptionSelect[]
  /** Première option vide (« Choisir… ») : aucune valeur n'est préremplie à la place de l'utilisateur. */
  invite?: string
  libelleMasque?: boolean
}

export const Select = forwardRef<HTMLSelectElement, PropsSelect>(function Select(
  {
    libelle,
    aide,
    erreur,
    required,
    className,
    id,
    options,
    invite,
    children,
    libelleMasque,
    ...props
  },
  ref,
) {
  return (
    <EnveloppeChamp
      libelle={libelle}
      aide={aide}
      erreur={erreur}
      requis={required}
      id={id}
      className={className}
      {...(libelleMasque ? { libelleMasque } : {})}
    >
      {(controle) => (
        <div className="relative">
          <select
            ref={ref}
            {...controle}
            className={cn(classesControle(erreur), 'min-h-11 appearance-none pr-10')}
            {...props}
          >
            {invite !== undefined ? <option value="">{invite}</option> : null}
            {options?.map((option) => (
              <option key={option.valeur} value={option.valeur} disabled={option.desactivee}>
                {option.libelle}
              </option>
            ))}
            {children}
          </select>
          <ChevronDown
            aria-hidden
            className="pointer-events-none absolute top-1/2 right-3 size-5 -translate-y-1/2 text-ink-700"
          />
        </div>
      )}
    </EnveloppeChamp>
  )
})
