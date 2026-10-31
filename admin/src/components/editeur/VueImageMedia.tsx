import { useQuery } from '@tanstack/react-query'
import { NodeViewWrapper, type ReactNodeViewProps } from '@tiptap/react'
import { CircleAlert } from 'lucide-react'
import { cles } from '@/api/cles'
import { medias } from '@/api/endpoints/contenus'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'

/**
 * Affichage d'une image dans l'éditeur : le nœud ne porte que `mediaId`, l'adresse et le
 * texte alternatif sont relus dans la médiathèque. Une image sans texte alternatif le dit.
 */
export function VueImageMedia({ node, selected }: ReactNodeViewProps) {
  const mediaId = node.attrs['mediaId'] as string | null
  const requete = useQuery({
    queryKey: cles.media(mediaId ?? ''),
    queryFn: () => medias.lire(mediaId ?? ''),
    enabled: Boolean(mediaId),
  })
  const media = requete.data
  const alt = media?.traductions.fr?.texteAlt ?? ''

  return (
    <NodeViewWrapper
      className={cn('my-4 rounded-md', selected && 'outline-2 outline-offset-2 outline-clay-600')}
      data-drag-handle
    >
      {media ? (
        <figure className="space-y-1">
          <img src={media.url} alt={alt} className="max-h-80 w-auto rounded-md bg-sand-200" />
          {!alt && !media.decoratif ? (
            <figcaption className="flex items-center gap-1 text-caption font-semibold text-clay-700">
              <CircleAlert aria-hidden className="size-4" />
              {t('media.sansAlt')}
            </figcaption>
          ) : null}
        </figure>
      ) : (
        <p className="rounded-md bg-sand-200 p-4 text-caption text-ink-700">
          {requete.isError ? t('media.introuvable') : t('chargement')}
        </p>
      )}
    </NodeViewWrapper>
  )
}
