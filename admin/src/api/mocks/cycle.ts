import type { Compte, StatutContenu } from '@/api/schemas/communs'
import { demandeTransitionSchema } from '@/api/schemas/communs'
import { peut, type RessourceContenu } from '@/auth/permissions'
import { versionPerimee } from '@/api/mocks/garde'
import { horodatage, journaliser, maintenant, ouvrirPublication } from '@/api/mocks/magasin'
import { TRANSITIONS, transitionsDepuis, type Manquant } from '@/api/mocks/regles'
import { erreur, json, lireCorps } from '@/api/mocks/reponses'

/**
 * Cycle de vie simulé (`docs/CONTRAT-API.md` § 7.3), commun aux ressources livrées après les
 * articles : diagramme, droits, motif de refus, programmation, exigences, reconstruction.
 * Chaque ressource fournit ses exigences et ses règles propres (RG-20, RG-21…).
 */
export interface ObjetCycle {
  id: string
  statut: StatutContenu
  version: number
  publieLe: string | null
  modifieLe: string
  dernierMotifRefus: string | null
}

export function refusPublication(liste: Manquant[]): Response {
  return erreur(422, 'RG-03', 'Des éléments manquent pour publier.', {
    ...(liste[0] ? { champ: liste[0].champ } : {}),
    details: { manquants: liste },
  })
}

export function transitionInterdite(depuis: StatutContenu, message: string): Response {
  return erreur(422, 'TRANSITION_INTERDITE', message, {
    details: { depuis, vers: null, autorisees: transitionsDepuis(depuis) },
  })
}

/** Un contenu archivé se désarchive avant toute modification (§ 7.4). */
export function refusArchive(objet: ObjetCycle): Response | null {
  return objet.statut === 'archive'
    ? transitionInterdite('archive', 'Désarchivez ce contenu avant de le modifier.')
    : null
}

/** Seul un brouillon ou un contenu archivé se supprime (§ 7.4). */
export function refusSuppression(objet: ObjetCycle): Response | null {
  return objet.statut === 'brouillon' || objet.statut === 'archive'
    ? null
    : transitionInterdite(objet.statut, 'Seul un brouillon ou un contenu archivé se supprime.')
}

export async function transitionSimulee<O extends ObjetCycle>({
  requete,
  compte,
  ressource,
  objet,
  titre,
  manques,
  controler,
  apres,
  lecture,
}: {
  requete: Request
  compte: Compte
  ressource: RessourceContenu
  objet: O
  titre: () => string
  /** Exigences de publication (RG-03) ; un refus propre à la ressource passe par `controler`. */
  manques: () => Manquant[]
  /** Règle propre à la ressource avant d'écrire (RG-20, RG-21, vente en ligne…). */
  controler?: (vers: StatutContenu) => Response | null
  /** Effet propre après l'écriture (adresse figée d'un créateur…). */
  apres?: (vers: StatutContenu) => void
  lecture: (objet: O) => unknown
}): Promise<Response> {
  const corps = await lireCorps(requete, demandeTransitionSchema)
  if (!corps.ok) return corps.reponse
  const { vers, version, motif, programmeLe } = corps.valeur
  const perimee = versionPerimee(version, objet.version)
  if (perimee) return perimee

  const depuis = objet.statut
  const regle = TRANSITIONS[depuis][vers]
  if (!regle) {
    return erreur(
      422,
      'TRANSITION_INTERDITE',
      `Passage de « ${depuis} » à « ${vers} » impossible.`,
      {
        details: { depuis, vers, autorisees: transitionsDepuis(depuis) },
      },
    )
  }
  if (regle === 'admin' && !peut(compte, 'publier', ressource)) {
    return erreur(403, 'RG-02', 'Seul un administrateur publie, refuse, dépublie ou archive.')
  }
  if (regle === 'tous' && !peut(compte, 'soumettre', ressource, { statut: depuis })) {
    return erreur(403, 'DROIT_INSUFFISANT', 'Votre rôle ne permet pas cette action.')
  }
  const refus = depuis === 'en_relecture' && vers === 'brouillon'
  if (refus && !motif) {
    return erreur(422, 'VALIDATION', 'Un refus exige un motif.', { champ: 'motif' })
  }
  if (programmeLe !== undefined && (vers !== 'publie' || Date.parse(programmeLe) <= maintenant())) {
    return erreur(
      422,
      'VALIDATION',
      'Une programmation exige une date future et une publication.',
      {
        champ: 'programmeLe',
      },
    )
  }
  const propre = controler?.(vers)
  if (propre) return propre
  if (vers === 'en_relecture' || vers === 'publie') {
    const liste = manques()
    if (liste.length) return refusPublication(liste)
  }

  const avant = structuredClone(objet)
  objet.statut = vers
  objet.version += 1
  objet.modifieLe = horodatage()
  if (refus) objet.dernierMotifRefus = motif ?? null
  if (vers === 'publie') objet.publieLe = programmeLe ?? horodatage()
  if (depuis === 'publie' && vers !== 'archive') objet.publieLe = null
  apres?.(vers)
  journaliser(compte, `transition:${vers}`, ressource, objet.id, avant, lecture(objet))

  // RG-19 : publication immédiate, dépublication ou archivage reconstruisent le site.
  const reconstruit = (vers === 'publie' && !programmeLe) || depuis === 'publie'
  const publicationId = reconstruit
    ? ouvrirPublication(compte, vers === 'publie' ? 'publication' : 'depublication', {
        ressource,
        id: objet.id,
        titre: titre(),
      })
    : null
  return json({ contenu: lecture(objet), publicationId })
}
