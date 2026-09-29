import { useState } from 'react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

interface MediaFrameProps {
  src: string
  alt: string
  /** `porte` (mannequin) · `plat` (objet posé) · `macro` (le geste) · `ambiance` */
  type?: 'porte' | 'plat' | 'macro' | 'ambiance'
  ratio?: string
  priority?: boolean
  /** Second visuel revealed au survol en desktop, et page 2 d'une mini-galerie en tactile. */
  versoviso?: string
  /** Effet Ken Burns lent, réservé aux visuels d'ambiance. */
  kenBurns?: boolean
  /** Trait scrim pour garder un texte lisible sur la photo. */
  scrim?: 'aucun' | 'bas' | 'complet'
  children?: ReactNode
  className?: string
}

/**
 * Le cadre des visuels marchands.
 *
 * Différence assumée avec `ParallaxImage` : ici, rien ne bouge au scroll.
 * Le décor peut respirer, la marchandise doit rester fixe — c'est ce qui permet de comparer deux pièces.
 * Aucune parallaxe, aucun `scale` permanent : le seul mouvement est une réponse au geste.
 */
export function MediaFrame({
  src,
  alt,
  type = 'porte',
  ratio = '3/4',
  priority = false,
  versoviso,
  kenBurns = false,
  scrim = 'aucun',
  children,
  className,
}: MediaFrameProps) {
  const [charge, setCharge] = useState(priority)
  const [survuel, setSurvuel] = useState(false)

  return (
    <figure
      data-prise-de-vue={type}
      className={cn('group/media relative overflow-hidden rounded-soft bg-sand-200', className)}
      style={{ aspectRatio: ratio }}
      onMouseEnter={() => versoviso && setSurvuel(true)}
      onMouseLeave={() => setSurvuel(false)}
    >
      <img
        src={survuel && versoviso ? versoviso : src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        fetchPriority={priority ? 'high' : 'auto'}
        onLoad={() => setCharge(true)}
        className={cn(
          'size-full object-cover transition-[opacity,filter,transform] duration-(--d-reveal) ease-expo',
          charge ? 'opacity-100 blur-none' : 'opacity-0 blur-md',
          kenBurns && 'motion-safe:animate-[pe-kenburns_24s_ease-in-out_infinite_alternate]',
        )}
      />

      {scrim !== 'aucun' && (
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-0',
            scrim === 'bas'
              ? 'bg-[image:var(--grad-vignette)]'
              : 'bg-night-900/45',
          )}
        />
      )}

      {/* Repère du type de prise de vue : utile au lecteur d'écran comme au photographe. */}
      {versoviso && (
        <span className="label-caps pointer-events-none absolute bottom-3 left-3 rounded-pill bg-night-900/70 px-2.5 py-1 text-cream-100/80 backdrop-blur-sm sm:hidden">
          1/2
        </span>
      )}

      {children}
    </figure>
  )
}
