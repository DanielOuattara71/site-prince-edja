import { Badge } from '@/components/ui/Badge'
import { ParallaxImage } from '@/components/media/ParallaxImage'
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
          ? 'group grid gap-8 lg:grid-cols-2 lg:items-center'
          : 'group flex h-full flex-col'
      }
    >
      <ParallaxImage
        src={article.image}
        alt=""
        ratio={featured ? '16/9' : '16/10'}
        range={featured ? 6 : 4}
        zoomOnHover
        className="rounded-md"
      />
      <div className={featured ? 'space-y-4' : 'mt-5 flex flex-1 flex-col space-y-3'}>
        <div className="flex items-center gap-3">
          <Tag tone={article.slug === 'afrique-multitude-de-mondes' ? 'sage' : 'light'}>{article.categorie}</Tag>
          {article.statut === 'à venir' && <Badge statut={article.statut} />}
        </div>
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
    </article>
  )
}
