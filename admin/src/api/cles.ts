import type { ParametresMedias } from '@/api/endpoints/contenus'
import type { TypeTag } from '@/api/schemas/tags'

/**
 * Clés du cache TanStack Query, en un seul endroit : une invalidation vise exactement ce
 * qu'il faut (`['medias']` touche toute la médiathèque, `cles.media(id)` une seule fiche).
 */
export const cles = {
  medias: (parametres: ParametresMedias) => ['medias', 'liste', parametres] as const,
  media: (id: string) => ['medias', 'detail', id] as const,
  usagesMedia: (id: string) => ['medias', 'usages', id] as const,
  tagsParType: (type: TypeTag) => ['tags', 'type', type] as const,
  tousLesTags: () => ['tags', 'tous'] as const,
  article: (id: string) => ['articles', 'detail', id] as const,
  publication: (id: string) => ['site', 'publication', id] as const,
  versions: (ressource: string, id: string) => ['versions', ressource, id] as const,
  version: (ressource: string, id: string, version: number) =>
    ['versions', ressource, id, version] as const,
  createursSelectionnables: () => ['createurs', 'selectionnables'] as const,
  createurPrincipal: () => ['createurs', 'principal'] as const,
  createur: (id: string) => ['createurs', 'detail', id] as const,
  bijou: (id: string) => ['bijoux', 'detail', id] as const,
  categories: () => ['categories', 'liste'] as const,
}
