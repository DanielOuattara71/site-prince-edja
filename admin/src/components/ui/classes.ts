import { cn } from '@/lib/cn'

/**
 * Classes partagées par les primitives. Dans un `.ts` à part : un `.tsx` qui exporte autre
 * chose qu'un composant casse le rechargement à chaud.
 */

/** Bordure d'un contrôle selon son état : l'erreur est aussi dite en texte, jamais en couleur seule. */
export function classesControle(erreur: string | undefined): string {
  return cn(
    'w-full rounded-md border bg-sand-50 px-3 text-body text-ink-900 disabled:cursor-not-allowed disabled:bg-sand-100 disabled:text-ink-700',
    erreur ? 'border-clay-700' : 'border-ink-500',
  )
}

/** Lien d'action dans le texte : terracotta foncé, souligné (jamais la couleur seule). */
export const CLASSES_LIEN =
  'font-semibold text-clay-700 underline underline-offset-4 hover:text-ink-900'
