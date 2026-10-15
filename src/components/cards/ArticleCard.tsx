import { Link } from 'react-router'
import { Badge } from '@/components/ui/Badge'
import { ParallaxImage } from '@/components/media/ParallaxImage'
import { Tag } from '@/components/ui/Tag'
import { formatDate } from '@/lib/format'
import { srcsetContenu, SIZES_CARTE, SIZES_LARGE } from '@/lib/visuels'
import type { Article } from '@/types'

interface ArticleCardProps {
  article: Article
  featured?: boolean
  /** Charge l'image sans attendre le défilement. Réservé à la une de la page, qui est
   *  aussi le plus grand élément peint : en `lazy`, c'est elle que le visiteur paie
   *  en premier. */
  priority?: boolean
}

export function ArticleCard({ article, featured = false, priority = false }: ArticleCardProps) {
  return (
    <Link
      to={`/journal/${article.slug}`}
      className={
        featured
          ? 'group grid gap-8 lg:grid-cols-2 lg:items-center focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600'
          : 'group flex h-full flex-col focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-clay-600'
      }
    >
      <ParallaxImage
        src={article.image}
        alt=""
        ratio={featured ? '16/9' : '16/10'}
        range={featured ? 6 : 4}
        srcSet={srcsetContenu(article.image)}
        sizes={featured ? SIZES_LARGE : SIZES_CARTE}
        priority={priority}
        zoomOnHover
        className="rounded-md"
      />
      <div className={featured ? 'space-y-4' : 'mt-5 flex flex-1 flex-col space-y-3'}>
        <div className="flex flex-wrap items-center gap-3">
          <Tag tone={article.slug === 'afrique-multitude-de-mondes' ? 'sage' : 'light'}>{article.categorie}</Tag>
          {article.statut === 'à venir' && <Badge statut={article.statut} />}
        </div>
        {(article.date || article.lecture) && (
          <p className="text-caption text-ink-500">
            {[
              article.date ? formatDate(article.date) : null,
              article.lecture ? `${article.lecture} min de lecture` : null,
            ]
              .filter(Boolean)
              .join(' · ')}
          </p>
        )}
        <h3
          className={
            (featured
              ? 'font-display uppercase text-heading-md transition-colors duration-(--d-base) group-hover:text-leaf-600'
              : 'font-display uppercase text-heading-sm transition-colors duration-(--d-base) group-hover:text-leaf-600') +
            (article.slug === 'afrique-multitude-de-mondes' ? ' text-leaf-600' : ' text-ink-900')
          }
        >
          {article.titre}
        </h3>
        <p className="text-body text-ink-500">{article.extrait}</p>
      </div>
    </Link>
  )
}
