import { useEffect, useState } from 'react'

export function useMediaQuery(query: string): boolean {
  // Serveur et premier rendu client identiques. Le média est lu après le montage —
  // sinon le HTML prérendu et le client divergeraient dès que la fenêtre n'est pas
  // exactement celle du serveur.
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])

  return matches
}

export function useIsDesktop(): boolean {
  return useMediaQuery('(min-width: 1024px)')
}

export function useHasFinePointer(): boolean {
  return useMediaQuery('(hover: hover) and (pointer: fine)')
}
