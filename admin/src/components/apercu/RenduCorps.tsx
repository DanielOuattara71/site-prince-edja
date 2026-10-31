import { useQuery } from '@tanstack/react-query'
import { Fragment, type ReactNode } from 'react'
import { cles } from '@/api/cles'
import { medias } from '@/api/endpoints/contenus'
import type { Langue } from '@/api/schemas/communs'
import type { CorpsRiche, MarqueRiche, NoeudRiche } from '@/api/schemas/corps-riche'

/**
 * Rend un corps riche (§ 9.1) en éléments React, sans `dangerouslySetInnerHTML` : seuls
 * les nœuds de la liste blanche ont un rendu, le reste est ignoré. Typographie du site
 * public (mêmes jetons, D-05).
 *
 * @example
 * <RenduCorps corps={article.traductions.fr?.corps} langue="fr" />
 */
export function RenduCorps({
  corps,
  langue,
}: {
  corps: CorpsRiche | null | undefined
  langue: Langue
}) {
  if (!corps) return null
  return (
    <div className="space-y-5 text-body-lg text-ink-700">{rendreNoeuds(corps.content, langue)}</div>
  )
}

function rendreNoeuds(noeuds: NoeudRiche[] | undefined, langue: Langue): ReactNode {
  return (noeuds ?? []).map((noeud, index) => (
    <Fragment key={index}>{rendreNoeud(noeud, langue)}</Fragment>
  ))
}

function rendreNoeud(noeud: NoeudRiche, langue: Langue): ReactNode {
  const enfants = rendreNoeuds(noeud.content, langue)
  switch (noeud.type) {
    case 'text':
      return appliquerMarques(noeud.text ?? '', noeud.marks)
    case 'paragraph':
      return <p>{enfants}</p>
    case 'heading': {
      const niveau = noeud.attrs?.['level']
      if (niveau === 2)
        return (
          <h2 className="pt-4 font-display text-heading-md text-ink-900 uppercase">{enfants}</h2>
        )
      if (niveau === 3)
        return (
          <h3 className="pt-2 font-display text-heading-sm text-ink-900 uppercase">{enfants}</h3>
        )
      return <h4 className="font-semibold text-ink-900">{enfants}</h4>
    }
    case 'bulletList':
      return <ul className="list-disc space-y-1 pl-6">{enfants}</ul>
    case 'orderedList':
      return <ol className="list-decimal space-y-1 pl-6">{enfants}</ol>
    case 'listItem':
      return <li className="[&>p]:inline">{enfants}</li>
    case 'blockquote':
      return (
        <blockquote className="border-l-2 border-gold-400 pl-5 font-quote text-heading-sm text-ink-900 italic">
          {enfants}
        </blockquote>
      )
    case 'hardBreak':
      return <br />
    case 'image': {
      const mediaId = noeud.attrs?.['mediaId']
      return typeof mediaId === 'string' ? <ImageCorps mediaId={mediaId} langue={langue} /> : null
    }
    default:
      return null
  }
}

function appliquerMarques(texte: string, marques: MarqueRiche[] | undefined): ReactNode {
  return (marques ?? []).reduce<ReactNode>((rendu, marque) => {
    if (marque.type === 'bold')
      return <strong className="font-semibold text-ink-900">{rendu}</strong>
    if (marque.type === 'italic') return <em>{rendu}</em>
    return (
      <a href={marque.attrs.href} className="text-clay-700 underline underline-offset-4">
        {rendu}
      </a>
    )
  }, texte)
}

function ImageCorps({ mediaId, langue }: { mediaId: string; langue: Langue }) {
  const requete = useQuery({ queryKey: cles.media(mediaId), queryFn: () => medias.lire(mediaId) })
  const media = requete.data
  if (!media) return <div className="aspect-[3/2] w-full rounded-xl bg-sand-200" />
  const traduction = media.traductions[langue]
  return (
    <figure className="space-y-2">
      <img
        src={media.url}
        alt={media.decoratif ? '' : (traduction?.texteAlt ?? '')}
        className="w-full rounded-xl bg-sand-200"
      />
      {traduction?.legende || media.credit ? (
        <figcaption className="text-caption text-ink-500">
          {traduction?.legende}
          {traduction?.legende && media.credit ? ' · ' : ''}
          {media.credit}
        </figcaption>
      ) : null}
    </figure>
  )
}
