import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { FOOTER_NAV } from '@/data/navigation'
import { SITE } from '@/data/site'
import { useLocalTime } from '@/hooks/useLocalTime'
import { Container } from '@/components/layout/Container'
import { RoundedDivider } from '@/components/layout/RoundedDivider'
import { Button } from '@/components/ui/Button'
import { useLangue } from '@/i18n/contexteLangue'
import { LangueSwitcher } from '@/components/layout/LangueSwitcher'
import { BlocNewsletter } from '@/components/newsletter/BlocNewsletter'

export function Footer() {
  const time = useLocalTime()
  const year = new Date().getFullYear()
  const { l } = useLangue()

  return (
    <>
      <RoundedDivider />
      <footer className="grain bg-night-900 text-cream-100">
        <Container className="pt-20 pb-10 lg:pt-28">
          <div className="flex flex-col justify-between gap-10 md:flex-row md:items-end">
            <div className="max-w-2xl space-y-5">
              <p className="label-caps text-gold-400">Contact</p>
              <h2 className="font-display uppercase text-display-lg">
                Parlons du prochain récit<span aria-hidden className="text-clay-500">.</span>
              </h2>
            </div>
            <Button to="/travailler-ensemble" variant="primary">
              Travailler avec Prince
            </Button>
          </div>

          <hr aria-hidden className="mt-14 border-cream-100/25" />

          <BlocNewsletter compact className="pt-10" />

          <div className="grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-5">
            {FOOTER_NAV.map((bloc) => (
              <nav key={bloc.titre.fr} aria-label={l(bloc.titre)} className="space-y-3">
                <p className="label-caps text-cream-100/60">{l(bloc.titre)}</p>
                <ul className="space-y-2">
                  {bloc.liens.map((lien) => (
                    <li key={`${bloc.titre.fr}-${lien.to}`}>
                      <Link
                        to={lien.to}
                        className="inline-flex min-h-11 items-center text-caption text-cream-100/80 underline-offset-4 transition-colors hover:text-clay-500 hover:underline"
                      >
                        {l(lien.libelle)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}

            <div className="space-y-3">
              <p className="label-caps text-cream-100/60">Heure locale</p>
              <p className="font-display uppercase text-heading-sm">
                <time dateTime={time} className="tnum">
                  {time}
                </time>{' '}
                <span className="align-middle text-caption tracking-normal text-gold-400">
                  Abidjan · GMT
                </span>
              </p>
              <p className="text-caption text-cream-100/60">
                Disponible pour partenariats, médias et événements.
              </p>
              <LangueSwitcher className="pt-2" />
            </div>
          </div>

          <div className="mt-14 flex flex-col justify-between gap-3 border-t border-cream-100/10 pt-6 sm:flex-row">
            <p className="label-caps text-cream-100/40">{SITE.devise}</p>
            <a
              href={`mailto:${SITE.email}`}
              className="group inline-flex min-h-11 items-center gap-2 text-caption text-cream-100/60 underline-offset-4 hover:text-cream-100 hover:underline"
            >
              {SITE.email}
              <ArrowUpRight
                aria-hidden
                className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
              />
            </a>
            <p className="label-caps text-cream-100/40">
              © {year} {SITE.name} · Version 1.0
            </p>
          </div>
        </Container>
      </footer>
    </>
  )
}
