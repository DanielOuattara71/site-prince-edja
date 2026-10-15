import type { Langue } from '@/i18n/dictionnaire'

/**
 * Libellé indexé par langue.
 *
 * Ce n'est pas un détail : c'est ce qui rend un futur préfixe `/en` envisageable sans
 * toucher aux données. Les routes restent françaises aujourd'hui, mais aucun texte de
 * navigation n'est écrit en dur : il est toujours résolu par la langue courante.
 */
export interface Libelle {
  fr: string
  en: string
}

export interface LienNav {
  libelle: Libelle
  to: string
  /** Ligne d'appoint, affichée dans le méga-menu et le pied de page. */
  degre?: Libelle
}

export interface EntreeNav {
  libelle: Libelle
  /** Cible du clic sur l'entrée elle-même : le premier enfant, ou une page hub. */
  to: string
  degre?: Libelle
  /** Absent = entrée simple. Présent = groupe, annoncé par un méga-menu (desktop)
   *  ou une liste dépliable (mobile). */
  enfants?: LienNav[]
}

/**
 * LA NAVIGATION, source unique de vérité.
 *
 * Le header, l'overlay mobile, le pied de page, la recherche et le fil d'Ariane lisent
 * tous ce fichier. Ajouter une entrée ici la fait apparaître partout ; en modifier le
 * libellé corrige les cinq écrans d'un coup.
 */
export const NAV_PRINCIPALE: EntreeNav[] = [
  {
    libelle: { fr: 'Prince Edja', en: 'Prince Edja' },
    to: '/a-propos',
    degre: {
      fr: "L'homme, le parcours, la reconnaissance",
      en: 'The man, the path, the recognition',
    },
    enfants: [
      { libelle: { fr: 'Mon histoire', en: 'My story' }, to: '/a-propos' },
      { libelle: { fr: 'Audience', en: 'Audience' }, to: '/a-propos#audience' },
      { libelle: { fr: 'Offres', en: 'Services' }, to: '/a-propos#offres' },
      { libelle: { fr: 'Collaborer', en: 'Work with us' }, to: '/a-propos#collaborer' },
      {
        libelle: { fr: 'Presse & distinctions', en: 'Press & honours' },
        to: '/presse',
      },
    ],
  },
  {
    libelle: { fr: 'Histoires', en: 'Stories' },
    to: '/histoires',
    degre: { fr: 'Projets, films et archives', en: 'Projects, films and archives' },
    enfants: [
      { libelle: { fr: 'Tous les projets', en: 'All projects' }, to: '/histoires' },
      { libelle: { fr: 'Archive d’Afrique', en: 'Archive of Africa' }, to: '/archive-afrique' },
      { libelle: { fr: "Série X'PLORE", en: "X'PLORE series" }, to: '/xplore' },
      {
        libelle: { fr: 'Taste & Travel', en: 'Taste & Travel' },
        to: '/taste-and-travel',
      },
    ],
  },
  {
    libelle: { fr: "X'PLORE", en: "X'PLORE" },
    to: '/xplore',
    degre: { fr: 'Six routes. Six histoires.', en: 'Six routes. Six stories.' },
  },
  {
    libelle: { fr: 'Journal', en: 'Journal' },
    to: '/journal',
    degre: { fr: 'Le carnet de route', en: 'The travel journal' },
  },
  {
    libelle: { fr: 'Edja Shop', en: 'Edja Shop' },
    to: '/boutique',
    degre: { fr: 'Collection TRIBE', en: 'TRIBE collection' },
  },
  {
    libelle: { fr: 'Contact', en: 'Contact' },
    to: '/contact',
    degre: { fr: 'Écrire à la maison', en: 'Write to the house' },
  },
]

/** L'action principale. Une seule par écran : elle ne concurrence jamais les entrées. */
export const CTA_PRINCIPAL: LienNav = {
  libelle: { fr: 'Travailler avec Prince', en: 'Work with Prince' },
  to: '/travailler-ensemble',
}

export interface BlocFooter {
  titre: Libelle
  liens: LienNav[]
}

/** Le pied de page reprend l'architecture des trois lots du CDC, puis le juridique. */
export const FOOTER_NAV: BlocFooter[] = [
  {
    titre: { fr: 'Prince Edja', en: 'Prince Edja' },
    liens: [
      { libelle: { fr: 'Mon histoire', en: 'My story' }, to: '/a-propos' },
      { libelle: { fr: 'Audience', en: 'Audience' }, to: '/a-propos#audience' },
      { libelle: { fr: 'Offres', en: 'Services' }, to: '/a-propos#offres' },
      { libelle: { fr: 'Collaborer', en: 'Work with us' }, to: '/a-propos#collaborer' },
      {
        libelle: { fr: 'Presse & distinctions', en: 'Press & honours' },
        to: '/presse',
      },
      { libelle: { fr: 'Journal', en: 'Journal' }, to: '/journal' },
      {
        libelle: { fr: 'Travailler avec Prince', en: 'Work with Prince' },
        to: '/travailler-ensemble',
      },
    ],
  },
  {
    titre: { fr: 'Histoires', en: 'Stories' },
    liens: [
      { libelle: { fr: 'Tous les projets', en: 'All projects' }, to: '/histoires' },
      { libelle: { fr: 'Archive d’Afrique', en: 'Archive of Africa' }, to: '/archive-afrique' },
      { libelle: { fr: "Série X'PLORE", en: "X'PLORE series" }, to: '/xplore' },
      {
        libelle: { fr: 'Taste & Travel', en: 'Taste & Travel' },
        to: '/taste-and-travel',
      },
    ],
  },
  {
    titre: { fr: 'Edja Shop', en: 'Edja Shop' },
    liens: [
      { libelle: { fr: 'Collection TRIBE', en: 'TRIBE collection' }, to: '/boutique' },
      { libelle: { fr: 'Contact', en: 'Contact' }, to: '/contact' },
    ],
  },
  {
    titre: { fr: 'Informations', en: 'Legal' },
    liens: [
      { libelle: { fr: 'Mentions légales', en: 'Legal notice' }, to: '/mentions-legales' },
      {
        libelle: { fr: 'Confidentialité', en: 'Privacy' },
        to: '/confidentialite',
      },
      { libelle: { fr: 'Cookies', en: 'Cookies' }, to: '/cookies' },
      { libelle: { fr: 'CGV', en: 'Terms of sale' }, to: '/cgv' },
      { libelle: { fr: 'Retours & échanges', en: 'Returns' }, to: '/retours' },
    ],
  },
]

/**
 * Libellés d'un segment de chemin.
 *
 * Les segments dynamiques (`:slug`, `:objet`) n'y figurent pas : le titre réel est
 * fourni par la page via `Breadcrumb`, qui écrase le dernier fragment.
 */
const SEGMENTS: Record<string, Libelle> = {
  'a-propos': { fr: 'Prince Edja', en: 'Prince Edja' },
  influence: { fr: 'Influence & collaborations', en: 'Influence & partnerships' },
  destinations: { fr: 'Destinations', en: 'Destinations' },
  histoires: { fr: 'Histoires', en: 'Stories' },
  xplore: { fr: "X'PLORE", en: "X'PLORE" },
  'taste-and-travel': { fr: 'Taste & Travel', en: 'Taste & Travel' },
  journal: { fr: 'Journal', en: 'Journal' },
  boutique: { fr: 'Edja Shop', en: 'Edja Shop' },
  presse: { fr: 'Presse', en: 'Press' },
  contact: { fr: 'Contact', en: 'Contact' },
  'travailler-ensemble': {
    fr: 'Travailler avec Prince',
    en: 'Work with Prince',
  },
  recherches: { fr: 'Recherche', en: 'Search' },
}

const RACINE: Libelle = { fr: 'Accueil', en: 'Home' }

export interface FragmentFil {
  libelle: Libelle
  to: string
}

/**
 * Le fil d'Ariane d'un chemin. Retourné comme fragments déjà résolus par langue,
 * pour que le JSON-LD et le rendu visuel ne puissent pas diverger.
 */
export function filDariane(chemin: string): FragmentFil[] {
  const morceaux = chemin.split('/').filter(Boolean)
  const fil: FragmentFil[] = [{ libelle: RACINE, to: '/' }]
  let accumule = ''

  for (const morceau of morceaux) {
    accumule += `/${morceau}`
    fil.push({ libelle: SEGMENTS[morceau] ?? { fr: morceau, en: morceau }, to: accumule })
  }

  return fil
}


/** Les trois portes d'entrée proposées sur la 404 : le strict nécessaire. */
export const ENTREES_404: LienNav[] = [
  { libelle: { fr: "Série X'PLORE", en: "X'PLORE series" }, to: '/xplore' },
  { libelle: { fr: 'Journal', en: 'Journal' }, to: '/journal' },
  { libelle: { fr: 'Edja Shop', en: 'Edja Shop' }, to: '/boutique' },
]

export const LANGUES: { code: Langue; libelle: string; court: string }[] = [
  { code: 'fr', libelle: 'Français', court: 'FR' },
  { code: 'en', libelle: 'English', court: 'EN' },
]

export interface PageLegale {
  chemin: string
  numero: string
  famille: string
  titre: Libelle
  resume: Libelle
  /** Les rubriques que la page devra couvrir. Squelette, pas rédaction. */
  sections: string[]
}

/**
 * Pages légales : squelettes.
 *
 * Les rubriques sont listées pour que la maison sache ce qui manque, mais **aucun
 * texte juridique n'est rédigé ici** : inventer une clause engage la maison. Chaque
 * page est en `noindex` tant que son contenu n'est pas fourni.
 */
export const PAGES_LEGALES: PageLegale[] = [
  {
    chemin: '/mentions-legales',
    numero: '01',
    famille: 'Informations légales',
    titre: { fr: 'Mentions légales', en: 'Legal notice' },
    resume: {
      fr: 'Éditeur du site, hébergeur, directeur de la publication et propriété intellectuelle.',
      en: 'Site publisher, host, publication director and intellectual property.',
    },
    sections: [
      'Éditeur et statut juridique',
      'Coordonnées et contact',
      'Hébergeur',
      'Directeur de la publication',
      'Propriété intellectuelle',
    ],
  },
  {
    chemin: '/confidentialite',
    numero: '02',
    famille: 'Informations légales',
    titre: { fr: 'Confidentialité', en: 'Privacy policy' },
    resume: {
      fr: 'Données collectées, finalités, durée de conservation et droits des personnes.',
      en: 'Data collected, purposes, retention period and individual rights.',
    },
    sections: [
      'Données collectées',
      'Finalités et base légale',
      'Durée de conservation',
      'Destinataires',
      'Droits et contact',
    ],
  },
  {
    chemin: '/cookies',
    numero: '03',
    famille: 'Informations légales',
    titre: { fr: 'Cookies', en: 'Cookies' },
    resume: {
      fr: 'Nature des traceurs utilisés, consentement et modalités de refus.',
      en: 'Nature of trackers used, consent and how to refuse them.',
    },
    sections: [
      'Traceurs utilisés',
      'Consentement',
      'Modalités de refus',
      'Durée de conservation',
    ],
  },
  {
    chemin: '/cgv',
    numero: '04',
    famille: 'Informations légales',
    titre: { fr: 'CGV', en: 'Terms of sale' },
    resume: {
      fr: 'Conditions de vente et de réservation des objets de la collection.',
      en: 'Terms of sale and reservation for the collection.',
    },
    sections: [
      'Objet et champ d’application',
      'Commande et réservation',
      'Prix et paiement',
      'Livraison',
      'Responsabilité',
    ],
  },
  {
    chemin: '/retours',
    numero: '05',
    famille: 'Informations légales',
    titre: { fr: 'Retours & échanges', en: 'Returns & exchanges' },
    resume: {
      fr: 'Délai, état attendu et prise en charge des frais de retour.',
      en: 'Timeframe, expected condition and who covers return shipping.',
    },
    sections: ['Délai de rétractation', 'État attendu', 'Frais de retour', 'Remboursement'],
  },
]
