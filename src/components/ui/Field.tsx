import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Primitives de champ.
 *
 * L'anneau de focus n'est **pas** supprimé ici. `focus:outline-none` battait l'anneau
 * terracotta global défini dans `globals.css`, et le clavier se déplaçait sans aucun
 * repère visible sur les dix champs du site. Les champs portent donc l'anneau
 * eux-mêmes, comme `CtaTravailler` a dû le faire pour la même raison.
 */
const BASE_FIELD =
  'w-full rounded-md border border-sand-200 bg-transparent px-4 py-3 text-body text-ink-900 placeholder:text-ink-500 transition-colors duration-(--d-fast) focus:border-leaf-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600'

/** Libellé, indice et message d'erreur reliés au contrôle par `aria-describedby`. */
function FieldWrap({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  required?: boolean
  children: ReactNode
}) {
  return (
    <div className="space-y-2">
      <label htmlFor={htmlFor} className="label-caps text-ink-500">
        {label}
        {/* Le `required` natif ne se voit pas : sans ce repère, on ne découvre les
            champs obligatoires qu'après un premier envoi refusé. */}
        {required && (
          <span aria-hidden className="ml-1 text-clay-700">
            *
          </span>
        )}
      </label>

      {hint && (
        <p id={`${htmlFor}-indice`} className="text-caption text-ink-500">
          {hint}
        </p>
      )}

      {error && (
        <p id={`${htmlFor}-erreur`} className="text-caption font-semibold text-clay-700">
          {error}
        </p>
      )}

      {children}
    </div>
  )
}

/** Identifiants des messages rattachés à un champ, pour `aria-describedby`. */
function descriptions(id: string, hint?: string, error?: string): string | undefined {
  const liste = [hint && `${id}-indice`, error && `${id}-erreur`].filter(Boolean)
  return liste.length > 0 ? liste.join(' ') : undefined
}

interface ChampsCommuns {
  label: string
  id: string
  /** Aide affichée sous le libellé, annoncée avec le champ. */
  hint?: string
  /** Message d'erreur ; colore aussi la bordure et pose `aria-invalid`. */
  error?: string
}

// `id` est omis de chaque type HTML puis redéclaré en obligatoire : sinon sa version
// optionnelle l'emporte et les props deviennent toutes facultatives.
interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'>, ChampsCommuns {}

export function Input({ label, id, className, hint, error, ...props }: InputProps) {
  return (
    <FieldWrap label={label} htmlFor={id} hint={hint} error={error} required={props.required}>
      <input
        id={id}
        name={id}
        aria-describedby={descriptions(id, hint, error)}
        aria-invalid={error ? true : undefined}
        className={cn(BASE_FIELD, error && 'border-clay-700', className)}
        {...props}
      />
    </FieldWrap>
  )
}

interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'>,
    ChampsCommuns {}

export function Textarea({ label, id, className, hint, error, rows = 5, ...props }: TextareaProps) {
  return (
    <FieldWrap label={label} htmlFor={id} hint={hint} error={error} required={props.required}>
      <textarea
        id={id}
        name={id}
        rows={rows}
        aria-describedby={descriptions(id, hint, error)}
        aria-invalid={error ? true : undefined}
        className={cn(BASE_FIELD, error && 'border-clay-700', className)}
        {...props}
      />
    </FieldWrap>
  )
}

// `id` est omis : il est redéfini en obligatoire par `ChampsCommuns`, sinon les deux
// types étendus n'ont pas le même `id` et l'interface devient inutilisable.
interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id'>,
    ChampsCommuns {
  options: string[]
  /** Libellé de l'option neutre. Sans elle, la première valeur est sélectionnée par
   *  défaut et `required` ne peut jamais échouer. */
  optionVide?: string
}

export function Select({
  label,
  id,
  options,
  className,
  hint,
  error,
  optionVide,
  ...props
}: SelectProps) {
  return (
    <FieldWrap label={label} htmlFor={id} hint={hint} error={error} required={props.required}>
      <select
        id={id}
        name={id}
        aria-describedby={descriptions(id, hint, error)}
        aria-invalid={error ? true : undefined}
        className={cn(BASE_FIELD, 'cursor-pointer', error && 'border-clay-700', className)}
        {...props}
      >
        {optionVide && <option value="">{optionVide}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </FieldWrap>
  )
}
