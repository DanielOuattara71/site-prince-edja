import { useSeo } from '@/hooks/useSeo'
import { SITE } from '@/data/site'
import { Hero } from '@/components/sections/home/Hero'
import { IntroBio } from '@/components/sections/home/IntroBio'
import { FilmsList } from '@/components/sections/home/FilmsList'
import { UniversStack } from '@/components/sections/home/UniversStack'
import { ManifesteHorizontal } from '@/components/sections/home/ManifesteHorizontal'
import { PressMarquee } from '@/components/sections/home/PressMarquee'
import { JournalTeaser } from '@/components/sections/home/JournalTeaser'

export default function HomePage() {
  useSeo({
    title: `${SITE.name} — Raconter · Transmettre · Voyager`,
    description:
      'Documentaires X’PLORE Côte d’Ivoire, Taste & Travel, circuits OHENE Tour et bijoux TRIBE par Prince Edja, griot 2.0 basé à Abidjan.',
  })

  return (
    <>
      <Hero />
      <IntroBio />
      <FilmsList />
      <UniversStack />
      <ManifesteHorizontal />
      <PressMarquee />
      <JournalTeaser />
    </>
  )
}
