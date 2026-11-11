import { useEffect, useState } from 'react'

const TIME_ZONE = 'Africa/Abidjan'

function formatNow(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

export function useLocalTime(): string {
  // Serveur et premier rendu client identiques (le serveur ne sait pas l'heure exacte de
  // l'utilisateur) : le temps n'est affiché qu'après le montage — même rendu, même hydratation.
  const [time, setTime] = useState('--:--')

  useEffect(() => {
    // Première heure réelle affichée dès la première frame (aucune mise à jour d'état
    // synchrone dans l'effet) ; mêmes rendu serveur et client à l'hydratation.
    const id = setInterval(() => setTime(formatNow()), 30_000)
    const premiere = requestAnimationFrame(() => setTime(formatNow()))
    return () => {
      clearInterval(id)
      cancelAnimationFrame(premiere)
    }
  }, [])

  return time
}
