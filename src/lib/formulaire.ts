/**
 * Envoi d'un formulaire vers Web3Forms.
 *
 * Partagé par le formulaire de contact et le formulaire B2B : un seul endpoint, une
 * seule gestion d'erreur. Sans clé configurée, l'appel échoue proprement plutôt que de
 * laisser croire à un envoi.
 */
export async function envoyerFormulaire(formulaire: HTMLFormElement): Promise<boolean> {
  const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY as string | undefined
  if (!accessKey) return false

  try {
    const reponse = await fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      body: new FormData(formulaire),
    })
    const resultat = (await reponse.json()) as { success?: boolean }
    return Boolean(resultat.success)
  } catch {
    return false
  }
}
