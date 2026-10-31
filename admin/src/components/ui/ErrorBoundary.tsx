import { Component, type ErrorInfo, type ReactNode } from 'react'
import { EtatErreur } from '@/components/ui/Etats'
import { t } from '@/i18n/fr'

/**
 * Isole la panne d'un bloc (un panneau, un aperçu) : le reste de l'écran continue de
 * fonctionner. Message clair, sans trace (D-17) ; « Réessayer » remonte le bloc. Les erreurs
 * de route restent au routeur (`ErreurInattendue`).
 *
 * @example
 * <ErrorBoundary><ApercuSite>…</ApercuSite></ErrorBoundary>
 */
interface Etat {
  erreur: unknown
}

export class ErrorBoundary extends Component<{ children: ReactNode; titre?: string }, Etat> {
  override state: Etat = { erreur: null }

  static getDerivedStateFromError(erreur: unknown): Etat {
    return { erreur }
  }

  override componentDidCatch(erreur: unknown, info: ErrorInfo): void {
    // Point d'entrée unique du futur suivi d'erreurs (Q-24 du back end) : rien n'est envoyé ailleurs.
    if (import.meta.env.DEV) console.error(erreur, info.componentStack)
  }

  override render() {
    if (this.state.erreur !== null) {
      return (
        <EtatErreur
          erreur={this.state.erreur}
          titre={this.props.titre ?? t('erreur.bloc')}
          surReessai={() => this.setState({ erreur: null })}
        />
      )
    }
    return this.props.children
  }
}
