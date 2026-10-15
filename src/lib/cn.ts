import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * L'échelle typographique du projet utilise des tokens Tailwind v4 (`text-caption`,
 * `text-heading-sm`, `text-display-lg`...). tailwind-merge ignore ces noms et les
 * range par défaut avec les **couleurs** `text-*` : la dernière classe du groupe
 * écrase alors les précédentes. `text-ink-900 text-caption` perd son encre,
 * `text-caption text-ink-900` perd sa taille — le CTA de la barre et le sélecteur
 * de langue sont devenus invisibles sur leur fond. Les huit tokens sont donc
 * déclarés ici comme `font-size`, leur vrai groupe, pour que couleur et taille
 * coexistent dans un même `cn()`.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        {
          text: [
            'caption',
            'button',
            'body',
            'body-lg',
            'heading-sm',
            'heading-md',
            'display-lg',
            'display-xl',
          ],
        },
      ],
    },
  },
})

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
