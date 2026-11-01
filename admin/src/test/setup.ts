import { cleanup, configure } from '@testing-library/react'
import { afterEach } from 'vitest'

// Les pages se chargent à la demande (`lazy`) : sous la charge de la suite complète, la
// première transformation d'un module dépasse parfois la seconde d’attente par défaut (l’éditeur riche : plusieurs secondes).
configure({ asyncUtilTimeout: 20_000 })

// Sans `globals: true`, Testing Library ne nettoie pas seul entre deux tests.
afterEach(() => {
  cleanup()
})

// axe sonde `<canvas>` pour ses règles visuelles ; jsdom ne le dessine pas et le dit à chaque
// audit. Une réponse vide suffit : le contraste est vérifié ailleurs (`src/test/axe.ts`).
if (typeof HTMLCanvasElement !== 'undefined') HTMLCanvasElement.prototype.getContext = () => null
