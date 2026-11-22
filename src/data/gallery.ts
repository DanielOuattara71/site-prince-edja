import type { GalleryItem } from '@/types'
import { img } from '@/lib/images'

export const GALLERY: GalleryItem[] = [
  {
    src: img(`images/episodes/bouake.jpg`),
    alt: 'Le Dernier, le dernier rhinocéros blanc de Bouaké',
    to: '/xplore/le-dernier',
    ratio: '4/3',
    speed: 5,
    label: 'Bouaké',
  },
  {
    src: img(`images/episodes/tai.jpg`),
    alt: 'La Forêt debout, la forêt primaire de Taï',
    to: '/xplore/la-foret-debout',
    ratio: '4/3',
    speed: 8,
    label: 'Taï',
  },
  {
    src: img(`images/boutique/agadez.jpg`),
    alt: 'Bijou Agadez d’Edja Shop',
    to: '/boutique',
    ratio: '4/3',
    speed: 4,
    label: 'Edja Shop',
  },
  {
    src: img(`images/episodes/tiassale.jpg`),
    alt: 'Le Fleuve, le Bandama à Tiassalé',
    to: '/xplore/le-fleuve',
    ratio: '16/10',
    speed: 6,
    label: 'Tiassalé',
  },
  {
    src: img(`images/a-propos/portrait-edja.jpg`),
    alt: 'Prince Edja en carnet de route',
    to: '/a-propos',
    ratio: '16/10',
    speed: 7,
    label: 'Portrait',
  },
  {
    src: img(`images/episodes/sassandra.jpg`),
    alt: 'La Côte vive, le littoral de Sassandra',
    to: '/xplore/la-cote-vive',
    ratio: '21/9',
    speed: 5,
    label: 'Sassandra',
  },
]

export const GALLERY_QUOTE = {
  texte:
    '« Prince Edja fait découvrir l’Afrique autrement — un guide authentique qui révèle les pépites cachées du continent. »',
  source: 'TV5MONDE',
  date: '2024',
  url: 'https://information.tv5monde.com/afrique/video/prince-edja-fait-decouvrir-lafrique-autrement-2761333',
  avatar: img(`images/presse/tv5monde.jpg`),
}
