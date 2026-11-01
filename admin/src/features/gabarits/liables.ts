import { requete } from '@/api/client'
import {
  pageSchema,
  resumeContenuSchema,
  type Page,
  type ParametresListe,
  type RessourceLiable,
  type ResumeContenu,
} from '@/api/schemas/communs'

/**
 * Lecture des contenus qu'un lien interne peut viser (`RessourceLiable`, § 6). Le résumé de liste
 * (§ 8) suffit : identifiant et titre. Une ressource pas encore servie répond `404`, et le
 * sélecteur reste vide.
 */
export function creerRessourceLiable(ressource: RessourceLiable) {
  return {
    lister(parametres: ParametresListe = {}): Promise<Page<ResumeContenu>> {
      return requete(`/${ressource}`, {
        query: { ...parametres },
        schema: pageSchema(resumeContenuSchema),
      })
    },
  }
}
