/**
 * Thème d'un comptoir : un univers de design appliqué par contexte.
 *
 * Un comptoir n'introduit jamais de nouveau composant : il fournit des jetons
 * (sol, accent, motif, régie de galerie, type d'annonce) que les briques du
 * marketplace consomment. Ajouter une catégorie = ajouter une entrée de thème.
 */

/** Régie de galerie : la manière dont les pièces sont mises en scène. */
export type RegieGalerie =
  | 'vitrine' /* coverflow 3D — pièces iconiques */
  | 'rail' /* rail horizontal — circulation longue */
  | 'masonry' /* maille éditoriale — maison & table */
  | 'pile' /* cartes empilées — saveurs */
  | 'tranches' /* dos de livres — éditions */
  | 'damier' /* grille de jeu — joueurs */
  | 'cartes' /* cartes postales dispersées — souvenirs */

/** Rituel d'entrée du comptoir. */
export type AnnonceSection =
  | 'rideau' /* lames verticales qui s'écartent */
  | 'tissage' /* bandes qui se tissent de bas en haut */
  | 'trace' /* trait capillaire + nom qui monte en masque */
  | 'mots' /* allumage mot à mot piloté par le scroll */
  | 'tampon' /* cachet qui s'appose */
  | 'bond' /* pion qui saute d'une case à l'autre */

export interface ThemeComptoir {
  /** Couleur de sol : ce que l'on voit en 0,4 s, sans lire. */
  sol: string
  surface: string
  accent: string
  accentDoux: string
  texte: string
  texteDoux: string
  trait: string
  /** Chemin vers le motif SVG du comptoir (utilisé en masque et en filigrane). */
  motif: string
  regie: RegieGalerie
  annonce: AnnonceSection
}

/**
 * Convertit un thème en variables CSS consommables par les enfants.
 * `--c-*` : uniquement utilisé par les briques du marketplace, jamais par le site éditorial.
 */
export function themeVersVariablesCss(theme: ThemeComptoir): Record<string, string> {
  return {
    '--c-sol': theme.sol,
    '--c-surface': theme.surface,
    '--c-accent': theme.accent,
    '--c-accent-doux': theme.accentDoux,
    '--c-texte': theme.texte,
    '--c-texte-doux': theme.texteDoux,
    '--c-trait': theme.trait,
    backgroundColor: theme.sol,
    color: theme.texte,
  }
}

/** Les fichiers de `public/` sont servis sous la base du site : `vite.config.ts` la fixe
 *  à `/site-prince-edja/`, au dev comme à la build. Un chemin racine écrit en dur sortirait
 *  donc du déploiement — le masque du chapiteau ne se chargerait pas du tout. */
const motifComptoir = (nom: string) => `${import.meta.env.BASE_URL}motifs/${nom}.svg`

/** Jetons des quatre comptoirs de lancement, dérivés de la palette existante. */
export const THEMES: Record<string, ThemeComptoir> = {
  'a-porter': {
    sol: 'var(--color-night-900)',
    surface: 'var(--color-night-700)',
    accent: 'var(--color-gold-400)',
    accentDoux: 'var(--color-gold-300)',
    texte: 'var(--color-cream-100)',
    texteDoux: 'color-mix(in srgb, var(--color-cream-100) 70%, transparent)',
    trait: 'color-mix(in srgb, var(--color-gold-400) 40%, transparent)',
    motif: motifComptoir('comptoir-a-porter'),
    regie: 'vitrine',
    annonce: 'rideau',
  },
  'tisse': {
    sol: 'var(--color-kola-900)',
    surface: 'var(--color-kola-700)',
    accent: 'var(--color-gold-400)',
    accentDoux: 'var(--color-gold-300)',
    texte: 'var(--color-cream-100)',
    texteDoux: 'color-mix(in srgb, var(--color-cream-100) 72%, transparent)',
    trait: 'color-mix(in srgb, var(--color-gold-400) 38%, transparent)',
    motif: motifComptoir('comptoir-tisse'),
    regie: 'rail',
    annonce: 'tissage',
  },
  'maison-table': {
    sol: 'var(--color-kaolin-50)',
    surface: 'var(--color-kaolin-100)',
    accent: 'var(--color-brique-600)',
    accentDoux: 'var(--color-clay-400)',
    texte: 'var(--color-ink-900)',
    // Le kaolin est le plus clair des sols : `ink-500` n'y rend que 4,49:1, juste sous le
    // seuil AA du texte courant. Le doux de ce comptoir est donc un cran plus bas que
    // celui de Mémoire (4,77:1 sur sable) : la hiérarchie se garde, le contraste aussi.
    texteDoux: 'var(--color-ink-700)',
    trait: 'color-mix(in srgb, var(--color-ink-900) 14%, transparent)',
    motif: motifComptoir('comptoir-maison-table'),
    regie: 'masonry',
    annonce: 'trace',
  },
  'memoire': {
    sol: 'var(--color-sand-50)',
    surface: 'var(--color-sand-100)',
    accent: 'var(--color-ink-900)',
    accentDoux: 'var(--color-brique-600)',
    texte: 'var(--color-ink-900)',
    texteDoux: 'var(--color-ink-500)',
    trait: 'color-mix(in srgb, var(--color-ink-900) 12%, transparent)',
    motif: motifComptoir('comptoir-memoire'),
    regie: 'tranches',
    annonce: 'mots',
  },
}

/** Le comptoir sur lequel on retombe quand une clé n'est pas référencée ici. */
const CLE_PAR_DEFAUT = 'a-porter'

/**
 * Le thème d'un comptoir, filet compris.
 *
 * Un comptoir ajouté dans `src/data/comptoirs.ts` et oublié dans `THEMES` ne doit pas
 * faire tomber la page : il prend l'univers du comptoir 01. La clé réellement employée
 * est renvoyée par `cleDeComptoir`, pour que l'attribut `data-comptoir` dise la vérité.
 */
export function themeDeComptoir(slug: string): ThemeComptoir {
  return THEMES[slug] ?? THEMES[CLE_PAR_DEFAUT]
}

/** La clé de thème effectivement utilisée après application du filet. */
export function cleDeComptoir(slug: string): string {
  return THEMES[slug] ? slug : CLE_PAR_DEFAUT
}

/**
 * La galerie réellement disponible pour un thème.
 *
 * `RegieGalerie` décrit plus de mises en scène qu'il n'y a de composants : `masonry`,
 * `pile`, `tranches`, `damier` et `cartes` sont des intentions de design non encore
 * construites. Cette fonction est le **seul** endroit où le repli est assumé — elle est
 * explicite pour qu'un comptoir configuré en `tranches` ne prétende pas l'être à l'écran
 * (l'étiquette de section lit sa valeur, pas celle du thème).
 */
export function galerieDisponible(theme: ThemeComptoir): 'rail' | 'vitrine' {
  return theme.regie === 'rail' ? 'rail' : 'vitrine'
}
