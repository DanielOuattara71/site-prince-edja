import { useState } from 'react'
import { EPISODES } from '@/data/content'
import { Stagger } from '@/components/motion/Stagger'
import { FloatingPreview } from '@/components/motion/FloatingPreview'
import { FilmRow } from '@/components/cards/FilmRow'

export function EpisodesIndex() {
  const [activeImage, setActiveImage] = useState<string | null>(null)

  return (
    <div onMouseLeave={() => setActiveImage(null)} className="border-b border-cream-100/15">
      <Stagger>
        {EPISODES.map((episode) => (
          <FilmRow
            key={episode.slug}
            numero={episode.numero}
            titre={episode.titre}
            lieu={episode.lieu}
            pitch={episode.pitch}
            image={episode.image}
            to={`/xplore/${episode.slug}`}
            onEnter={() => setActiveImage(episode.image)}
            onLeave={() => setActiveImage(null)}
          />
        ))}
      </Stagger>
      <FloatingPreview src={activeImage} />
    </div>
  )
}
