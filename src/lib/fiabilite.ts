import type { Fiabilite } from '@/acces/projets'
import type { Libelle } from '@/acces/site'

/** Les trois niveaux de rigueur du CDC — mêmes libellés sur toutes les pages de bibliothèque. */
export function libelleFiabilite(fiabilite: Fiabilite): Libelle {
  switch (fiabilite) {
    case 'documentee':
      return { fr: 'Histoire documentée', en: 'Documented history' }
    case 'memoire orale':
      return { fr: 'Mémoire orale', en: 'Oral memory' }
    case 'interpretation':
      return { fr: 'Interprétation', en: 'Interpretation' }
  }
}
