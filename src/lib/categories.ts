import { CATEGORIES, type FamilleCategorie } from '@/acces/categories'

/**
 * Catégories à afficher sur une page publique (filtres) : celles de l'admin, **visibles** et
 * **non vides**, dans l'ordre réglé dans l'admin, avec leur nombre de contenus (RG-31).
 *
 * `contenus` : la catégorie (nom) de chaque contenu de la page. Une catégorie qu'aucun contenu
 * ne porte n'apparaît pas : un filtre ne mène jamais à une liste vide.
 */
export interface CategorieAffichee {
  slug: string
  nom: string
  compte: number
}

/** Adresse d'un nom : minuscules, sans accents ni ponctuation (« Carnets de route » → « carnets-de-route »). */
export function slugCategorie(nom: string): string {
  return nom
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’']/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function categoriesAffichees(
  famille: FamilleCategorie,
  contenus: readonly (string | null | undefined)[],
  categories = CATEGORIES,
): CategorieAffichee[] {
  return categories
    .filter((c) => c.famille === famille && c.visible)
    .map((c) => ({
      slug: slugCategorie(c.nom),
      nom: c.nom,
      compte: contenus.filter((nom) => nom === c.nom).length,
    }))
    .filter((c) => c.compte > 0)
}
