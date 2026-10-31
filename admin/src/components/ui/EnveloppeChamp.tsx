import { useId, type ReactNode } from 'react'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Libellé, aide et erreur communs à toutes les primitives de formulaire (section 10) :
 * le libellé est relié au contrôle, l'aide et l'erreur passent par `aria-describedby`,
 * `aria-invalid` signale l'erreur. Le contrôle lui-même est rendu par `children`.
 *
 * @example
 * <EnveloppeChamp libelle="Légende" erreur={erreurs.legende?.message}>
 *   {(controle) => <input {...controle} {...register('legende')} />}
 * </EnveloppeChamp>
 */
export interface ProprietesControle {
  id: string
  'aria-describedby': string | undefined
  'aria-invalid': true | undefined
  required: boolean | undefined
}

export function EnveloppeChamp({
  libelle,
  aide,
  erreur,
  requis,
  id,
  className,
  libelleMasque = false,
  children,
}: {
  libelle: string
  aide?: ReactNode
  erreur?: string | undefined
  requis?: boolean | undefined
  id?: string | undefined
  className?: string | undefined
  /** Libellé lu par les lecteurs d'écran seulement (cellule de tableau, filtre compact). */
  libelleMasque?: boolean
  children: (controle: ProprietesControle) => ReactNode
}) {
  const idAuto = useId()
  const idChamp = id ?? idAuto
  const idAide = `${idChamp}-aide`
  const idErreur = `${idChamp}-erreur`
  const decrit = [aide ? idAide : null, erreur ? idErreur : null].filter(Boolean).join(' ')

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={idChamp}
        className={cn('block text-body font-semibold text-ink-900', libelleMasque && 'sr-only')}
      >
        {libelle}
        {requis ? (
          <span className="ml-1 text-caption font-normal text-ink-700">
            ({t('champ.obligatoire')})
          </span>
        ) : null}
      </label>
      {aide ? (
        <p id={idAide} className="text-caption text-ink-700">
          {aide}
        </p>
      ) : null}
      {children({
        id: idChamp,
        'aria-describedby': decrit || undefined,
        'aria-invalid': erreur ? true : undefined,
        required: requis,
      })}
      {erreur ? <MessageErreurChamp id={idErreur}>{erreur}</MessageErreurChamp> : null}
    </div>
  )
}

export function MessageErreurChamp({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-caption font-semibold text-clay-700">
      <span aria-hidden>⚠ </span>
      {children}
    </p>
  )
}
