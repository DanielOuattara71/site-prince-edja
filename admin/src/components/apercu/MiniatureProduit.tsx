import { useQuery } from '@tanstack/react-query'
import { ImageOff } from 'lucide-react'
import { medias } from '@/api/endpoints/contenus'
import { cles } from '@/api/cles'
import { cn } from '@/lib/cn'

/**
 * Pastille 4:5 pour une liste de contenus (bijoux, livres) : le thumbnail résolu depuis
 * la médiathèque. Rendu mode d'emploi : la ligne s'étend sur l'outil de la grille.
 */
export default function MiniatureProduit({
  imageId,
  alt = '',
  className,
}: {
  imageId: string | null
  alt?: string
  className?: string
}) {
  const media = useQuery({
    queryKey: cles.media(imageId ?? ''),
    queryFn: () => medias.lire(imageId ?? ''),
    enabled: Boolean(imageId),
    staleTime: 60_000,
  })

  const declinaisons = media.data?.declinaisons ?? []
  const src = declinaisons[0]?.url ?? media.data?.url ?? null

  if (!imageId || !src) {
    return (
      <span
        className={cn(
          'flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-md border border-sand-200 bg-sand-200',
          className,
        )}
        aria-hidden
      >
        <ImageOff className="size-4 text-ink-500" />
      </span>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className={cn(
        'aspect-[4/5] size-11 shrink-0 overflow-hidden rounded-md border border-sand-200 bg-sand-100 object-cover',
        className,
      )}
    />
  )
}
