import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DICTIONNAIRE } from './dictionnaire'
import { LangueContexte } from './contexteLangue'
import type { ContexteLangue } from './contexteLangue'
import type { Langue } from './dictionnaire'

const CLE = 'pe:langue'

function langueInitiale(): Langue {
  if (typeof window === 'undefined') return 'fr'
  try {
    const stockee = window.localStorage.getItem(CLE)
    if (stockee === 'fr' || stockee === 'en') return stockee
  } catch {
    /* stockage indisponible : on reste sur le français */
  }
  return 'fr'
}

export function FournisseurLangue({ children }: { children: ReactNode }) {
  const [langue, setLangue] = useState<Langue>(langueInitiale)

  // L'attribut lang du document doit dire la vérité : c'est lui qui choisit la voix
  // de synthèse et les règles de césure. Un sélecteur qui ne toucherait que le texte
  // laisserait un `<html lang="fr">` mentant sur du contenu anglais.
  useEffect(() => {
    document.documentElement.lang = langue
    document.documentElement.dir = 'ltr'
  }, [langue])

  const definirLangue = useCallback((suivante: Langue) => {
    setLangue(suivante)
    try {
      window.localStorage.setItem(CLE, suivante)
    } catch {
      /* le choix ne survivra pas à la session ; la bascule reste immédiate */
    }
  }, [])

  const valeur = useMemo<ContexteLangue>(
    () => ({
      langue,
      definirLangue,
      t: (cle) => DICTIONNAIRE[langue][cle],
      l: (libelle) => libelle[langue],
      afficherLangue: (nom) => `${DICTIONNAIRE[langue]['langue.changerPrefixe']} ${nom}`,
    }),
    [langue, definirLangue],
  )

  return <LangueContexte.Provider value={valeur}>{children}</LangueContexte.Provider>
}
