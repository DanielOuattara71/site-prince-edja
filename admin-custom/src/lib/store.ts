export type Article = { slug: string; categorie: string; titre: string; extrait: string; statut: 'publié' | 'à venir'; image: string; date?: string }
export type Episode = { slug: string; numero: string; titre: string; lieu: string; pitch: string; image: string; guide?: string }
export type SiteInfo = { name: string; role: string; heroImage: string; email: string; localisation: string }

const SEED_ARTICLES: Article[] = [
  { slug: 'afrique-multitude-de-mondes', categorie: 'Carnet de route', titre: 'L’Afrique n’est pas une destination. C’est une multitude de mondes.', extrait: 'Voyager sur le continent, c’est apprendre à regarder les nuances.', statut: 'à venir', image: '/images/journal/afrique-multitude-de-mondes.png' },
  { slug: 'citoyens-premiers-ambassadeurs', categorie: 'Nation branding', titre: 'Et si les citoyens devenaient les premiers ambassadeurs ?', extrait: 'Une destination ne se résume pas à une campagne.', statut: 'à venir', image: '/images/journal/citoyens-premiers-ambassadeurs.png' },
  { slug: 'griot-moderne', categorie: 'Culture', titre: 'Le griot moderne ne remplace pas la mémoire.', extrait: 'Comment les outils numériques transmettent sans vider de sens.', statut: 'à venir', image: '/images/journal/griot-moderne.png' },
]
const SEED_EPISODES: Episode[] = [
  { slug: 'le-dernier', numero: '01', titre: 'Le Dernier', lieu: 'Bouaké', pitch: 'Le dernier rhinocéros blanc.', image: '/images/episodes/bouake.png' },
  { slug: 'la-foret-debout', numero: '04', titre: 'La Forêt debout', lieu: 'Taï', pitch: 'La dernière forêt primaire.', image: '/images/episodes/tai.png' },
]

function load<T>(key: string, fallback: T): T {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) as T : fallback } catch { return fallback }
}
function save(key: string, v: unknown) { localStorage.setItem(key, JSON.stringify(v)) }

export function useStore() {
  return {
    articles: {
      get: (): Article[] => load('pe_admin_articles', SEED_ARTICLES),
      set: (v: Article[]) => save('pe_admin_articles', v),
    },
    episodes: {
      get: (): Episode[] => load('pe_admin_episodes', SEED_EPISODES),
      set: (v: Episode[]) => save('pe_admin_episodes', v),
    },
    site: {
      get: (): SiteInfo => load('pe_admin_site', { name: 'Prince Edja', role: 'Entrepreneur, storyteller — je révèle la Côte d’Ivoire au monde.', heroImage: '/images/hero/hero-prince-edja.png', email: 'contact@ohenetour.com', localisation: 'Abidjan · Côte d’Ivoire' }),
      set: (v: SiteInfo) => save('pe_admin_site', v),
    }
  }
}

export function fileToDataUrl(file: File): Promise<string> {
  return new Promise((res, rej) => { const r = new FileReader(); r.onload = () => res(r.result as string); r.onerror = rej; r.readAsDataURL(file) })
}
