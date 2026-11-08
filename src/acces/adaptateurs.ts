/**
 * Adaptateurs « forme publique de l'API → forme du site » (PLAN-DE-LANCEMENT S2 ; contrat 1.5.0
 * § 18.1). Fonctions pures, testées par `adaptateurs.test.ts` : la couche d'accès les applique aux
 * JSON chargés à la construction, les pages ne voient jamais la forme de l'API.
 *
 * Règle du projet : un champ que l'API ne fournit pas reste **vide**, jamais comblé de plausible.
 * Les étiquettes (`pays`, `theme`) n'arrivent qu'en identifiants (`tagIds`) : elles restent vides
 * tant que le contrat ne les résout pas (docs/QUESTIONS.md).
 */
import type { CategorieSite, FamilleCategorie } from '@/data/categories'
import type { Partenaire } from '@/data/collaborations'
import type { Destination } from '@/data/destinations'
import type { Offre } from '@/data/offres'
import type { Projet, StatutProjet } from '@/data/projets'
import type { Article, Bijou, Distinction, Episode, Milestone, PressItem } from '@/types'

// --- Formes publiques (§ 18.1) : seulement ce que le site lit ---

export interface ImagePublique {
  url: string
  alt: string
  largeur?: number | null
  hauteur?: number | null
  declinaisons: { largeur: number; url: string }[]
}

type Traduction = Record<string, unknown> | null | undefined

interface ContenuPublic {
  id: string
  slug?: string | null
  titre?: string
  traduction?: Traduction
  image?: ImagePublique | null
}

export interface ArticlePublic extends ContenuPublic {
  slug: string
  titre: string
  extrait?: string | null
  categorie?: string | null
  dureeLecture?: number | null
  publieLe?: string | null
}

export interface EpisodePublic extends ContenuPublic {
  numero: string
  guide?: ImagePublique | null
  projetSlug?: string | null
}

export type CibleInterne =
  | { type: 'page'; cle: string }
  | { type: 'page-legale'; cle: string }
  | { type: 'ancre'; cle: string; ancre: string }
  | { type: 'contenu'; ressource: string; id: string }

export interface ProjetPublic extends ContenuPublic {
  format: Projet['format']
  avancement: 'disponible' | 'en_production' | 'en_preparation'
  annee?: string | null
  cible?: CibleInterne | null
  template?: Projet['template'] | null
  categorie?: { slug: string; nom: string } | null
}

export interface DestinationPublique extends ContenuPublic {
  latitude?: number | null
  longitude?: number | null
  episodeId?: string | null
  guide?: ImagePublique | null
}

export interface PressePublique extends ContenuPublic {
  source: string
  datePublication?: string | null
  lien?: string | null
}

export interface DistinctionPublique extends ContenuPublic {
  annee?: string | null
  organisme?: string | null
  lien?: string | null
}

export interface JalonPublic extends ContenuPublic {
  periode: string
}

export interface PartenairePublic extends ContenuPublic {
  logo?: ImagePublique | null
}

export type OffrePublique = ContenuPublic

export interface ProduitPublic {
  type: 'bijou' | 'livre'
  slug: string
  nom: string
  reference: string
  image: ImagePublique | null
  categorie: { slug: string; nom: string } | null
  prixAffiche: number | null
  prixConfirme: boolean
  ancienPrix: number | null
  disponible: boolean
  histoire?: string | null
  culture?: string | null
  galerie?: ImagePublique[]
  variantes?: { matiere: string | null; taille: string | null }[]
  createur?: {
    nom: string
    pays: string | null
    ville: string | null
    bio: string | null
  } | null
}

export interface CategoriePublique {
  slug: string
  nom: string
  compte: number
}

// --- Outils ---

/** Texte d'un champ traduit, sinon chaîne vide. */
function texte(traduction: Traduction, cle: string): string {
  const valeur = traduction?.[cle]
  return typeof valeur === 'string' ? valeur : ''
}

const url = (image: ImagePublique | null | undefined) => image?.url ?? ''

/** Titre d'un contenu : celui de la liste, sinon celui de la traduction. */
const titreDe = (c: ContenuPublic, cle = 'titre') => c.titre || texte(c.traduction, cle)
const slugDe = (c: ContenuPublic) => c.slug || texte(c.traduction, 'slug')

const MOIS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
]

/** Date partielle du contrat (`AAAA`, `AAAA-MM`, `AAAA-MM-JJ`) → « 2024 », « mars 2025 », « 01 août 2025 ». */
export function datePartielle(valeur: string | null | undefined): string {
  if (!valeur) return ''
  const [annee, mois, jour] = valeur.split('-')
  const nomMois = mois ? MOIS[Number(mois) - 1] : undefined
  if (!nomMois) return annee ?? ''
  return jour ? `${jour} ${nomMois} ${annee}` : `${nomMois} ${annee}`
}

// --- Liens internes ---

/** Chemin du site d'un contenu liable, par ressource (contrat § 6). */
export type CheminsContenus = Partial<Record<string, Map<string, string>>>

/**
 * `CibleInterne` → chemin du site (même table que l'admin et le back end) : `accueil` est la
 * racine, une page porte sa clé, une ancre s'ajoute après `#`. Un contenu se résout par
 * `chemins` ; introuvable, la cible n'est pas un lien.
 */
export function cheminDeCible(
  cible: CibleInterne | null | undefined,
  chemins: CheminsContenus = {},
): string | undefined {
  if (!cible) return undefined
  const page = (cle: string) => (cle === 'accueil' ? '/' : `/${cle}`)
  switch (cible.type) {
    case 'page':
    case 'page-legale':
      return page(cible.cle)
    case 'ancre':
      return `${page(cible.cle)}#${cible.ancre}`
    case 'contenu':
      return chemins[cible.ressource]?.get(cible.id)
  }
}

// --- Adaptateurs ---

export function versArticle(a: ArticlePublic): Article {
  return {
    slug: a.slug,
    categorie: a.categorie ?? '',
    titre: a.titre,
    extrait: a.extrait ?? '',
    statut: 'publié',
    image: url(a.image),
    date: a.publieLe ? a.publieLe.slice(0, 10) : undefined,
    lecture: a.dureeLecture ?? undefined,
    tags: { format: 'article', projet: 'JOURNAL' },
  }
}

export function versEpisode(e: EpisodePublic): Episode {
  return {
    slug: slugDe(e),
    numero: e.numero,
    titre: titreDe(e),
    lieu: texte(e.traduction, 'lieu'),
    pitch: texte(e.traduction, 'pitch'),
    image: url(e.image),
    guide: e.guide?.url,
    // Les épisodes du site sont ceux de X'PLORE (/xplore/:slug).
    tags: { format: 'film', projet: 'XPLORE' },
  }
}

const STATUTS: Record<ProjetPublic['avancement'], StatutProjet> = {
  disponible: 'disponible',
  en_production: 'en production',
  en_preparation: 'en préparation',
}

/** Page du site de chaque template, quand l'admin n'a pas posé de lien (D-83). */
const PAGE_DU_TEMPLATE: Record<Projet['template'], string> = {
  film: '/xplore',
  programme: '/taste-and-travel',
  bibliotheque: '/archive-afrique',
}

export function versProjet(p: ProjetPublic, chemins: CheminsContenus = {}): Projet {
  const template = p.template ?? 'film'
  return {
    slug: slugDe(p),
    titre: titreDe(p),
    accroche: texte(p.traduction, 'accroche'),
    format: p.format,
    annee: p.annee ?? '',
    pays: [],
    statut: STATUTS[p.avancement],
    theme: [],
    image: url(p.image),
    categorie: p.categorie?.nom ?? '',
    template,
    aFournir: false,
    route: cheminDeCible(p.cible, chemins) ?? PAGE_DU_TEMPLATE[template],
  }
}

/**
 * Destinations de la carte. Sans coordonnées, une étape n'a pas de place sur la carte : elle est
 * écartée plutôt que posée en (0, 0), au large du golfe de Guinée.
 */
export function versDestinations(
  destinations: DestinationPublique[],
  slugsEpisodes: Map<string, string>,
): Destination[] {
  return destinations.flatMap((d) =>
    typeof d.latitude === 'number' && typeof d.longitude === 'number'
      ? [
          {
            slug: slugDe(d),
            nom: titreDe(d, 'nom'),
            lat: d.latitude,
            lng: d.longitude,
            episodeSlug: d.episodeId ? slugsEpisodes.get(d.episodeId) : undefined,
            guide: d.guide?.url,
          },
        ]
      : [],
  )
}

export function versPresse(p: PressePublique): PressItem {
  return {
    source: p.source,
    date: datePartielle(p.datePublication),
    titre: titreDe(p),
    resume: texte(p.traduction, 'resume'),
    url: p.lien ?? '',
  }
}

export function versDistinction(d: DistinctionPublique): Distinction {
  return {
    id: d.id,
    annee: d.annee ?? '',
    titre: titreDe(d),
    delivreePar: d.organisme ?? undefined,
    description: texte(d.traduction, 'description'),
    image: url(d.image),
    url: d.lien ?? undefined,
  }
}

export function versJalon(j: JalonPublic): Milestone {
  return {
    periode: j.periode,
    titre: titreDe(j),
    description: texte(j.traduction, 'description'),
  }
}

export function versPartenaire(p: PartenairePublic): Partenaire {
  const logo = p.logo?.url
  return logo ? { nom: titreDe(p, 'nom'), logo } : { nom: titreDe(p, 'nom') }
}

export function versOffre(o: OffrePublique): Offre {
  return { titre: titreDe(o), texte: texte(o.traduction, 'texte') }
}

export function versCategories(
  famille: FamilleCategorie,
  categories: CategoriePublique[],
): CategorieSite[] {
  // L'API ne renvoie que les catégories visibles et non vides (§ 18) : toutes s'affichent.
  return categories.map((c) => ({ famille, nom: c.nom, visible: true }))
}

const uniques = (valeurs: (string | null)[]) => [
  ...new Set(valeurs.filter((v): v is string => Boolean(v))),
]

/** Un produit d'Edja Shop (bijou ou livre) dans la forme `Bijou` que lisent fiche et catalogue. */
export function versProduit(p: ProduitPublic): Bijou {
  const variantes = p.variantes ?? []
  return {
    slug: p.slug,
    numero: p.reference,
    culture: p.culture ?? '',
    nom: p.nom,
    histoire: p.histoire ?? '',
    image: url(p.image),
    tags: { format: 'objet', projet: 'TRIBE' },
    commerce: {
      reference: p.reference,
      prix: p.prixConfirme ? p.prixAffiche : null,
      ancienPrix: p.prixConfirme ? p.ancienPrix : null,
      prixConfirme: p.prixConfirme,
      matieres: uniques(variantes.map((v) => v.matiere)),
      tailles: uniques(variantes.map((v) => v.taille)),
      // Hors du contrat public 1.5.0 : vides plutôt que devinés.
      edition: null,
      atelier: null,
      village: null,
      poids: null,
      galerie: (p.galerie ?? []).map((g) => g.url),
      disponible: p.disponible,
      createur: p.createur
        ? {
            nom: p.createur.nom,
            pays: p.createur.pays,
            ville: p.createur.ville,
            bio: p.createur.bio ?? '',
          }
        : null,
      categorie: p.categorie?.nom ?? '',
    },
  }
}
