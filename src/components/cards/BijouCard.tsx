import type { Bijou } from '@/types'
import { ParallaxImage } from '@/components/media/ParallaxImage'

interface BijouCardProps {
  bijou: Bijou
}

export function BijouCard({ bijou }: BijouCardProps) {
  return (
    <article className="group flex h-full flex-col">
      <ParallaxImage
        src={bijou.image}
        alt={`Bijou ${bijou.nom}, inspiré de la culture ${bijou.culture}`}
        ratio="3/4"
        range={4}
        zoomOnHover
        className="rounded-t-[7rem] rounded-b-md"
      />
      <div className="flex items-baseline justify-between gap-4 pt-5">
        <p aria-hidden className="font-display text-heading-sm text-gold-400">{bijou.numero}</p>
        <p className="label-caps text-ink-500">{bijou.culture}</p>
      </div>
      <h3 className="mt-1 font-display uppercase text-heading-sm text-ink-900">{bijou.nom}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-500">{bijou.histoire}</p>
    </article>
  )
}
