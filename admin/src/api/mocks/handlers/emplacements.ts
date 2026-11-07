import { http } from 'msw'
import { changementEmplacementSchema, type EmplacementPhoto } from '@/api/schemas/emplacements'
import type { EmplacementEssai } from '@/api/mocks/donnees'
import { autoriser } from '@/api/mocks/garde'
import { horodatage, journaliser, magasin, ouvrirPublication } from '@/api/mocks/magasin'
import { trouverMedia } from '@/api/mocks/regles'
import { API, erreur, json, lireCorps } from '@/api/mocks/reponses'

/**
 * Photos fixes simulées (PROMPT-CORRECTION § 7.3 ; contrat 1.5.0 proposé, § 22).
 * `PUT /:cle` : le média existe, c'est une image, il a un texte alternatif dans chaque langue
 * active (RG-08) ; l'écriture est journalisée et déclenche une mise à jour du site (RG-19).
 */
const RACINE = `${API}/emplacements-photos`

function lu(e: EmplacementEssai): EmplacementPhoto {
  const media = e.mediaId ? trouverMedia(e.mediaId) : undefined
  return {
    cle: e.cle,
    libelle: e.libelle,
    formatConseille: e.formatConseille,
    mediaId: e.mediaId,
    media: media
      ? { id: media.id, url: media.url, texteAlt: media.traductions.fr?.texteAlt ?? '' }
      : null,
    misAJourLe: e.misAJourLe,
  }
}

export const handlersEmplacements = [
  http.get(RACINE, ({ request }) => {
    const garde = autoriser(request, 'lire', 'emplacements-photos')
    if (!garde.ok) return garde.reponse
    return json({ items: magasin.emplacements.map(lu) })
  }),

  http.put(`${RACINE}/:cle`, async ({ request, params }) => {
    const e = magasin.emplacements.find((x) => x.cle === params['cle'])
    if (!e) return erreur(404, 'NON_TROUVE', 'Cet emplacement n’existe pas.')
    const garde = autoriser(request, 'modifier', 'emplacements-photos')
    if (!garde.ok) return garde.reponse
    const corps = await lireCorps(request, changementEmplacementSchema)
    if (!corps.ok) return corps.reponse
    const { mediaId } = corps.valeur
    if (mediaId) {
      const media = trouverMedia(mediaId)
      if (!media) return erreur(422, 'VALIDATION', 'Ce média n’existe pas.', { champ: 'mediaId' })
      if (!media.mime.startsWith('image/'))
        return erreur(422, 'VALIDATION', 'Une photo fixe doit être une image.', {
          champ: 'mediaId',
        })
      const sansAlt = magasin.languesActives.filter(
        (l) => !media.decoratif && !media.traductions[l]?.texteAlt.trim(),
      )
      if (sansAlt.length > 0)
        return erreur(
          422,
          'RG-08',
          'Cette image n’a pas de texte alternatif dans chaque langue active : complétez-le d’abord.',
          { champ: 'mediaId' },
        )
    }
    const avant = lu(e)
    e.mediaId = mediaId
    e.misAJourLe = horodatage()
    journaliser(garde.compte, 'modification', 'emplacements-photos', null, avant, lu(e))
    ouvrirPublication(garde.compte, 'publication', null)
    return json(lu(e))
  }),
]
