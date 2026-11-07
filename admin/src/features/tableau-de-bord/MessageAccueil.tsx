import { X } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'
import { Bouton } from '@/components/ui/Bouton'
import { t } from '@/i18n/fr'
import { ecrirePreference, lirePreference } from '@/lib/preferences'

/**
 * Message d'accueil en trois étapes (U12), à la première connexion d'un compte sur ce poste.
 * Fermé, il ne revient plus : la marque est une préférence d'affichage (D-09), jamais un contenu.
 */
export function MessageAccueil({ compteId }: { compteId: string }) {
  const cle = `accueil-vu:${compteId}`
  const [vu, setVu] = useState(() => lirePreference(cle, z.boolean(), false))
  if (vu) return null

  const fermer = () => {
    ecrirePreference(cle, true)
    setVu(true)
  }

  return (
    <section
      aria-labelledby="message-accueil"
      className="relative space-y-3 rounded-xl border border-sand-200 bg-sand-100 p-5 pr-14"
    >
      <h2 id="message-accueil" className="font-display text-heading-sm uppercase text-ink-900">
        {t('bienvenue.titre')}
      </h2>
      <ol className="list-decimal space-y-1 pl-5 text-body text-ink-900">
        <li>{t('bienvenue.etape1')}</li>
        <li>{t('bienvenue.etape2')}</li>
        <li>{t('bienvenue.etape3')}</li>
      </ol>
      <Bouton
        variante="discret"
        aria-label={t('bienvenue.fermer')}
        onClick={fermer}
        className="absolute top-3 right-3"
      >
        <X aria-hidden className="size-5" />
      </Bouton>
    </section>
  )
}
