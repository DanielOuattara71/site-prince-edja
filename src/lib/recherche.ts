import { ARTICLES, BIJOUX, EPISODES, TRAVEL_CITIES } from '@/data/content'
import type { FormatContenu } from '@/types'

/**
 * Index de recherche maison, sans dépendance.
 *
 * Le corpus est minuscule (26 entrées) : une bibliothèque de recherche serait plus
 * lourde que les données qu'elle indexe. Le découplage est fait autrement : `INDEX`
 * est une valeur exportée et `rechercher` la reçoit en paramètre. Le jour d'un
 * backend, il suffit de remplacer l'index source ; la politique de score, le
 * groupement et l'affichage restent identiques.
 */

export type TypeResultat = FormatContenu

export interface Resultat {
  id: string
  type: TypeResultat
  titre: string
  resume: string
  to: string
  image?: string
  /** Termes indexés : titre, tags, culture. Sert au score, pas à l'affichage. */
  termes: string[]
  /** Marque les articles non publiés, pour ne pas promettre une lecture impossible. */
  aVenir?: boolean
}

export interface GroupeResultats {
  type: TypeResultat
  resultats: Resultat[]
}

const TERMES_EPISODE = (ep: (typeof EPISODES)[number]) => [
  ep.titre,
  ep.lieu,
  ...(ep.tags.ville ?? []),
  ...(ep.tags.pays ?? []),
  ...(ep.tags.theme ?? []),
  'xplore',
  'film',
]

const TERMES_VILLE = (v: (typeof TRAVEL_CITIES)[number]) => [
  v.nom,
  ...(v.tags.pays ?? []),
  'taste & travel',
  'voyage',
  'destination',
]

const TERMES_OBJET = (b: (typeof BIJOUX)[number]) => [
  b.nom,
  b.culture,
  b.histoire,
  'tribe',
  'bijou',
  'objet',
]

const TERMES_ARTICLE = (a: (typeof ARTICLES)[number]) => [
  a.titre,
  a.categorie,
  a.extrait,
  'journal',
  'article',
]

export const INDEX: Resultat[] = [
  ...EPISODES.map<Resultat>((ep) => ({
    id: `film-${ep.slug}`,
    type: 'film',
    titre: ep.titre,
    resume: ep.pitch,
    to: `/xplore/${ep.slug}`,
    image: ep.image,
    termes: TERMES_EPISODE(ep),
  })),
  ...TRAVEL_CITIES.map<Resultat>((v) => ({
    id: `destination-${v.nom}`,
    type: 'destination',
    titre: v.nom,
    resume: v.intention,
    to: '/taste-and-travel',
    termes: TERMES_VILLE(v),
  })),
  ...BIJOUX.map<Resultat>((b) => ({
    id: `objet-${b.slug}`,
    type: 'objet',
    titre: b.nom,
    resume: b.histoire,
    to: `/boutique/${b.slug}`,
    image: b.image,
    termes: TERMES_OBJET(b),
  })),
  ...ARTICLES.map<Resultat>((a) => ({
    id: `article-${a.slug}`,
    type: 'article',
    titre: a.titre,
    resume: a.extrait,
    to: `/journal/${a.slug}`,
    image: a.image,
    termes: TERMES_ARTICLE(a),
    aVenir: a.statut !== 'publié',
  })),
]

/** Minuscules sans accents : « bénin » doit se trouver en tapant « benin ». */
function normaliser(texte: string): string {
  return texte
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s&']/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const TITRES = new Map<string, string>()
const RESUMES = new Map<string, string>()
const TERMES = new Map<string, string[]>()

for (const r of INDEX) {
  TITRES.set(r.id, normaliser(r.titre))
  RESUMES.set(r.id, normaliser(r.resume))
  TERMES.set(r.id, r.termes.map(normaliser))
}

/** Score d'une entrée pour une requête donnée. 0 = écarté. */
function scorer(resultat: Resultat, mots: string[]): number {
  const titre = TITRES.get(resultat.id) ?? ''
  const resume = RESUMES.get(resultat.id) ?? ''
  const termes = TERMES.get(resultat.id) ?? []
  const blocTermes = termes.join(' ')

  let score = 0
  for (const mot of mots) {
    if (titre.startsWith(mot)) score += 60
    else if (titre.includes(mot)) score += 40
    if (blocTermes.includes(mot)) score += 20
    if (resume.includes(mot)) score += 8
  }
  return score
}

/**
 * Recherche groupée par type.
 *
 * L'ordre des groupes suit l'ordre des types, pas la pertinence : le visiteur repère
 * d'abord la catégorie (« Films »), puis lit. Un tri global mélangerait les genres et
 * obligerait à relire chaque ligne pour savoir ce qu'elle est.
 */
export function rechercher(requete: string, index: Resultat[] = INDEX): GroupeResultats[] {
  const mots = normaliser(requete).split(' ').filter(Boolean)
  if (mots.length === 0) return []

  const scores = new Map<Resultat, number>()
  for (const resultat of index) {
    const score = scorer(resultat, mots)
    if (score > 0) scores.set(resultat, score)
  }

  const types: TypeResultat[] = ['film', 'destination', 'objet', 'article']
  return types
    .map((type) => ({
      type,
      resultats: index
        .filter((r) => r.type === type && scores.has(r))
        .sort((a, b) => (scores.get(b) ?? 0) - (scores.get(a) ?? 0)),
    }))
    .filter((groupe) => groupe.resultats.length > 0)
}

/** Version aplatie, pour la navigation clavier (flèches / Entrée). */
export function aplati(groupes: GroupeResultats[]): Resultat[] {
  return groupes.flatMap((groupe) => groupe.resultats)
}
