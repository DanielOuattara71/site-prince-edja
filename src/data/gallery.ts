import type { GalleryItem } from '@/types'

export const GALLERY: GalleryItem[] = [
  {
    src: '/images/placeholder-paysage.svg',
    alt: 'Le Dernier — le dernier rhinocéros blanc de Bouaké',
    to: '/xplore/le-dernier',
    ratio: '4/3',
    speed: 5,
    label: '01 · Bouaké',
  },
  {
    src: '/images/placeholder-foret.svg',
    alt: 'La Forêt debout — la forêt primaire de Taï',
    to: '/xplore/la-foret-debout',
    ratio: '4/3',
    speed: 8,
    label: '04 · Taï',
  },
  {
    src: '/images/placeholder-carre.svg',
    alt: 'Bijou Agadez de la collection TRIBE',
    to: '/boutique',
    ratio: '4/3',
    speed: 4,
    label: 'TRIBE',
  },
  {
    src: '/images/placeholder-fleuve.svg',
    alt: 'Le Fleuve — le Bandama à Tiassalé',
    to: '/xplore/le-fleuve',
    ratio: '16/10',
    speed: 6,
    label: '05 · Tiassalé',
  },
  {
    src: '/images/placeholder-portrait.svg',
    alt: 'Prince Edja en carnet de route',
    to: '/a-propos',
    ratio: '16/10',
    speed: 7,
    label: 'Portrait',
  },
  {
    src: '/images/placeholder-paysage.svg',
    alt: 'La Côte vive — le littoral de Sassandra',
    to: '/xplore/la-cote-vive',
    ratio: '21/9',
    speed: 5,
    label: '02 · Sassandra',
  },
]

export const GALLERY_QUOTE = {
  texte:
    '« Prince Edja fait découvrir l’Afrique autrement — un guide authentique qui révèle les pépites cachées du continent. »',
  source: 'TV5MONDE',
  date: '2024',
  url: 'https://information.tv5monde.com/afrique/video/prince-edja-fait-decouvrir-lafrique-autrement-2761333',
}
