import type { TravelCity } from '@/types'
import { LazyImage } from '@/components/media/LazyImage'

interface CityCardProps {
  city: TravelCity
  index: number
}

export function CityCard({ city, index }: CityCardProps) {
  return (
    <article className="group">
      <LazyImage src={city.image} alt="" ratio="4/5" className="rounded-md" imgClassName="transition-transform duration-(--d-reveal) ease-expo group-hover:scale-[1.04]" />
      <p aria-hidden className="mt-5 font-display text-heading-sm text-gold-400">
        {String(index + 1).padStart(2, '0')}
      </p>
      <h3 className="mt-1 font-display uppercase text-heading-md text-cream-100">{city.nom}</h3>
      <p className="mt-2 text-body text-cream-100/60">{city.intention}</p>
    </article>
  )
}
