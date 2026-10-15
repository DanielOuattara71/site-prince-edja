export type Article = {
  slug: string
  categorie: string
  titre: string
  extrait: string
  statut: 'publié' | 'à venir'
  image: string
  date?: string
}
export type Episode = {
  slug: string
  numero: string
  titre: string
  lieu: string
  pitch: string
  image: string
  guide?: string
}
const SEED_STATS: { value: number | null; suffix?: string; label: string; date?: string }[] = [
  { value: 600, suffix: 'K+', label: 'Communauté' },
  { value: 30, suffix: '+', label: 'Pays parcourus' },
  { value: 4, label: 'Distinctions' },
  { value: 11, suffix: ' ans', label: 'D’expérience' },
  { value: null, label: 'Portée' },
]

export type SiteInfo = {
  name: string
  role: string
  heroImage: string
  email: string
  localisation: string
  /** Chiffres clés du bloc « Preuves ». `null` = chiffre non fourni. */
  stats?: { value: number | null; suffix?: string; label: string; date?: string }[]
}
export type Distinction = {
  id: string
  annee: string
  titre: string
  delivreePar?: string
  description: string
  image: string
  url?: string
}

const SEED_ARTICLES: Article[] = [
  {
    slug: 'afrique-multitude-de-mondes',
    categorie: 'Carnet de route',
    titre: 'L’Afrique n’est pas une destination. C’est une multitude de mondes.',
    extrait: 'Voyager sur le continent, c’est apprendre à regarder les nuances.',
    statut: 'à venir',
    image: `${import.meta.env.BASE_URL}images/journal/afrique-multitude-de-mondes.jpg`,
  },
  {
    slug: 'citoyens-premiers-ambassadeurs',
    categorie: 'Nation branding',
    titre: 'Et si les citoyens devenaient les premiers ambassadeurs ?',
    extrait: 'Une destination ne se résume pas à une campagne.',
    statut: 'à venir',
    image: `${import.meta.env.BASE_URL}images/journal/citoyens-premiers-ambassadeurs.jpg`,
  },
  {
    slug: 'griot-moderne',
    categorie: 'Culture',
    titre: 'Le griot moderne ne remplace pas la mémoire.',
    extrait: 'Comment les outils numériques transmettent sans vider de sens.',
    statut: 'à venir',
    image: `${import.meta.env.BASE_URL}images/journal/griot-moderne.jpg`,
  },
]

const SEED_EPISODES: Episode[] = [
  {
    slug: 'le-dernier',
    numero: '01',
    titre: 'Le Dernier',
    lieu: 'Bouaké',
    pitch: 'Le dernier rhinocéros blanc.',
    image: `${import.meta.env.BASE_URL}images/episodes/bouake.jpg`,
  },
  {
    slug: 'la-foret-debout',
    numero: '04',
    titre: 'La Forêt debout',
    lieu: 'Taï',
    pitch: 'La dernière forêt primaire.',
    image: `${import.meta.env.BASE_URL}images/episodes/tai.jpg`,
  },
]

const SEED_DISTINCTIONS: Distinction[] = [
  {
    id: 'aip-2024',
    annee: '2024',
    titre: 'AIP Awards · Meilleur créateur web pro',
    delivreePar: 'AIP',
    description: 'Distinction nationale pour la qualité du récit digital.',
    image: `${import.meta.env.BASE_URL}images/placeholder-carre.svg`,
  },
  {
    id: 'ambassadeur-2025',
    annee: '2025',
    titre: 'Ambassadeur du Tourisme et des Loisirs',
    delivreePar: 'Ministère du Tourisme',
    description: 'Nomination officielle au cercle des Ambassadeurs, Sublime Côte d’Ivoire.',
    image: `${import.meta.env.BASE_URL}images/placeholder-foret.svg`,
  },
  {
    id: 'chevalier-2025',
    annee: '2025',
    titre: 'Chevalier de l’Ordre du Mérite',
    delivreePar: 'République de Côte d’Ivoire',
    description: 'Ordre du Mérite du Tourisme pour le service rendu à la nation.',
    image: `${import.meta.env.BASE_URL}images/placeholder-fleuve.svg`,
  },
  {
    id: 'masa-2026',
    annee: '2026',
    titre: 'MASA · Parrain des jeunes créateurs',
    delivreePar: 'MASA',
    description: 'Ambassadeur du Marché des Arts du Spectacle Africain.',
    image: `${import.meta.env.BASE_URL}images/placeholder-paysage.svg`,
  },
]

function load<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key)
    return v ? (JSON.parse(v) as T) : fallback
  } catch {
    return fallback
  }
}
function save(key: string, v: unknown): void {
  localStorage.setItem(key, JSON.stringify(v))
}

export function useAdminStore() {
  return {
    articles: {
      get: (): Article[] => load('pe_admin_articles', SEED_ARTICLES),
      set: (v: Article[]) => save('pe_admin_articles', v),
    },
    episodes: {
      get: (): Episode[] => load('pe_admin_episodes', SEED_EPISODES),
      set: (v: Episode[]) => save('pe_admin_episodes', v),
    },
    distinctions: {
      get: (): Distinction[] => load('pe_admin_distinctions', SEED_DISTINCTIONS),
      set: (v: Distinction[]) => save('pe_admin_distinctions', v),
    },
    site: {
      get: (): SiteInfo =>
        load('pe_admin_site', {
          name: 'Prince Edja',
          role: 'Entrepreneur et storyteller. Je révèle la Côte d’Ivoire au monde.',
          heroImage: `${import.meta.env.BASE_URL}images/hero/hero-prince-edja-2000.jpg`,
          email: 'contact@ohenetour.com',
          localisation: 'Abidjan · Côte d’Ivoire',
          stats: SEED_STATS,
        }),
      set: (v: SiteInfo) => save('pe_admin_site', v),
    },
  }
}

export function fileToDataUrl(file: File, maxSide = 1600, quality = 0.82): Promise<string> {
  // Pour grandes photos : redimensionne côté client pour ne pas exploser localStorage (~5MB)
  return new Promise((res, rej) => {
    const reader = new FileReader()
    reader.onload = () => {
      const src = reader.result as string
      // si déjà petit (<1.2MB) et pas image, renvoie direct
      if (file.size < 1_200_000 && !file.type.startsWith('image/')) {
        res(src)
        return
      }
      const img = new Image()
      img.onload = () => {
        const w = img.naturalWidth
        const h = img.naturalHeight
        const longest = Math.max(w, h)
        if (longest <= maxSide) {
          // compresse quand même en jpeg/webp si png volumineux
          if (file.size < 900_000) {
            res(src)
            return
          }
        }
        const scale = Math.min(1, maxSide / longest)
        const cw = Math.round(w * scale)
        const ch = Math.round(h * scale)
        const canvas = document.createElement('canvas')
        canvas.width = cw
        canvas.height = ch
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          res(src)
          return
        }
        ctx.drawImage(img, 0, 0, cw, ch)
        // préfère webp si supporté, sinon jpeg
        const mime = file.type === 'image/png' ? 'image/jpeg' : file.type || 'image/jpeg'
        try {
          const out = canvas.toDataURL(mime, quality)
          // si sortie plus lourde que entrée, garde entrée
          res(out.length < src.length ? out : src)
        } catch {
          res(src)
        }
      }
      img.onerror = () => res(src)
      img.src = src
    }
    reader.onerror = rej
    reader.readAsDataURL(file)
  })
}
