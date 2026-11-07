import { Navigate, useLocation } from 'react-router'

/** `/journal` → `/activite` (PROMPT-CORRECTION § 5.5), en gardant les filtres de l'adresse. */
export function VersActivite() {
  const { search } = useLocation()
  return <Navigate to={{ pathname: '/activite', search }} replace />
}
