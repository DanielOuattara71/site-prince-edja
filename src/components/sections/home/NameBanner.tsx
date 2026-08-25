import { Marquee } from '@/components/motion/Marquee'

const REPEATS = 4

export function NameBanner() {
  return (
    <section aria-label="Prince Edja" className="border-y border-cream-100/10 bg-night-900 py-5 lg:py-7">
      <h2 className="sr-only">Prince Edja</h2>
      <div aria-hidden>
        <Marquee duration={24}>
          {Array.from({ length: REPEATS }, (_, index) => (
            <span key={index} className="flex shrink-0 items-center">
              <span className="whitespace-nowrap px-6 font-display uppercase leading-none text-cream-100 text-heading-md sm:text-heading-md lg:text-display-lg">
                Prince&nbsp;Edja
              </span>
              <span className="mx-3 size-2 shrink-0 rounded-full bg-gold-400 sm:size-2.5" />
            </span>
          ))}
        </Marquee>
      </div>
    </section>
  )
}
