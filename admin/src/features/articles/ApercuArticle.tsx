import { useQueries, useQuery } from '@tanstack/react-query'
import { cles } from '@/api/cles'
import { articles, medias } from '@/api/endpoints/contenus'
import type { Langue } from '@/api/schemas/communs'
import { ApercuSite, EnteteArticle } from '@/components/apercu/ApercuSite'
import { RenduCorps } from '@/components/apercu/RenduCorps'
import { Onglets } from '@/components/ui/Onglets'
import { t } from '@/i18n/fr'
import type { ValeursArticle } from './valeurs'

/**
 * Aperçu d'un article tel que le site l'affichera (section 10), dans chaque langue saisie, avec
 * les **articles liés calculés** (RG-07) : articles publiés qui partagent au moins un tag, hors
 * lui-même. Ils ne se saisissent pas.
 */
export function ApercuArticle({ valeurs, id }: { valeurs: ValeursArticle; id: string | null }) {
  const image = useQuery({
    queryKey: cles.media(valeurs.imageId ?? ''),
    queryFn: () => medias.lire(valeurs.imageId ?? ''),
    enabled: Boolean(valeurs.imageId),
  })
  const parTag = useQueries({
    queries: valeurs.tagIds.slice(0, 5).map((tag) => ({
      queryKey: ['articles', 'liste', { tag: [tag], statut: 'publie', pageSize: 10 }],
      queryFn: () => articles.lister({ tag: [tag], statut: 'publie', pageSize: 10 }),
    })),
  })
  const lies = [
    ...new Map(
      parTag
        .flatMap((requete) => requete.data?.items ?? [])
        .filter((article) => article.id !== id)
        .map((article) => [article.id, article]),
    ).values(),
  ]
    .sort((a, b) => b.modifieLe.localeCompare(a.modifieLe))
    .slice(0, 3)

  const langues = (['fr', 'en'] as const).filter((langue) =>
    valeurs.traductions[langue].titre.trim(),
  )
  if (langues.length === 0)
    return <p className="text-body text-ink-700">{t('article.apercuVide')}</p>

  const rendu = (langue: Langue) => {
    const traduction = valeurs.traductions[langue]
    return (
      <ApercuSite libelle={`${t('article.apercu')} (${langue.toUpperCase()})`}>
        <EnteteArticle
          titre={traduction.titre}
          extrait={traduction.extrait}
          meta={valeurs.categorie || undefined}
        />
        {image.data ? (
          <img
            src={image.data.url}
            alt={image.data.decoratif ? '' : (image.data.traductions[langue]?.texteAlt ?? '')}
            className="aspect-[3/2] w-full rounded-xl bg-sand-200 object-cover"
          />
        ) : null}
        <RenduCorps corps={traduction.corps} langue={langue} />
        <aside className="space-y-2 border-t border-sand-200 pt-6">
          <h2 className="font-display text-heading-sm text-ink-900 uppercase">
            {t('article.lies')}
          </h2>
          {lies.length === 0 ? (
            <p className="text-body text-ink-500">{t('article.aucunLie')}</p>
          ) : (
            <ul className="list-disc pl-5 text-body text-ink-700">
              {lies.map((article) => (
                <li key={article.id}>{article.titre}</li>
              ))}
            </ul>
          )}
        </aside>
      </ApercuSite>
    )
  }

  return (
    <Onglets
      libelle={t('article.apercu')}
      onglets={langues.map((langue) => ({
        id: langue,
        libelle: t(`langue.${langue}`),
        contenu: rendu(langue),
      }))}
    />
  )
}
