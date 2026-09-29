import type { ComptoirInfo } from '@/types'

/**
 * Les quatre comptoirs de lancement.
 *
 * Deux univers sombres, deux univers clairs : l'alternance porte la navigation.
 * Le `theme` pointe sur une entrée de `THEMES` (src/lib/themeComptoir.ts) : c'est le seul
 * lien entre le contenu et l'univers visuel. Changer de régie ou de rituel ne touche pas ce fichier.
 */
export const COMPTOIRS: ComptoirInfo[] = [
  {
    slug: 'a-porter',
    numero: '01',
    nom: 'À porter',
    collection: 'TRIBE',
    intention: 'Bronze, laiton et argent façonnés à la main, du symbole à la pièce.',
    theme: 'a-porter',
    nbPieces: 10,
    image: `${import.meta.env.BASE_URL}images/boutique/hero-tribe.jpg`,
  },
  {
    slug: 'tisse',
    numero: '02',
    nom: 'Tissé & maillé',
    collection: 'MAILLE',
    intention: 'Bandes tissées, indigo et coton : le vêtement comme archive vivante.',
    theme: 'tisse',
    nbPieces: 7,
    image: `${import.meta.env.BASE_URL}images/motifs/motif-africain.jpg`,
  },
  {
    slug: 'maison-table',
    numero: '03',
    nom: 'Maison & table',
    intention: 'Vannerie, céramique et laiton pour la maison ivoirienne contemporaine.',
    theme: 'maison-table',
    nbPieces: 0,
    image: `${import.meta.env.BASE_URL}images/xplore/bandeau-foret.jpg`,
  },
  {
    slug: 'memoire',
    numero: '05',
    nom: 'Mémoire & éditions',
    collection: 'ÉDITIONS DU GRIOT',
    intention: 'Livres, tirages et guides : ce qui reste quand le voyage est fini.',
    theme: 'memoire',
    nbPieces: 0,
    image: `${import.meta.env.BASE_URL}images/journal/griot-moderne.jpg`,
  },
]
