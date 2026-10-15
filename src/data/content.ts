import type {
  Article,
  Bijou,
  ContactMotif,
  Episode,
  Milestone,
  PressItem,
  Tags,
  TravelCity,
  Univers,
} from '@/types'

/**
 * Les six chapitres de la page d'accueil, un par pilier du CDC.
 *
 * PROPOSITION à valider : les noms de piliers viennent du CDC, les pitchs en sont la
 * reformulation. Aucun fait n'y est affirmé qui ne figure déjà au CDC.
 */
export const UNIVERS: Univers[] = [
  {
    numero: '01',
    nom: 'Le griot',
    pitch: 'Raconter, transmettre, relier les générations.',
    to: '/journal',
  },
  {
    numero: '02',
    nom: 'L’explorateur',
    pitch: 'Découvrir les territoires par l’humain et l’expérience.',
    to: '/xplore',
  },
  {
    numero: '03',
    nom: 'L’ambassadeur',
    pitch: 'Transformer le voyage en outil d’image et de rayonnement.',
    to: '/a-propos#audience',
  },
  {
    numero: '04',
    nom: 'Le producteur',
    pitch: 'Transformer les histoires en œuvres.',
    to: '/histoires',
  },
  {
    numero: '05',
    nom: 'L’entrepreneur',
    pitch: 'Créer des expériences et des produits autour de la culture.',
    to: '/boutique',
  },
  {
    numero: '06',
    nom: 'Le speaker',
    pitch: 'Partager une pensée structurée : conférences, panels, masterclass et médias.',
    to: '/travailler-ensemble',
  },
]

const CÔTE_D_IVOIRE = ['Côte d’Ivoire']

const TAGS_FILM: Pick<Tags, 'format' | 'projet'> = {
  format: 'film',
  projet: 'XPLORE',
}

const TAGS_DESTINATION: Pick<Tags, 'format' | 'projet'> = {
  format: 'destination',
  projet: 'TASTE_TRAVEL',
}

const TAGS_OBJET: Pick<Tags, 'format' | 'projet'> = {
  format: 'objet',
  projet: 'TRIBE',
}

const TAGS_ARTICLE: Pick<Tags, 'format' | 'projet'> = {
  format: 'article',
  projet: 'JOURNAL',
}

export const EPISODES: Episode[] = [
  {
    slug: 'le-dernier',
    numero: '01',
    titre: 'Le Dernier',
    lieu: 'Bouaké',
    pitch: 'Le dernier rhinocéros blanc d’Afrique de l’Ouest.',
    image: `${import.meta.env.BASE_URL}images/episodes/bouake.jpg`,
    tags: {
      ...TAGS_FILM,
      pays: CÔTE_D_IVOIRE,
      ville: ['Bouaké'],
      theme: ['Faune'],
    },
  },
  {
    slug: 'la-cote-vive',
    numero: '02',
    titre: 'La Côte vive',
    lieu: 'Sassandra',
    pitch: 'L’écologie de luxe et la mémoire du littoral.',
    image: `${import.meta.env.BASE_URL}images/episodes/sassandra.jpg`,
    guide: `${import.meta.env.BASE_URL}guides/guide-sassandra.pdf`,
    tags: {
      ...TAGS_FILM,
      pays: CÔTE_D_IVOIRE,
      ville: ['Sassandra'],
      theme: ['Littoral', 'Écologie'],
    },
  },
  {
    slug: 'entre-deux-eaux',
    numero: '03',
    titre: 'Entre deux eaux',
    lieu: 'Jacqueville',
    pitch: 'Le lagon, l’océan et les hommes de la pêche.',
    image: `${import.meta.env.BASE_URL}images/episodes/jacqueville.jpg`,
    guide: `${import.meta.env.BASE_URL}guides/guide-jacqueville.pdf`,
    tags: {
      ...TAGS_FILM,
      pays: CÔTE_D_IVOIRE,
      ville: ['Jacqueville'],
      theme: ['Lagon', 'Pêche'],
    },
  },
  {
    slug: 'la-foret-debout',
    numero: '04',
    titre: 'La Forêt debout',
    lieu: 'Taï',
    pitch: 'La dernière grande forêt primaire et ses chimpanzés.',
    image: `${import.meta.env.BASE_URL}images/episodes/tai.jpg`,
    guide: `${import.meta.env.BASE_URL}guides/guide-tai.pdf`,
    tags: {
      ...TAGS_FILM,
      pays: CÔTE_D_IVOIRE,
      ville: ['Taï'],
      theme: ['Forêt', 'Faune'],
    },
  },
  {
    slug: 'le-fleuve',
    numero: '05',
    titre: 'Le Fleuve',
    lieu: 'Tiassalé',
    pitch: 'Le Bandama, ses rives et ses histoires.',
    image: `${import.meta.env.BASE_URL}images/episodes/tiassale.jpg`,
    guide: `${import.meta.env.BASE_URL}guides/guide-tiassale.pdf`,
    tags: {
      ...TAGS_FILM,
      pays: CÔTE_D_IVOIRE,
      ville: ['Tiassalé'],
      theme: ['Fleuve'],
    },
  },
  {
    slug: 'les-iles-memoire',
    numero: '06',
    titre: 'Les Îles mémoire',
    lieu: 'Adiaké',
    pitch: 'Les îles Ehotilé, entre patrimoine et transmission.',
    image: `${import.meta.env.BASE_URL}images/episodes/adiake.jpg`,
    guide: `${import.meta.env.BASE_URL}guides/guide-adiake.pdf`,
    tags: {
      ...TAGS_FILM,
      pays: CÔTE_D_IVOIRE,
      ville: ['Adiaké'],
      theme: ['Îles', 'Patrimoine'],
    },
  },
]

export const TRAVEL_CITIES: TravelCity[] = [
  {
    nom: 'Abidjan',
    intention: 'Énergie, hospitalité et créativité ivoirienne.',
    image: `${import.meta.env.BASE_URL}images/voyage/abidjan.jpg`,
    tags: {
      ...TAGS_DESTINATION,
      pays: CÔTE_D_IVOIRE,
      ville: ['Abidjan'],
    },
  },
  {
    nom: 'Dakar',
    intention: 'Élégance, mémoire et identité sénégalaise.',
    image: `${import.meta.env.BASE_URL}images/voyage/dakar.jpg`,
    tags: {
      ...TAGS_DESTINATION,
      pays: ['Sénégal'],
      ville: ['Dakar'],
    },
  },
  {
    nom: 'Conakry',
    intention: 'Rythmes, paysages et générosité guinéenne.',
    image: `${import.meta.env.BASE_URL}images/voyage/conakry.jpg`,
    tags: {
      ...TAGS_DESTINATION,
      pays: ['Guinée'],
      ville: ['Conakry'],
    },
  },
]

export const TRAVEL_PARTNERS = ['Noom Hotels', 'Air Côte d’Ivoire']

export const TRAVEL_PROGRAMME = ['Hospitalité', 'Cuisine', 'Culture urbaine', 'Rencontres']

/**
 * Objets de la collection TRIBE.
 *
 * `tags` volontairement minimal : `format` et `projet` sont certains, `pays`, `ville`
 * et `theme` restent vides. Aucune source du dépôt n'indique le pays d'origine d'une
 * pièce, et `culture` mélange des peuples (Touareg, Akan, Dan, Igbo) et des symboles
 * (Lignes de vie, Arbre de vie, Unité) : en déduire un pays serait affirmer une
 * provenance non vérifiée. À renseigner avec les artisans concernés.
 */
export const BIJOUX: Bijou[] = [
  {
    slug: 'agadez',
    numero: '01',
    culture: 'Touareg',
    nom: 'Agadez',
    histoire: 'Les quatre directions du monde et le voyage guidé par l’étoile du Sud.',
    image: `${import.meta.env.BASE_URL}images/boutique/agadez.jpg`,
    tags: { ...TAGS_OBJET },
  },
  {
    slug: 'akuaba',
    numero: '02',
    culture: 'Akan',
    nom: 'Akuaba',
    histoire: 'La fertilité, la vie et la promesse d’une transmission qui continue.',
    image: `${import.meta.env.BASE_URL}images/boutique/akuaba.jpg`,
    tags: { ...TAGS_OBJET },
  },
  {
    slug: 'deangle',
    numero: '03',
    culture: 'Dan',
    nom: 'Déanglé',
    histoire: 'La beauté, la bienveillance et l’équilibre entre force et grâce.',
    image: `${import.meta.env.BASE_URL}images/boutique/deangle.jpg`,
    tags: { ...TAGS_OBJET },
  },
  {
    slug: 'oba',
    numero: '04',
    culture: 'Royaume du Bénin',
    nom: 'Oba',
    histoire: 'La continuité du pouvoir, la mémoire dynastique et la noblesse.',
    image: `${import.meta.env.BASE_URL}images/boutique/oba.jpg`,
    tags: { ...TAGS_OBJET },
  },
  {
    slug: 'baoule',
    numero: '05',
    culture: 'Côte d’Ivoire',
    nom: 'Baoulé',
    histoire: 'Le raffinement, la dignité et l’équilibre des formes de cour.',
    image: `${import.meta.env.BASE_URL}images/boutique/baoule.jpg`,
    tags: { ...TAGS_OBJET },
  },
  {
    slug: 'nka',
    numero: '06',
    culture: 'Lignes de vie',
    nom: 'NKA',
    histoire: 'Les chemins, les rencontres et les architectures qui nous structurent.',
    image: `${import.meta.env.BASE_URL}images/boutique/nka.jpg`,
    tags: { ...TAGS_OBJET },
  },
  {
    slug: 'baobabe',
    numero: '07',
    culture: 'Arbre de vie',
    nom: 'Baobabé',
    histoire: 'L’enracinement, la sagesse, la protection et la renaissance.',
    image: `${import.meta.env.BASE_URL}images/boutique/baobabe.jpg`,
    tags: { ...TAGS_OBJET },
  },
  {
    slug: 'mambo',
    numero: '08',
    culture: 'Éléphant royal',
    nom: 'Mambo',
    histoire: 'La force tranquille, la mémoire et la grandeur intérieure.',
    image: `${import.meta.env.BASE_URL}images/boutique/mambo.jpg`,
    tags: { ...TAGS_OBJET },
  },
  {
    slug: 'okoro',
    numero: '09',
    culture: 'Igbo',
    nom: 'Okoro',
    histoire: 'La noblesse intérieure, la discipline et la force qui ne s’affiche pas.',
    image: `${import.meta.env.BASE_URL}images/boutique/okoro.jpg`,
    tags: { ...TAGS_OBJET },
  },
  {
    slug: 'kowe',
    numero: '10',
    culture: 'Unité',
    nom: 'Kôwê',
    histoire: 'Le tissage des forces, la cohésion et la résistance collective.',
    image: `${import.meta.env.BASE_URL}images/boutique/kowe.jpg`,
    tags: { ...TAGS_OBJET },
  },
]

/**
 * Pour un article, le thème **est** la catégorie déjà présente : dérivée du contenu,
 * pas inventée. `categorie` reste le libellé d'affichage, `tags.theme` la clé de
 * filtre normalisée. Les deux coïncident aujourd'hui, mais seul le second est
 * consommé par la recherche et les filtres.
 */
function tagsArticle(categorie: string): Tags {
  return { ...TAGS_ARTICLE, theme: [categorie] }
}

export const ARTICLES: Article[] = [
  {
    slug: 'afrique-multitude-de-mondes',
    categorie: 'Carnets de route',
    titre: 'L’Afrique n’est pas une destination. C’est une multitude de mondes.',
    extrait:
      'Voyager sur le continent, c’est apprendre à regarder les nuances, les silences et les gestes qui échappent aux cartes postales.',
    statut: 'à venir',
    image: `${import.meta.env.BASE_URL}images/journal/afrique-multitude-de-mondes.jpg`,
    tags: tagsArticle('Carnet de route'),
  },
  {
    slug: 'citoyens-premiers-ambassadeurs',
    categorie: 'Opinion',
    titre: 'Et si les citoyens devenaient les premiers ambassadeurs de leur pays ?',
    extrait:
      'Une destination ne se résume pas à une campagne : elle se construit dans les récits quotidiens de ceux qui l’habitent.',
    statut: 'à venir',
    image: `${import.meta.env.BASE_URL}images/journal/citoyens-premiers-ambassadeurs.jpg`,
    tags: tagsArticle('Nation branding'),
  },
  {
    slug: 'griot-moderne',
    categorie: 'Histoire',
    titre: 'Le griot moderne ne remplace pas la mémoire. Il lui donne un nouvel écran.',
    extrait:
      'Comment les outils numériques peuvent transmettre les histoires sans les vider de leur sens.',
    statut: 'à venir',
    image: `${import.meta.env.BASE_URL}images/journal/griot-moderne.jpg`,
    tags: tagsArticle('Culture'),
  },
  {
    slug: 'voyager-change-le-regard',
    categorie: 'Tourisme',
    titre: 'Pourquoi voyager en Afrique change notre regard sur nous-mêmes',
    extrait:
      'Après plus de trente pays, une conviction : le voyage continental est aussi un acte de connaissance de soi.',
    statut: 'à venir',
    image: `${import.meta.env.BASE_URL}images/journal/voyager-change-le-regard.jpg`,
    tags: tagsArticle('Tourisme'),
  },
  {
    slug: 'porter-un-symbole',
    categorie: 'Patrimoine',
    titre: 'Porter un symbole, c’est porter une histoire',
    extrait:
      'Du masque Dan à la croix d’Agadez, les objets sont des archives vivantes qui relient les générations.',
    statut: 'à venir',
    image: `${import.meta.env.BASE_URL}images/journal/porter-un-symbole.jpg`,
    tags: tagsArticle('Patrimoine'),
  },
  {
    slug: 'hotel-premiere-ambassade',
    categorie: 'Hospitalité',
    titre: 'L’hôtel est parfois la première ambassade d’un pays',
    extrait:
      'Service, architecture, cuisine : chaque détail participe à l’image mentale d’une destination.',
    statut: 'à venir',
    image: `${import.meta.env.BASE_URL}images/journal/hotel-premiere-ambassade.jpg`,
    tags: tagsArticle('Hospitalité'),
  },
  {
    slug: 'raconter-pour-exister',
    categorie: 'Portraits',
    titre: 'Raconter pour exister',
    extrait:
      'Créer nos propres images n’est pas un luxe : c’est une condition pour reprendre la maîtrise du récit africain.',
    statut: 'à venir',
    image: `${import.meta.env.BASE_URL}images/journal/raconter-pour-exister.jpg`,
    tags: tagsArticle('Création'),
  },
]

export const PRESS: PressItem[] = [
  {
    source: 'TV5MONDE',
    date: '2024',
    titre: 'Prince Edja fait découvrir l’Afrique autrement',
    resume:
      'Portrait vidéo du voyageur-influenceur et de sa manière de révéler les destinations du continent.',
    url: 'https://information.tv5monde.com/afrique/video/prince-edja-fait-decouvrir-lafrique-autrement-2761333',
  },
  {
    source: 'Fraternité Matin',
    date: '01 août 2025',
    titre: 'Aboudia et Franck Prince Edja désignés ambassadeurs',
    resume:
      'La presse nationale revient sur sa nomination officielle comme Ambassadeur du Tourisme et des Loisirs.',
    url: 'https://www.fratmat.info/article/2635778/culture/tourisme-et-des-loisirs-aboudia-et-franck-prince-edja-designes-ambassadeurs',
  },
  {
    source: 'Ministère du Tourisme',
    date: '31 juillet 2025',
    titre: 'Prince Edja rejoint le cercle des Ambassadeurs',
    resume:
      'La reconnaissance institutionnelle s’inscrit dans la stratégie Sublime Côte d’Ivoire.',
    url: 'https://tourisme.gouv.ci/accueil/actualites/aboudia-et-prince-edja-rejoignent-le-cercle-prestigieux-des-ambassadeurs-du-tourisme-et-des-loisirs-de-cote-divoire/228',
  },
  {
    source: 'Afrique Magazine',
    date: '30 juin 2023',
    titre: 'Génération influenceurs',
    resume:
      'Prince Edja est présenté comme un guide authentique qui sillonne l’Afrique et en révèle les pépites cachées.',
    url: 'https://afriquemagazine.com/generation-influenceurs',
  },
  {
    source: 'L’Avenir',
    date: '02 août 2025',
    titre: 'Prince Franck Edja élevé au rang d’ambassadeur',
    resume:
      'Un portrait de son parcours, de ses collaborations et de sa volonté de redéfinir les codes du tourisme africain.',
    url: 'https://www.lavenir.ci/people/11301-le-createur-de-contenus-prince-franck-edja-eleve-au-rang-dambassadeur-du-tourisme-et-des-loisirs',
  },
  {
    source: 'Senego',
    date: '01 juillet 2025',
    titre: 'Abidjan, Dakar, Conakry : Taste & Travel',
    resume:
      'Le programme met le tourisme au service de la valorisation économique, culturelle et gastronomique du continent.',
    url: 'https://senego.com/abidjan-dakar-conakry-une-immersion-entre-luxe-culture-et-influence-africaine_1853703.html',
  },
]

/** Les huit catégories du journal, imposées par le CDC. */
export const CATEGORIES_JOURNAL = [
  'Voyage',
  'Histoire',
  'Patrimoine',
  'Tourisme',
  'Hospitalité',
  'Opinion',
  'Portraits',
  'Carnets de route',
] as const

export const MILESTONES: Milestone[] = [
  {
    periode: '2015 à 2019',
    titre: 'Azalaï Hotels',
    description: 'Marketing, communication et développement commercial hôtelier en Afrique de l’Ouest.',
  },
  {
    periode: '2024',
    titre: 'AIP Awards',
    description: 'Meilleur créateur de contenu web professionnel de Côte d’Ivoire.',
  },
  {
    periode: '2025',
    titre: 'Ambassadeur',
    description: 'Ambassadeur officiel du Tourisme et des Loisirs de Côte d’Ivoire.',
  },
  {
    periode: '2025',
    titre: 'Chevalier',
    description: 'Chevalier de l’Ordre du Mérite du Tourisme.',
  },
  {
    periode: '2026',
    titre: 'MASA',
    description: 'Ambassadeur du MASA et parrain des jeunes créateurs africains.',
  },
]

export const CONTACT_MOTIFS: ContactMotif[] = [
  {
    numero: '01',
    titre: 'Partenariats',
    description: 'Associer une marque à X’PLORE, Taste & Travel ou à une création originale.',
  },
  {
    numero: '02',
    titre: 'Médias',
    description: 'Interview, portrait, plateau, accréditation et demande d’images.',
  },
  {
    numero: '03',
    titre: 'Événements',
    description: 'Projection, conférence, masterclass ou prise de parole.',
  },
]
