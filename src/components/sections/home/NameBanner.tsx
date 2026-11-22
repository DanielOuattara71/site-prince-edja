import { Marquee } from '@/components/motion/Marquee'
import { useLangue } from '@/i18n/contexteLangue'

/**
 * Bandeau défilant — la promesse du site, pas le nom.
 *
 * Le héros dit « PRINCE EDJA », le header aussi : redire le nom trois fois suivait
 * une logique de branding apprise sur des portfolios étrangers. Ce qui fait sa marque,
 * c'est le triptyque — Raconter · Transmettre · Voyager — repris dans la description
 * de l'accueil et les métadonnées du site.
 */
export function NameBanner() {
  const { l } = useLangue()
  const phrase = l({ fr: 'RACONTER · TRANSMETTRE · VOYAGER', en: 'TELL · TRANSMIT · TRAVEL' })

  return (
    <section
      aria-label={l({ fr: 'Promesse du site', en: 'Site promise' })}
      className="border-y border-cream-100/10 bg-night-900 py-5 lg:py-7"
    >
      <h2 className="sr-only">{l({ fr: 'Raconter · transmettre · voyager', en: 'Tell · transmit · travel' })}</h2>
      <div aria-hidden>
        <Marquee duration={60}>
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index} className="flex shrink-0 items-center whitespace-nowrap px-6 font-display uppercase leading-none text-cream-100 text-heading-md sm:text-heading-md lg:text-display-lg">
              {phrase}
              <span className="mx-6 inline-block size-2 shrink-0 rounded-full bg-gold-400 sm:size-2.5 align-middle" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
