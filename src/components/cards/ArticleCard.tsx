import { Badge } from '@/components/ui/Badge'
import { LazyImage } from '@/components/media/LazyImage'
import { Tag } from '@/components/ui/Tag'
import type { Article } from '@/types'

interface ArticleCardProps {
  article: Article
  featured?: boolean
}

export function ArticleCard({ article, featured = false }: ArticleCardProps) {
  return (
    <article
      className={
        featured
          ? 'grid gap-8 lg:grid-cols-2 lg:items-center'
          : 'group flex h-full flex-col'
      }
    >
      <LazyImage
        src={article.image}
        alt=""
        ratio={featured ? '16/9' : '16/10'}
        className="rounded-md"
      />
      <div className={featured ? 'space-y-4' : 'mt-5 flex flex-1 flex-col space-y-3'}>
        <div className="flex items-center gap-3">
          <Tag>{article.categorie}</Tag>
          {article.statut === 'à venir' && <Badge statut={article.statut} />}
        </div>
        <h3
          className={
            featured
              ? 'font-display uppercase text-heading-md text-ink-900'
              : 'font-display uppercase text-heading-sm text-ink-900'
          }
        >
          {article.titre}
        </h3>
        <p className="text-body text-ink-500">{article.extrait}</p>
      </div>
    </article>
  )
}
