import type { FieldErrors, FieldValues, Path, UseFormSetError } from 'react-hook-form'
import { erreursDeChamp, estErreurApi, manquantsDe } from '@/api/erreurs'

/**
 * Formulaires (section 10) : les erreurs du serveur sont rattachées au champ qu'elles visent,
 * et toutes les erreurs alimentent le résumé en tête de formulaire.
 *
 * Convention : le `name` d'un champ React Hook Form est le chemin du contrat
 * (`traductions.fr.titre`), et son `id` est ce même chemin. Le serveur et le formulaire
 * parlent donc des mêmes champs.
 */
export interface ErreurListee {
  champ: string
  message: string
}

/** Aplatit les erreurs imbriquées de React Hook Form, dans l'ordre du formulaire. */
export function listerErreurs(erreurs: FieldErrors, prefixe = ''): ErreurListee[] {
  const resultat: ErreurListee[] = []
  for (const [cle, valeur] of Object.entries(erreurs)) {
    if (!valeur || typeof valeur !== 'object') continue
    const chemin = prefixe ? `${prefixe}.${cle}` : cle
    const message = (valeur as { message?: unknown }).message
    if (typeof message === 'string' && message) resultat.push({ champ: chemin, message })
    else resultat.push(...listerErreurs(valeur as FieldErrors, chemin))
  }
  return resultat
}

/**
 * Rattache un `422` au formulaire : erreurs de champ (`VALIDATION`), champs manquants
 * (`RG-03`) ou champ unique désigné par `champ` (RG-04, RG-06…). Renvoie les erreurs qui
 * ne visent aucun champ du formulaire, à afficher en bandeau.
 */
export function rattacherErreursServeur<T extends FieldValues>(
  erreur: unknown,
  setError: UseFormSetError<T>,
  champsConnus: readonly string[],
): ErreurListee[] {
  if (!estErreurApi(erreur) || erreur.status !== 422) return []
  const visees: ErreurListee[] =
    erreur.code === 'RG-03'
      ? manquantsDe(erreur).map((manquant) => ({
          champ: manquant.champ,
          message: manquant.message,
        }))
      : erreursDeChamp(erreur)
  const orphelines: ErreurListee[] = []
  for (const { champ, message } of visees) {
    if (champsConnus.includes(champ)) {
      setError(champ as Path<T>, { type: 'serveur', message })
    } else {
      orphelines.push({ champ, message })
    }
  }
  if (visees.length === 0) orphelines.push({ champ: '', message: erreur.message })
  return orphelines
}
