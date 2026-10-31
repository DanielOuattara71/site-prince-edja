import { forwardRef, useId, type InputHTMLAttributes, type ReactNode } from 'react'
import { MessageErreurChamp } from '@/components/ui/EnveloppeChamp'
import { cn } from '@/lib/cn'

/**
 * Case à cocher : la zone cliquable couvre la case **et** son libellé (44 px de haut au
 * moins). Compatible React Hook Form.
 *
 * @example
 * <Case libelle="Image décorative" aide="Aucun texte alternatif ne sera lu." {...register('decoratif')} />
 */
export interface PropsCase extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  libelle: ReactNode
  aide?: ReactNode
  erreur?: string | undefined
}

export const Case = forwardRef<HTMLInputElement, PropsCase>(function Case(
  { libelle, aide, erreur, className, id, ...props },
  ref,
) {
  const idAuto = useId()
  const idCase = id ?? idAuto
  const decrit =
    [aide ? `${idCase}-aide` : null, erreur ? `${idCase}-erreur` : null]
      .filter(Boolean)
      .join(' ') || undefined

  return (
    <div className={cn('space-y-1', className)}>
      <label
        htmlFor={idCase}
        className="flex min-h-11 cursor-pointer items-center gap-3 text-body text-ink-900 has-disabled:cursor-not-allowed has-disabled:text-ink-700"
      >
        <input
          ref={ref}
          id={idCase}
          type="checkbox"
          aria-describedby={decrit}
          aria-invalid={erreur ? true : undefined}
          className="size-5 shrink-0 accent-clay-600"
          {...props}
        />
        <span>{libelle}</span>
      </label>
      {aide ? (
        <p id={`${idCase}-aide`} className="pl-8 text-caption text-ink-700">
          {aide}
        </p>
      ) : null}
      {erreur ? <MessageErreurChamp id={`${idCase}-erreur`}>{erreur}</MessageErreurChamp> : null}
    </div>
  )
})
