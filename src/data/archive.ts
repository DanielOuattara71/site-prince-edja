/**
 * Archive d'Afrique (CDC T-340 à T-343).
 *
 * Rigueur éditoriale exigée par le CDC : chaque entrée distingue histoire documentée,
 * mémoire orale et interprétation, et cite ses sources. Aucune entrée n'est rédigée ici :
 * les six exemples du CDC sont posés en squelettes vides. Une entrée sans source n'est
 * pas publiable, et le modèle de données l'interdit.
 */

export type Fiabilite = 'documentee' | 'memoire orale' | 'interpretation'

export interface EntreeArchive {
  slug: string
  titre: string
  /** Type d'entrée dans la bibliothèque. */
  categorie: string
  /** Ce que l'entrée raconte. Vide tant que le contenu n'est pas fourni. */
  texte: string
  /** Sources citées. Une entrée sans source reste non publiable. */
  sources: string[]
  fiabilite?: Fiabilite
  /** Date ou période, si elle est documentée. */
  epoque?: string
  pays?: string[]
}

const VIDE = {
  texte: '',
  sources: [],
}

export const ARCHIVE: EntreeArchive[] = [
  { slug: 'marche-des-femmes-de-grand-bassam', titre: 'Marche des femmes de Grand-Bassam', categorie: 'Événement', ...VIDE },
  { slug: 'rubino', titre: 'Rubino', categorie: 'Personnage', ...VIDE },
  { slug: 'djidji-ayokwe', titre: 'Djidji Ayôkwé', categorie: 'Personnage', ...VIDE },
  { slug: 'cacao', titre: 'Cacao', categorie: 'Économie', ...VIDE },
  { slug: 'mapouka', titre: 'Mapouka', categorie: 'Musique', ...VIDE },
  { slug: 'textiles', titre: 'Textiles', categorie: 'Objet', ...VIDE },
  { slug: 'zaouli', titre: 'Zaouli', categorie: 'Danse', ...VIDE },
]

/** Navigation de la bibliothèque, telle que le CDC la décrit. */
export const NAVIGATION_ARCHIVE = ['Pays', 'Époque', 'Thème', 'Personnage', 'Lieu'] as const

/** Une entrée n'est publiable que si elle porte un texte et au moins une source. */
export function publiable(entree: EntreeArchive): boolean {
  return entree.texte.trim() !== '' && entree.sources.length > 0 && Boolean(entree.fiabilite)
}
