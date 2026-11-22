import { useEffect, useRef } from 'react'
import { useLocation } from 'react-router'
import { adresseApi } from '@/lib/formulaire'

/**
 * Compteur de visites maison (contrat 1.11.0 § 28.2) : un POST `POST /public/api/v1/analytics/vue`
 * est envoyé à chaque changement d'adresse (montage, retour-JS, lien interne), une fois par page.
 * Aucune donnée personnelle transmise : ni IP, ni agent utilisateur, ni identifiant de session.
 * Sans `PUBLIC_API_URL` configurée, rien n'est appelé (comme pour les formulaires).
 */
export function useCompteurVue() {
  const { pathname } = useLocation()
  const dernier = useRef<string | null>(null)

  useEffect(() => {
    if (dernier.current === pathname) return
    dernier.current = pathname
    const base = adresseApi()
    if (!base) return
    // Fire-and-forget : la réponse n'intéresse pas l'interface, une erreur n'est pas
    // visible par l'utilisateur (on ne veut pas perturber sa visite pour une statistique).
    void fetch(`${base}/public/api/v1/analytics/vue`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chemin: pathname }),
      keepalive: true,
    }).catch(() => {})
  }, [pathname])
}
