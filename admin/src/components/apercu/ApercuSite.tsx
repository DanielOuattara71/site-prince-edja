import { Monitor, Smartphone } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { z } from 'zod'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'
import { ecrirePreference, lirePreference } from '@/lib/preferences'

/**
 * Aperçu d'un contenu tel que le site public l'affichera (section 10) : mêmes jetons et
 * même typographie (D-05), en largeur mobile (390 px) ou bureau. Le mode choisi est une
 * préférence d'affichage, mémorisée par poste (D-09). Une panne de rendu reste confinée
 * à l'aperçu.
 *
 * @example
 * <ApercuSite libelle="Aperçu de l'article">
 *   <EnteteArticle titre={titre} extrait={extrait} />
 *   <RenduCorps corps={corps} langue="fr" />
 * </ApercuSite>
 */
type Mode = 'mobile' | 'bureau'
const modeSchema = z.enum(['mobile', 'bureau'])

export function ApercuSite({ libelle, children }: { libelle: string; children: ReactNode }) {
  const [mode, setMode] = useState<Mode>(() => lirePreference('apercu', modeSchema, 'bureau'))

  const choisir = (suivant: Mode) => {
    setMode(suivant)
    ecrirePreference('apercu', suivant)
  }

  return (
    <section aria-label={libelle} className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="label-caps text-ink-700">{libelle}</h2>
        <fieldset className="flex gap-1">
          <legend className="sr-only">{t('apercu.largeur')}</legend>
          {(
            [
              ['mobile', Smartphone, t('apercu.mobile')],
              ['bureau', Monitor, t('apercu.bureau')],
            ] as const
          ).map(([valeur, Icone, texte]) => (
            <button
              key={valeur}
              type="button"
              aria-pressed={mode === valeur}
              onClick={() => choisir(valeur)}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 rounded-md border px-3 text-button',
                mode === valeur
                  ? 'border-ink-900 bg-sand-200 font-semibold text-ink-900'
                  : 'border-sand-300 text-ink-700 hover:bg-sand-100',
              )}
            >
              <Icone aria-hidden className="size-4" />
              {texte}
            </button>
          ))}
        </fieldset>
      </div>
      <div className="overflow-x-auto rounded-xl border border-sand-200 bg-sand-200 p-3">
        <div
          className={cn(
            'mx-auto bg-sand-50 font-sans text-ink-900 shadow-sm',
            mode === 'mobile' ? 'w-[390px] px-5 py-10' : 'min-w-[960px] px-10 py-16',
          )}
        >
          <ErrorBoundary titre={t('apercu.panne')}>
            <div className="mx-auto max-w-3xl space-y-8">{children}</div>
          </ErrorBoundary>
        </div>
      </div>
    </section>
  )
}

/** En-tête d'article, sur le modèle de `ArticlePage` du site public. */
export function EnteteArticle({
  titre,
  extrait,
  meta,
}: {
  titre: string
  extrait?: string | null | undefined
  meta?: string
}) {
  return (
    <header className="space-y-4">
      <h1 className="font-display text-display-lg text-balance uppercase">{titre}</h1>
      {extrait ? <p className="text-body-lg text-ink-500">{extrait}</p> : null}
      {meta ? <p className="text-caption text-ink-500">{meta}</p> : null}
    </header>
  )
}
