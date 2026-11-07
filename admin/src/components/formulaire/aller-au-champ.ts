import { montrerLangueDe } from '@/components/formulaire/langue-formulaire'

/**
 * Place le curseur sur un champ dont l'`id` est son chemin (`traductions.en.titre`, `imageId`).
 * Le champ peut être dans l'autre langue (U2) ou dans une section repliée (U3) : on affiche
 * d'abord la langue, puis on ouvre la section, puis on donne le focus.
 */
export function allerAuChamp(champ: string): void {
  montrerLangueDe(champ)
  window.setTimeout(() => {
    const cible = document.getElementById(champ) ?? document.getElementsByName(champ)[0]
    const repli = cible?.closest('details')
    if (repli && !repli.open) repli.open = true
    cible?.focus()
    cible?.scrollIntoView?.({ block: 'center' })
  }, 0)
}
