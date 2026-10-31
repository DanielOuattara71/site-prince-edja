import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react'
import { classesControle } from '@/components/ui/classes'
import { EnveloppeChamp } from '@/components/ui/EnveloppeChamp'
import { cn } from '@/lib/cn'

/**
 * Champ de saisie : libellé toujours relié, aide et erreur liées par `aria-describedby`,
 * `aria-invalid` sur erreur (sections 10 et 12 du prompt). Compatible React Hook Form.
 *
 * @example
 * <Champ libelle="Titre" required erreur={erreurs.titre?.message} {...register('titre')} />
 */
export interface PropsChamp extends InputHTMLAttributes<HTMLInputElement> {
  libelle: string
  aide?: ReactNode
  erreur?: string | undefined
  libelleMasque?: boolean
}

export const Champ = forwardRef<HTMLInputElement, PropsChamp>(function Champ(
  { libelle, aide, erreur, required, className, id, libelleMasque, ...props },
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
        <input
          ref={ref}
          {...controle}
          className={cn(classesControle(erreur), 'min-h-11')}
          {...props}
        />
      )}
    </EnveloppeChamp>
  )
})
