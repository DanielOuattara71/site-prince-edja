import type { ReactNode } from 'react'
import { LienEvitement } from '@/components/layout/LienEvitement'
import { TitrePage } from '@/components/layout/TitrePage'
import { t } from '@/i18n/fr'

/** Mise en page commune des écrans d'accès : colonne étroite, centrée, utilisable à 320 px. */
export function CadreAcces({
  titre,
  intro,
  children,
}: {
  titre: string
  intro?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="min-h-svh bg-sand-50">
      <LienEvitement />
      <header className="border-b border-sand-200 px-5 py-4">
        <p className="font-display text-heading-sm uppercase text-ink-900">{t('app.nom')}</p>
      </header>
      <main
        id="contenu"
        tabIndex={-1}
        className="mx-auto max-w-md space-y-6 px-5 py-12 focus:outline-none"
      >
        <div className="space-y-2">
          <TitrePage titre={titre}>{titre}</TitrePage>
          {intro ? <p className="text-body text-ink-700">{intro}</p> : null}
        </div>
        {children}
      </main>
    </div>
  )
}
