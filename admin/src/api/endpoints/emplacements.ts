import { requete } from '@/api/client'
import {
  changementEmplacementSchema,
  emplacementPhotoSchema,
  listeEmplacementsSchema,
  type EmplacementPhoto,
} from '@/api/schemas/emplacements'

/**
 * Photos fixes du site (`/emplacements-photos`, PROMPT-CORRECTION § 7.3 ; contrat 1.5.0 proposé).
 * Servies par le faux serveur tant que le back end ne les a pas livrées (étape C6 du back end).
 */
export const emplacementsPhotos = {
  lister(signal?: AbortSignal): Promise<{ items: EmplacementPhoto[] }> {
    return requete('/emplacements-photos', {
      schema: listeEmplacementsSchema,
      ...(signal ? { signal } : {}),
    })
  },
  changer(cle: string, mediaId: string | null): Promise<EmplacementPhoto> {
    return requete(`/emplacements-photos/${encodeURIComponent(cle)}`, {
      methode: 'PUT',
      corps: changementEmplacementSchema.parse({ mediaId }),
      schema: emplacementPhotoSchema,
    })
  },
}
