import { t } from '@/i18n/fr'

/** Premier élément focusable de chaque page : il saute la navigation (section 12). */
export function LienEvitement() {
  return (
    <a
      href="#contenu"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-clay-600 focus:px-4 focus:py-3 focus:text-button focus:font-semibold focus:text-cream-100"
    >
      {t('coque.allerContenu')}
    </a>
  )
}
