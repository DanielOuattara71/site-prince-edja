/**
 * Partenaires du ruban déroulant « Collaboration » (accueil).
 *
 * Le CDC demande les vrais partenariats : aucun nom n'est posé ici sans source.
 * Ajouter une entrée (nom + éventuellement un logo) fait apparaître la tuile dans
 * le ruban — tant que la liste est vide, la section « Collaboration » de l’accueil
 * ne s’affiche pas.
 *
 * Le logo se dépose dans `public/images/collab/<slug>.{svg,png,jpg}` et son champ
 * s'écrit avec la base du site, comme tout chemin de `public/` :
 * `${import.meta.env.BASE_URL}images/collab/<slug>.png`.
 */
export interface Partenaire {
  nom: string
  logo?: string
}

export const PARTENAIRES: Partenaire[] = []
