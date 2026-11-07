import type { ReactNode } from 'react'
import type { Langue } from '@/api/schemas/communs'
import { ChampTraduit } from '@/components/formulaire/ChampTraduit'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { t } from '@/i18n/fr'
import type { ValeursTraduites } from '@/lib/traductions'

/**
 * Section repliée « Avancé » (U3) : adresse de la page et champs pour les moteurs de
 * recherche. Elle s'ouvre d'elle-même quand un de ses champs est refusé, et le résumé
 * d'erreurs l'ouvre avant d'y placer le curseur.
 */
export function SectionAvancee({ ouverte, children }: { ouverte: boolean; children: ReactNode }) {
  return (
    <details open={ouverte || undefined} className="rounded-md border border-sand-200 p-4">
      <summary className="inline-flex min-h-11 cursor-pointer items-center text-body font-semibold text-ink-900">
        {t('formulaire.avance')}
      </summary>
      <p className="text-caption text-ink-700">{t('formulaire.avanceAide')}</p>
      <div className="mt-4 space-y-4">{children}</div>
    </details>
  )
}

/**
 * Adresse de la page (RG-04), tirée du titre et toujours modifiable ; si elle est déjà prise,
 * le serveur propose une adresse libre que l'on peut reprendre d'un clic.
 */
export function ChampAdresse({
  valeurs,
  erreurs,
  surChange,
  suggestion,
  surSuggestion,
}: {
  valeurs: ValeursTraduites
  erreurs: Partial<Record<Langue, string | undefined>>
  surChange: (langue: Langue, valeur: string) => void
  suggestion: { langue: Langue; valeur: string } | null
  surSuggestion: (langue: Langue, valeur: string) => void
}) {
  return (
    <>
      <ChampTraduit
        nom="slug"
        libelle={t('article.slug')}
        aide={t('article.slugAide')}
        valeurs={valeurs}
        erreurs={erreurs}
        surChange={surChange}
      />
      {suggestion ? (
        <Alerte ton="info">
          <p>{t('article.slugPris')}</p>
          <Bouton
            variante="secondaire"
            onClick={() => surSuggestion(suggestion.langue, suggestion.valeur)}
          >
            {t('article.utiliserSlug')} « {suggestion.valeur} »
          </Bouton>
        </Alerte>
      ) : null}
    </>
  )
}
