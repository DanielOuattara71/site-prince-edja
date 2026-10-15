import type { Distinction } from '@/types'

export const DISTINCTIONS: Distinction[] = [
  {
    id: 'aip-2024',
    annee: '2024',
    titre: 'AIP Awards · Meilleur créateur web pro',
    delivreePar: 'AIP',
    description: 'Distinction nationale pour la qualité du récit digital et l’impact du contenu web professionnel.',
    image: `${import.meta.env.BASE_URL}images/placeholder-carre.svg`,
    url: 'https://www.fratmat.info/article/2635778/culture/tourisme-et-des-loisirs-aboudia-et-franck-prince-edja-designes-ambassadeurs',
  },
  {
    id: 'ambassadeur-2025',
    annee: '2025',
    titre: 'Ambassadeur du Tourisme et des Loisirs',
    delivreePar: 'Ministère du Tourisme',
    description: 'Nomination officielle au cercle des Ambassadeurs, stratégie Sublime Côte d’Ivoire.',
    image: `${import.meta.env.BASE_URL}images/placeholder-foret.svg`,
    url: 'https://tourisme.gouv.ci/accueil/actualites/aboudia-et-prince-edja-rejoignent-le-cercle-prestigieux-des-ambassadeurs-du-tourisme-et-des-loisirs-de-cote-divoire/228',
  },
  {
    id: 'chevalier-2025',
    annee: '2025',
    titre: 'Chevalier de l’Ordre du Mérite',
    delivreePar: 'République de Côte d’Ivoire',
    description: 'Élevé au rang de Chevalier de l’Ordre du Mérite du Tourisme pour le service rendu à la nation.',
    image: `${import.meta.env.BASE_URL}images/placeholder-fleuve.svg`,
  },
  {
    id: 'masa-2026',
    annee: '2026',
    titre: 'MASA · Parrain des jeunes créateurs',
    delivreePar: 'MASA',
    description: 'Ambassadeur du Marché des Arts du Spectacle Africain, parrain de la nouvelle génération.',
    image: `${import.meta.env.BASE_URL}images/placeholder-paysage.svg`,
  },
]
