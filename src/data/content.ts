import type {
  Article,
  Bijou,
  ContactMotif,
  Episode,
  Milestone,
  PressItem,
  TravelCity,
  Univers,
} from '@/types'

export const UNIVERS: Univers[] = [
  {
    numero: '01',
    nom: 'OHENE Tour',
    pitch: 'Circuits culturels, gastronomiques et nature en Côte d’Ivoire et en Afrique.',
    to: '/contact',
  },
  {
    numero: '02',
    nom: 'OHENE Prod',
    pitch: 'Films et documentaires : Taste & Travel, X’PLORE, Archive d’Afrique, Les Nuances du Zaouli.',
    to: '/xplore',
  },
  {
    numero: '03',
    nom: 'Conseil',
    pitch: 'Marketing touristique, nation branding, écotourisme et stratégie de destination.',
    to: '/contact',
  },
  {
    numero: '04',
    nom: 'Transmission',
    pitch: 'Conférences, masterclass, mentorat et accompagnement des jeunes créateurs.',
    to: '/contact',
  },
]

export const EPISODES: Episode[] = [
  {
    slug: 'le-dernier',
    numero: '01',
    titre: 'Le Dernier',
    lieu: 'Bouaké',
    pitch: 'Le dernier rhinocéros blanc d’Afrique de l’Ouest.',
    image: '/images/episodes/bouake.jpg',
  },
  {
    slug: 'la-cote-vive',
    numero: '02',
    titre: 'La Côte vive',
    lieu: 'Sassandra',
    pitch: 'L’écologie de luxe et la mémoire du littoral.',
    image: '/images/episodes/sassandra.jpg',
    guide: '/guides/guide-sassandra.pdf',
  },
  {
    slug: 'entre-deux-eaux',
    numero: '03',
    titre: 'Entre deux eaux',
    lieu: 'Jacqueville',
    pitch: 'Le lagon, l’océan et les hommes de la pêche.',
    image: '/images/episodes/jacqueville.jpg',
    guide: '/guides/guide-jacqueville.pdf',
  },
  {
    slug: 'la-foret-debout',
    numero: '04',
    titre: 'La Forêt debout',
    lieu: 'Taï',
    pitch: 'La dernière grande forêt primaire et ses chimpanzés.',
    image: '/images/episodes/tai.jpg',
    guide: '/guides/guide-tai.pdf',
  },
  {
    slug: 'le-fleuve',
    numero: '05',
    titre: 'Le Fleuve',
    lieu: 'Tiassalé',
    pitch: 'Le Bandama, ses rives et ses histoires.',
    image: '/images/episodes/tiassale.jpg',
    guide: '/guides/guide-tiassale.pdf',
  },
  {
    slug: 'les-iles-memoire',
    numero: '06',
    titre: 'Les Îles mémoire',
    lieu: 'Adiaké',
    pitch: 'Les îles Ehotilé, entre patrimoine et transmission.',
    image: '/images/episodes/adiake.jpg',
    guide: '/guides/guide-adiake.pdf',
  },
]

export const TRAVEL_CITIES: TravelCity[] = [
  {
    nom: 'Abidjan',
    intention: 'Énergie, hospitalité et créativité ivoirienne.',
    image: '/images/voyage/abidjan.jpg',
  },
  {
    nom: 'Dakar',
    intention: 'Élégance, mémoire et identité sénégalaise.',
    image: '/images/voyage/dakar.jpg',
  },
  {
    nom: 'Conakry',
    intention: 'Rythmes, paysages et générosité guinéenne.',
    image: '/images/voyage/conakry.jpg',
  },
]

export const TRAVEL_PARTNERS = ['Noom Hotels', 'Air Côte d’Ivoire']

export const TRAVEL_PROGRAMME = ['Hospitalité', 'Cuisine', 'Culture urbaine', 'Rencontres']

export const BIJOUX: Bijou[] = [
  {
    slug: 'agadez',
    numero: '01',
    culture: 'Touareg',
    nom: 'Agadez',
    histoire: 'Les quatre directions du monde et le voyage guidé par l’étoile du Sud.',
    image: '/images/boutique/agadez.jpg',
  },
  {
    slug: 'akuaba',
    numero: '02',
    culture: 'Akan',
    nom: 'Akuaba',
    histoire: 'La fertilité, la vie et la promesse d’une transmission qui continue.',
    image: '/images/boutique/akuaba.jpg',
  },
  {
    slug: 'deangle',
    numero: '03',
    culture: 'Dan',
    nom: 'Déanglé',
    histoire: 'La beauté, la bienveillance et l’équilibre entre force et grâce.',
    image: '/images/boutique/deangle.jpg',
  },
  {
    slug: 'oba',
    numero: '04',
    culture: 'Royaume du Bénin',
    nom: 'Oba',
    histoire: 'La continuité du pouvoir, la mémoire dynastique et la noblesse.',
    image: '/images/boutique/oba.jpg',
  },
  {
    slug: 'baoule',
    numero: '05',
    culture: 'Côte d’Ivoire',
    nom: 'Baoulé',
    histoire: 'Le raffinement, la dignité et l’équilibre des formes de cour.',
    image: '/images/boutique/baoule.jpg',
  },
  {
    slug: 'nka',
    numero: '06',
    culture: 'Lignes de vie',
    nom: 'NKA',
    histoire: 'Les chemins, les rencontres et les architectures qui nous structurent.',
    image: '/images/boutique/nka.jpg',
  },
  {
    slug: 'baobabe',
    numero: '07',
    culture: 'Arbre de vie',
    nom: 'Baobabé',
    histoire: 'L’enracinement, la sagesse, la protection et la renaissance.',
    image: '/images/boutique/baobabe.jpg',
  },
  {
    slug: 'mambo',
    numero: '08',
    culture: 'Éléphant royal',
    nom: 'Mambo',
    histoire: 'La force tranquille, la mémoire et la grandeur intérieure.',
    image: '/images/boutique/mambo.jpg',
  },
  {
    slug: 'okoro',
    numero: '09',
    culture: 'Igbo',
    nom: 'Okoro',
    histoire: 'La noblesse intérieure, la discipline et la force qui ne s’affiche pas.',
    image: '/images/boutique/okoro.jpg',
  },
  {
    slug: 'kowe',
    numero: '10',
    culture: 'Unité',
    nom: 'Kôwê',
    histoire: 'Le tissage des forces, la cohésion et la résistance collective.',
    image: '/images/boutique/kowe.jpg',
  },
]

export const ARTICLES: Article[] = [
  {
    slug: 'afrique-multitude-de-mondes',
    categorie: 'Carnet de route',
    titre: 'L’Afrique n’est pas une destination. C’est une multitude de mondes.',
    extrait:
      'Voyager sur le continent, c’est apprendre à regarder les nuances, les silences et les gestes qui échappent aux cartes postales.',
    statut: 'à venir',
    image: '/images/journal/afrique-multitude-de-mondes.jpg',
  },
  {
    slug: 'citoyens-premiers-ambassadeurs',
    categorie: 'Nation branding',
    titre: 'Et si les citoyens devenaient les premiers ambassadeurs de leur pays ?',
    extrait:
      'Une destination ne se résume pas à une campagne : elle se construit dans les récits quotidiens de ceux qui l’habitent.',
    statut: 'à venir',
    image: '/images/journal/citoyens-premiers-ambassadeurs.jpg',
  },
  {
    slug: 'griot-moderne',
    categorie: 'Culture',
    titre: 'Le griot moderne ne remplace pas la mémoire. Il lui donne un nouvel écran.',
    extrait:
      'Comment les outils numériques peuvent transmettre les histoires sans les vider de leur sens.',
    statut: 'à venir',
    image: '/images/journal/griot-moderne.jpg',
  },
  {
    slug: 'voyager-change-le-regard',
    categorie: 'Tourisme',
    titre: 'Pourquoi voyager en Afrique change notre regard sur nous-mêmes',
    extrait:
      'Après plus de trente pays, une conviction : le voyage continental est aussi un acte de connaissance de soi.',
    statut: 'à venir',
    image: '/images/journal/voyager-change-le-regard.jpg',
  },
  {
    slug: 'porter-un-symbole',
    categorie: 'Patrimoine',
    titre: 'Porter un symbole, c’est porter une histoire',
    extrait:
      'Du masque Dan à la croix d’Agadez, les objets sont des archives vivantes qui relient les générations.',
    statut: 'à venir',
    image: '/images/journal/porter-un-symbole.jpg',
  },
  {
    slug: 'hotel-premiere-ambassade',
    categorie: 'Hospitalité',
    titre: 'L’hôtel est parfois la première ambassade d’un pays',
    extrait:
      'Service, architecture, cuisine : chaque détail participe à l’image mentale d’une destination.',
    statut: 'à venir',
    image: '/images/journal/hotel-premiere-ambassade.jpg',
  },
  {
    slug: 'raconter-pour-exister',
    categorie: 'Création',
    titre: 'Raconter pour exister',
    extrait:
      'Créer nos propres images n’est pas un luxe : c’est une condition pour reprendre la maîtrise du récit africain.',
    statut: 'à venir',
    image: '/images/journal/raconter-pour-exister.jpg',
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

export const MILESTONES: Milestone[] = [
  {
    periode: '2015 — 2019',
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
