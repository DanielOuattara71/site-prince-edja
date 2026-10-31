import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Repris du site public. Les huit tailles du thème (`text-caption`, `text-heading-sm`…)
 * sont déclarées comme `font-size` : sans cela, tailwind-merge les range avec les
 * couleurs `text-*`, et une taille écrase la couleur posée dans le même `cn()`.
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

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs))
}
