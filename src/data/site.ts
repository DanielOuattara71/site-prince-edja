import type { NavItem, SiteInfo } from '@/types'

export const NAV_ITEMS: NavItem[] = [
  { label: "X'PLORE", to: '/xplore' },
  { label: 'Taste & Travel', to: '/taste-and-travel' },
  { label: 'Boutique', to: '/boutique' },
  { label: 'Journal', to: '/journal' },
  { label: 'Presse', to: '/presse' },
]

export const MENU_SECONDARY: NavItem[] = [
  { label: 'À propos', to: '/a-propos' },
  { label: 'Contact', to: '/contact' },
]

const DARK_TOP_ROUTES = ['/', '/xplore', '/taste-and-travel']

export function isDarkTop(pathname: string): boolean {
  return DARK_TOP_ROUTES.some((route) =>
    route === '/' ? pathname === '/' : pathname.startsWith(route),
  )
}

export const SITE: SiteInfo = {
  name: 'Prince Edja',
  role: 'Entrepreneur, storyteller et producteur audiovisuel — je révèle la Côte d’Ivoire au monde.',
  tagline: ['Raconter', 'Transmettre', 'Voyager'],
  devise:
    'Faire voyager les regards. Faire vivre les cultures. Faire grandir la mémoire.',
  mission:
    '« Briser les clichés, préserver la mémoire et faire du tourisme un pont entre les peuples. »',
  bio: [
    'Edja Kouamey Franck Arnaud, dit Prince Edja, fait du voyage une manière de comprendre, de transmettre et de bâtir.',
    'Né le 17 juillet 1990 à Abidjan, il développe depuis plus de onze ans une expertise au croisement du tourisme, de l’hospitalité, du marketing et de la production audiovisuelle. Diplômé d’un MSc Marketing Management de KEDGE Business School, il a accompagné des groupes hôteliers, des institutions et des destinations africaines.',
    'Fondateur de l’écosystème OHENE — OHENE Tour et OHENE Prod — il conçoit des circuits, des films et des prises de parole capables de changer le regard porté sur le continent. Sa communauté de plus de 600 000 abonnés suit un voyage déjà passé par plus de trente pays.',
  ],
  email: 'contact@ohenetour.com',
  linkedin: 'https://www.linkedin.com/in/franckedja/',
  linkedinLabel: 'Voir le parcours LinkedIn',
  localisation: 'Abidjan · Côte d’Ivoire',
  heroImage: '/images/hero/hero-prince-edja.png',
  stats: [
    { value: 30, suffix: '+', label: 'Pays parcourus' },
    { value: 600, suffix: 'K+', label: 'Abonnés cumulés' },
    { value: 11, suffix: ' ans', label: 'D’expérience' },
    { value: 3, label: 'Univers fondateurs' },
  ],
}
