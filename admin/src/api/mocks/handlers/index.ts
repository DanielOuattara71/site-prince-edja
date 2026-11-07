import { delay, http } from 'msw'
import { magasin } from '@/api/mocks/magasin'
import { API, erreur } from '@/api/mocks/reponses'
import { handlersArticles } from '@/api/mocks/handlers/articles'
import { handlersAuth } from '@/api/mocks/handlers/auth'
import { handlersAudience } from '@/api/mocks/handlers/audience'
import { handlersComptes } from '@/api/mocks/handlers/comptes'
import { handlersBijoux } from '@/api/mocks/handlers/bijoux'
import { handlersCategories } from '@/api/mocks/handlers/categories'
import { handlersEditorial } from '@/api/mocks/handlers/editorial'
import { handlersEditorialLot3 } from '@/api/mocks/handlers/editorial-lot3'
import { handlersEditorialLot4 } from '@/api/mocks/handlers/editorial-lot4'
import { handlersLivres } from '@/api/mocks/handlers/livres'
import { handlersEmplacements } from '@/api/mocks/handlers/emplacements'
import { handlersReglages } from '@/api/mocks/handlers/reglages'
import { handlersCreateurs } from '@/api/mocks/handlers/createurs'
import { handlersMedias } from '@/api/mocks/handlers/medias'
import { handlersSite } from '@/api/mocks/handlers/site'
import { handlersTags } from '@/api/mocks/handlers/tags'
import { handlersVersions } from '@/api/mocks/handlers/versions'

/**
 * Tous les gestionnaires du faux serveur. Le premier ne répond pas : il simule la latence
 * (200 à 600 ms en développement) et, si on l'a demandé, des pannes aléatoires
 * (section 7 du prompt admin), puis laisse passer la requête au gestionnaire suivant.
 */
const conditionsReseau = http.all(`${API}/*`, async () => {
  if (magasin.latence) {
    const [min, max] = magasin.latence
    await delay(min + Math.random() * (max - min))
  }
  if (magasin.tauxEchec > 0 && Math.random() < magasin.tauxEchec) {
    return erreur(500, 'ERREUR_INTERNE', 'Panne simulée par le faux serveur.')
  }
  return undefined
})

export const handlers = [
  conditionsReseau,
  ...handlersAuth,
  ...handlersArticles,
  ...handlersAudience,
  ...handlersComptes,
  ...handlersMedias,
  ...handlersTags,
  ...handlersSite,
  ...handlersVersions,
  ...handlersCreateurs,
  ...handlersCategories,
  ...handlersBijoux,
  ...handlersEditorial,
  ...handlersEditorialLot3,
  ...handlersEditorialLot4,
  ...handlersLivres,
  ...handlersEmplacements,
  ...handlersReglages,
]
