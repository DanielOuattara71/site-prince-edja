import { Link } from 'react-router'
import { ArrowUpRight } from 'lucide-react'
import { NAV_ITEMS, SITE } from '@/data/site'
import { useLocalTime } from '@/hooks/useLocalTime'
import { Container } from '@/components/layout/Container'
import { RoundedDivider } from '@/components/layout/RoundedDivider'
import { Button } from '@/components/ui/Button'

export function Footer() {
  const time = useLocalTime()
  const year = new Date().getFullYear()

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
            <Button to="/contact" variant="primary">
              Démarrer un projet
            </Button>
          </div>

          <hr aria-hidden className="mt-14 border-cream-100/15" />

          <div className="grid gap-10 pt-12 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <p className="label-caps text-cream-100/50">Écrire</p>
              <a
                href={`mailto:${SITE.email}`}
                className="group inline-flex items-center gap-2 text-button font-semibold"
              >
                {SITE.email}
                <ArrowUpRight aria-hidden className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
              <p className="text-sm text-cream-100/60">{SITE.localisation}</p>
            </div>

            <nav aria-label="Pied de page" className="space-y-3">
              <p className="label-caps text-cream-100/50">Explorer</p>
              <ul className="space-y-2">
                {[{ label: 'Accueil', to: '/' }, ...NAV_ITEMS, { label: 'À propos', to: '/a-propos' }].map(
                  (item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className="text-sm text-cream-100/80 underline-offset-4 transition-colors hover:text-clay-500 hover:underline"
                      >
                        {item.label}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </nav>

            <div className="space-y-3">
              <p className="label-caps text-cream-100/50">Heure locale</p>
              <p className="font-display uppercase text-heading-sm">
                <time dateTime={time} className="tnum">
                  {time}
                </time>{' '}
                <span className="align-middle text-caption tracking-normal text-gold-400">
                  Abidjan · GMT
                </span>
              </p>
              <p className="text-sm text-cream-100/60">
                Disponible pour partenariats, médias et événements.
              </p>
            </div>
          </div>

          <div className="mt-14 flex flex-col justify-between gap-3 border-t border-cream-100/10 pt-6 sm:flex-row">
            <p className="label-caps text-cream-100/40">{SITE.devise}</p>
            <p className="label-caps text-cream-100/40">
              © {year} {SITE.name} · Version 1.0
            </p>
          </div>
        </Container>
      </footer>
    </>
  )
}
