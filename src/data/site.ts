import type { SiteInfo } from '@/types'

/**
 * Routes dont le haut de page est sombre : la barre y passe en texte crème dès
 * l'arrivée. Cette liste doit refléter les héros réels — une page au héros nuit
 * oubliée ici affiche le menu en encre sur fond sombre, donc illisible ; une page
 * claire ajoutée à tort fait l'inverse (crème sur ivoire).
 *
 * Deux familles, parce que les pages filles n'héritent pas toutes du fond de leur
 * parent : `/xplore/une-route` a gardé le héros sombre de `/xplore`, alors que
 * `/boutique/akuaba` (ObjetPage) s'ouvre sur un héros clair. `/boutique` reste donc
 * en correspondance exacte, sans quoi la fiche produit perd son menu.
 */
const DARK_TOP_EXACTES = ['/', '/boutique']

const DARK_TOP_PREFIXES = [
  '/xplore',
  '/taste-and-travel',
  '/histoires',
  '/archive-afrique',
  '/travailler-ensemble',
]

export function isDarkTop(pathname: string): boolean {
  if (DARK_TOP_EXACTES.includes(pathname)) return true
  return DARK_TOP_PREFIXES.some((route) => pathname === route || pathname.startsWith(`${route}/`))
}

export const SITE: SiteInfo = {
  name: 'Prince Edja',
  role: 'Entrepreneur, storyteller et producteur audiovisuel. Je révèle la Côte d’Ivoire au monde.',
  signature: 'Griot 2.0 · Storyteller · Explorer',
  manifeste: 'Je raconte l’Afrique que je vis, pas celle qu’on m’a racontée.',
  tagline: ['Raconter', 'Transmettre', 'Voyager'],
  devise:
    'Faire voyager les regards. Faire vivre les cultures. Faire grandir la mémoire.',
  mission:
    '« Briser les clichés, préserver la mémoire et faire du tourisme un pont entre les peuples. »',
  bio: [
    'Edja Kouamey Franck Arnaud, dit Prince Edja, fait du voyage une manière de comprendre, de transmettre et de bâtir.',
    'Né le 17 juillet 1990 à Abidjan, il développe depuis plus de onze ans une expertise au croisement du tourisme, de l’hospitalité, du marketing et de la production audiovisuelle. Diplômé d’un MSc Marketing Management de KEDGE Business School, il a accompagné des groupes hôteliers, des institutions et des destinations africaines.',
    'Fondateur de l’écosystème OHENE (OHENE Tour et OHENE Prod), il conçoit des circuits, des films et des prises de parole capables de changer le regard porté sur le continent. Sa communauté de plus de 600 000 abonnés suit un voyage déjà passé par plus de trente pays.',
  ],
  email: 'contact@ohenetour.com',
  linkedin: 'https://www.linkedin.com/in/franckedja/',
  linkedinLabel: 'Voir le parcours LinkedIn',
  localisation: 'Abidjan · Côte d’Ivoire',
  // Le hero est fourni à deux largeurs : un téléphone charge 51 Ko, un grand écran
  // 106 Ko. L'export PNG d'origine (1,65 Mo pour la même image) ne sert plus de
  // référence et n'a pas été conservé dans les sources.
  heroImage: `${import.meta.env.BASE_URL}images/hero/hero-prince-edja-2000.jpg`,
  heroSrcSet: `${import.meta.env.BASE_URL}images/hero/hero-prince-edja-1200.jpg 1200w, ${import.meta.env.BASE_URL}images/hero/hero-prince-edja-2000.jpg 2000w`,
  heroSizes: '100vw',
  stats: [
    { value: 600, suffix: 'K+', label: 'Communauté' },
    { value: 30, suffix: '+', label: 'Pays parcourus' },
    { value: 4, label: 'Distinctions' },
    { value: 11, suffix: ' ans', label: 'D’expérience' },
    { value: null, label: 'Portée' },
  ],
}
