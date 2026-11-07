import { useQuery } from '@tanstack/react-query'
import { cles } from '@/api/cles'
import { categories } from '@/api/endpoints/boutique'
import type { Categorie, FamilleCategorie } from '@/api/schemas/boutique'

/**
 * Catégories d'une famille (SCHEMAS § 3) : un formulaire ne propose que celles de sa famille
 * (RG-29). Une seule requête par famille, partagée par les écrans.
 */
export function useCategories(famille: FamilleCategorie) {
  return useQuery({
    queryKey: [...cles.categories(), famille],
    queryFn: () => categories.lister({ pageSize: 100 }, undefined, { famille }),
    staleTime: 60_000,
  })
}

/** Nom affiché d'une catégorie : le français, sinon l'anglais. */
export const nomCategorie = (c: Pick<Categorie, 'traductions'>) =>
  c.traductions.fr?.nom ?? c.traductions.en?.nom ?? ''
