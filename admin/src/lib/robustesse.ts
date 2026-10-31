/**
 * Jauge de robustesse d'un mot de passe (RG-18, section 11 du prompt admin).
 *
 * Une aide à la saisie : le serveur refuse lui-même les mots de passe trop courts ou trop
 * courants (PB:554). La note favorise la longueur, plus sûre que les règles de composition.
 */
export type NiveauRobustesse = 0 | 1 | 2 | 3 | 4

export function noterMotDePasse(motDePasse: string): NiveauRobustesse {
  if (motDePasse.length === 0) return 0
  if (motDePasse.length < 12) return 1

  const familles = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((motif) =>
    motif.test(motDePasse),
  ).length
  const repetitif =
    /^(.)\1+$/.test(motDePasse) ||
    /^(?:0123|1234|abcd|azerty|qwerty|motdepasse|password)/i.test(motDePasse)
  if (repetitif) return 1

  if (motDePasse.length >= 20 || (motDePasse.length >= 16 && familles >= 3)) return 4
  if (motDePasse.length >= 16 || familles >= 3) return 3
  return 2
}
