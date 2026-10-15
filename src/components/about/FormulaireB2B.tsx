import { useRef, useState } from 'react'
import { OFFRES } from '@/data/offres'
import { envoyerFormulaire } from '@/lib/formulaire'
import { Reveal } from '@/components/motion/Reveal'
import { Input, Select, Textarea } from '@/components/ui/Field'
import { Button } from '@/components/ui/Button'
import { useLangue } from '@/i18n/contexteLangue'

type Statut = 'idle' | 'sending' | 'success' | 'error'

/**
 * Formulaire B2B de la page Influence.
 *
 * Champs du CDC : entreprise, pays, type de collaboration, calendrier, budget
 * optionnel, message. L'email est ajouté : sans lui, aucune réponse n'est possible. Il
 * est signalé comme écart au rapport de tâche.
 */
export function FormulaireB2B() {
  const { t } = useLangue()
  const formRef = useRef<HTMLFormElement>(null)
  const [statut, setStatut] = useState<Statut>('idle')

  return (
    <Reveal>
      <form
        ref={formRef}
        className="space-y-6"
        onSubmit={async (evenement) => {
          evenement.preventDefault()
          if (!formRef.current) return
          setStatut('sending')
          const ok = await envoyerFormulaire(formRef.current)
          if (ok) {
            setStatut('success')
            formRef.current.reset()
          } else {
            setStatut('error')
          }
        }}
      >
        <input type="hidden" name="subject" value="Demande de collaboration — Edja Shop" />

        <div className="grid gap-6 sm:grid-cols-2">
          <Input label="Entreprise" id="b2b-entreprise" autoComplete="organization" required />
          <Input label="Pays" id="b2b-pays" autoComplete="country-name" required />
        </div>

        <Select
          label="Type de collaboration"
          id="b2b-type"
          options={OFFRES.map((offre) => offre.titre)}
          optionVide={t('b2b.choisirType')}
          required
        />
        <Input label="Calendrier envisagé" id="b2b-calendrier" required />
        <Input label="Budget (optionnel)" id="b2b-budget" />

        {/* Écart signalé : hors de la liste des champs du CDC, nécessaire pour répondre. */}
        <Input label="Votre email" id="b2b-email" type="email" autoComplete="email" required />

        <Textarea label="Votre message" id="b2b-message" required />

        {/* Piège à robots, repris du formulaire de contact : un champ invisible au
            regard mais lu par les scripts automatiques. */}
        <input type="checkbox" name="botcheck" className="hidden" tabIndex={-1} aria-hidden />

        <div className="flex flex-wrap items-center gap-4">
          <Button type="submit" magnetic={false} disabled={statut === 'sending'}>
            {statut === 'sending' ? 'Envoi en cours…' : 'Envoyer la demande'}
          </Button>
        {/* Messages d'état montés en permanence : créés au moment de l'événement, ils
            ne sont pas annoncés de façon fiable. */}
        <div role="status" aria-live="polite" className="min-h-6">
          {statut === 'success' ? (
            <p className="text-body text-ink-700">{t('b2b.succes')}</p>
          ) : null}
        </div>
        <div role="alert" aria-live="assertive" className="min-h-6">
          {statut === 'error' ? (
            <p className="text-body font-semibold text-clay-700">{t('b2b.erreur')}</p>
          ) : null}
        </div>
        </div>
      </form>
    </Reveal>
  )
}
