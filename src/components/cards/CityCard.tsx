import type { TravelCity } from '@/types'
import { ParallaxImage } from '@/components/media/ParallaxImage'

interface CityCardProps {
  city: TravelCity
  index: number
}

/**
 * Carte d'une étape Taste & Travel.
 *
 * Aucun lien : `TravelCity` ne porte pas de destination associée, et les six routes
 * vivent sur `/destinations/:slug`. La carte ne promet donc pas de clic — plus de
 * `group`, plus de zoom au survol, plus de titre qui change de couleur. Une carte
 * qui réagit sans rien ouvrir est une fausse porte.
 */
export function CityCard({ city, index }: CityCardProps) {
  return (
    <article className={`relative flex h-full flex-col ${index === 1 ? 'lg:mt-16' : ''}`}>
      <ParallaxImage
        src={city.image}
        alt=""
        ratio="4/5"
        range={4}
        className="rounded-md"
      />
      <span className="label-caps absolute left-4 top-4 z-10 flex items-center gap-2 rounded-full bg-night-900/85 px-4 py-2 text-cream-100 backdrop-blur-sm">
        <span aria-hidden className="size-1.5 rounded-full bg-gold-400" />
        Étape {String(index + 1).padStart(2, '0')}
      </span>
      <p aria-hidden className="mt-5 font-display text-heading-sm text-gold-400">
        {String(index + 1).padStart(2, '0')}
      </p>
      <h3 className="mt-1 font-display uppercase text-heading-md text-cream-100">
        {city.nom}
      </h3>
      <p className="mt-2 text-body text-cream-100/60">{city.intention}</p>
    </article>
  )
}
