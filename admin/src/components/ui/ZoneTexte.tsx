import { forwardRef, useState, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { classesControle } from '@/components/ui/classes'
import { EnveloppeChamp } from '@/components/ui/EnveloppeChamp'
import { cn } from '@/lib/cn'

/**
 * Zone de texte multiligne. Avec `maxLength`, un compteur « n / max » est affiché sous la
 * zone et annoncé poliment une fois la limite proche (section 12 : rien ne se coupe en silence).
 *
 * @example
 * <ZoneTexte libelle="Résumé" maxLength={400} erreur={erreurs.extrait?.message} {...register('extrait')} />
 */
export interface PropsZoneTexte extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  libelle: string
  aide?: ReactNode
  erreur?: string | undefined
}

export const ZoneTexte = forwardRef<HTMLTextAreaElement, PropsZoneTexte>(function ZoneTexte(
  { libelle, aide, erreur, required, className, id, maxLength, rows = 4, onChange, ...props },
  ref,
) {
  const valeurInitiale = props.value ?? props.defaultValue ?? ''
  const [longueur, setLongueur] = useState(String(valeurInitiale).length)
  const longueurAffichee = props.value === undefined ? longueur : String(props.value).length
  const proche = maxLength !== undefined && longueurAffichee >= maxLength * 0.9

  return (
    <EnveloppeChamp
      libelle={libelle}
      aide={aide}
      erreur={erreur}
      requis={required}
      id={id}
      className={className}
    >
      {(controle) => (
        <>
          <textarea
            ref={ref}
            {...controle}
            rows={rows}
            maxLength={maxLength}
            onChange={(evenement) => {
              setLongueur(evenement.target.value.length)
              onChange?.(evenement)
            }}
            className={cn(classesControle(erreur), 'min-h-11 py-2')}
            {...props}
          />
          {maxLength !== undefined ? (
            <p
              className={cn(
                'tnum text-right text-caption',
                proche ? 'text-clay-700' : 'text-ink-700',
              )}
              aria-live={proche ? 'polite' : 'off'}
            >
              {longueurAffichee} / {maxLength}
            </p>
          ) : null}
        </>
      )}
    </EnveloppeChamp>
  )
})
