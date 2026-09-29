import { Link } from 'react-router'
import { ArrowRight } from 'lucide-react'
import { COMPTOIRS } from '@/data/comptoirs'
import { themeDeComptoir, themeVersVariablesCss } from '@/lib/themeComptoir'
import { delaiCyclique } from '@/lib/motion'
import { Container } from '@/components/layout/Container'
import { SectionMarker } from '@/components/ui/SectionMarker'
import { Reveal } from '@/components/motion/Reveal'
import { formatFCFA } from '@/lib/format'
import type { CSSProperties } from 'react'

/**
 * L'index des comptoirs : une ligne par univers.
 *
 * Chaque ligne prend le thème de son comptoir : on juge un univers à sa couleur de sol
 * et à son accent avant même de lire son nom. C'est la preuve visuelle que le système
 * de thème fonctionne. Chaque ligne mène à la vraie route du comptoir.
 *
 * La ligne porte donc le **sol**, pas seulement l'accent : l'or d'À Porter et de Tissé
 * n'existe que sur fond sombre (2,1:1 sur clair — interdit en texte). Laisser la ligne
 * sur le fond de page rendait les numéros 01 et 02 illisibles, et ne montrait plus
 * du tout la lumière du comptoir.
 */
export function IndexComptoirs() {
  return (
    <section aria-labelledby="titre-comptoirs" className="border-t border-sand-200 py-20 lg:py-28">
      <Container>
        <Reveal>
          <SectionMarker num="00" eyebrow="Le marché · quatre comptoirs ouverts" />
          <h2 id="titre-comptoirs" className="mt-5 font-display uppercase text-display-lg">
            Chaque comptoir a sa lumière
            <span aria-hidden className="text-clay-500">.</span>
          </h2>
          <p className="mt-4 max-w-2xl text-body-lg text-ink-500">
            Pièces sourcées, ateliers nommés, éditions numérotées. On entre dans un comptoir
            comme on entre dans un atelier : par ce qu'il fabrique et par où il le fabrique.
          </p>
        </Reveal>

        <ul className="mt-12 border-t border-[color:var(--c-trait,var(--color-sand-200))]">
          {COMPTOIRS.map((comptoir, index) => {
            const style = themeVersVariablesCss(themeDeComptoir(comptoir.theme)) as CSSProperties

            return (
              <Reveal key={comptoir.slug} delay={delaiCyclique(index)}>
                <li className="border-b border-[color:var(--c-trait,var(--color-sand-200))]">
                  <Link
                    to={`/boutique/${comptoir.slug}`}
                    style={style}
                    className="group relative grid scroll-mt-28 items-center gap-x-6 gap-y-3 bg-[var(--c-sol)] px-4 py-7 text-[var(--c-texte)] transition-colors duration-(--d-base) ease-expo hover:bg-[var(--c-surface)] sm:grid-cols-[3rem_minmax(0,14rem)_minmax(0,1fr)_auto]"
                  >
                    {/* Le filet d'accent se déploie au survol : c'est le cadre qui bouge,
                        jamais le nom — la marchandise reste fixe. */}
                    <span
                      aria-hidden
                      className="pointer-events-none absolute left-0 top-1/2 h-0 w-px -translate-y-1/2 bg-[var(--c-accent)] transition-[height] duration-(--d-base) ease-expo group-hover:h-2/3"
                    />

                    <span className="data-mono text-sm text-[var(--c-accent)]">{comptoir.numero}</span>

                    <span className="font-title text-heading-sm leading-none">{comptoir.nom}</span>

                    <span className="text-body text-[var(--c-texte-doux)]">{comptoir.intention}</span>

                    <span className="flex items-center justify-start gap-4 sm:justify-end">
                      <span className="data-mono label-caps text-[var(--c-texte-doux)]">
                        {comptoir.nbPieces > 0
                          ? `${comptoir.nbPieces} pièces`
                          : 'en ouverture'}
                        {comptoir.collection && (
                          <span className="ml-3 opacity-70">{comptoir.collection}</span>
                        )}
                      </span>
                      <ArrowRight
                        aria-hidden
                        className="size-4 shrink-0 opacity-40 transition-transform duration-(--d-fast) ease-expo group-hover:translate-x-1 group-hover:opacity-100"
                      />
                    </span>
                  </Link>
                </li>
              </Reveal>
            )
          })}
        </ul>

        <Reveal delay={0.1}>
          <p className="mt-8 text-sm text-ink-500">
            Règlement après confirmation, par Mobile Money, virement ou sur place. Abidjan : J+1.
            Un exemple de montant : {formatFCFA(45000)} pour une pièce en bronze perdu.
          </p>
        </Reveal>
      </Container>
    </section>
  )
}
