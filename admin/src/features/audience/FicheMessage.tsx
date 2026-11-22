import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Mail, MailOpen, Trash2, X } from 'lucide-react'
import { useState } from 'react'
import { messages } from '@/api/endpoints/audience'
import type { Message, StatutMessage } from '@/api/schemas/audience'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Bouton } from '@/components/ui/Bouton'
import { Confirmation } from '@/components/ui/Confirmation'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { t, type CleTraduction } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'
import { formaterDateHeure } from '@/lib/dates'

/**
 * Fiche complète d'un message (contrat § 12.1) : nom, e-mail, objet (motif / type de
 * collaboration), date de réception, contenu intégral avec défilement, statut, note interne
 * quand il y en a une. Actions : marquer comme lu, supprimer (avec confirmation), fermer.
 * Le contexte ne quitte jamais la boîte : le panneau est modal, jamais de redirection.
 */
export default function FicheMessage({
  message,
  surFermer,
}: {
  message: Message
  surFermer: () => void
}) {
  const { moi } = useSession()
  const peutModifier = peut(moi?.compte, 'modifier', 'messages')
  const peutSupprimer = peut(moi?.compte, 'supprimer', 'messages')
  const client = useQueryClient()
  const notifier = useNotifications()
  const [ouvert, setOuvert] = useState(message)
  const [confirmerSuppression, setConfirmerSuppression] = useState(false)

  const modifier = useMutation({
    mutationFn: (statut: StatutMessage) =>
      messages.modifier(ouvert.id, { statut, version: ouvert.version }),
    onSuccess: (modifiee) => {
      setOuvert(modifiee)
      void notifier.succes(
        t(modifiee.statut === 'lu' ? 'message.marqueLu' : 'message.marqueNonLu'),
      )
      // La liste passe derrière : statut et lectures se reflètent sans action du lecteur.
      void client.invalidateQueries({ queryKey: ['messages'] })
    },
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
  })

  const supprimer = useMutation({
    mutationFn: () => messages.supprimer(ouvert.id, ouvert.version),
    onSuccess: () => {
      setConfirmerSuppression(false)
      void client.invalidateQueries({ queryKey: ['messages'] })
      surFermer()
    },
    onError: (erreur) => {
      setConfirmerSuppression(false)
      notifier.erreur(messageErreur(erreur))
    },
  })

  const collaboration = ouvert.type === 'collaboration'
  const titre = ouvert.nom || ouvert.email
  // Objet : contact → motif ; collaboration → objet reste la « collaboration » elle-même.
  const objet = collaboration ? null : ouvert.motif
  const langueLibelle = ouvert.langue === 'fr' ? 'FR' : 'EN'

  return (
    <BoiteDialogue
      ouverte
      surFermeture={surFermer}
      titre={titre}
      taille="large"
      actions={
        <>
          <Bouton variante="secondaire" onClick={surFermer}>
            <X aria-hidden className="size-4" />
            {t('message.fermer')}
          </Bouton>
          {peutModifier && ouvert.statut === 'non_lu' ? (
            <Bouton onClick={() => modifier.mutate('lu')} disabled={modifier.isPending}>
              <MailOpen aria-hidden className="size-4" />
              {modifier.isPending ? t('demande.actionEnCours') : t('message.marquerLu')}
            </Bouton>
          ) : null}
          {peutModifier && ouvert.statut === 'lu' ? (
            <Bouton variante="secondaire" onClick={() => modifier.mutate('non_lu')} disabled={modifier.isPending}>
              <Mail aria-hidden className="size-4" />
              {modifier.isPending ? t('demande.actionEnCours') : t('message.marquerNonLu')}
            </Bouton>
          ) : null}
          {peutSupprimer ? (
            <Bouton variante="discret" onClick={() => setConfirmerSuppression(true)}>
              <Trash2 aria-hidden className="size-4" />
              {t('message.supprimer')}
            </Bouton>
          ) : null}
        </>
      }
    >
      <div className="max-h-[62vh] space-y-5 overflow-y-auto pr-1">
        {/* En-tête : qui, d'où, et quand. */}
        <ul className="grid gap-3 border-b border-sand-200 pb-4 text-body sm:grid-cols-2">
          <li>
            <p className="text-caption text-ink-500">{t('message.nom')}</p>
            <p className="font-semibold text-ink-900">{ouvert.nom ?? t('message.aucunChamp')}</p>
          </li>
          <li>
            <p className="text-caption text-ink-500">{t('message.email')}</p>
            <a
              className="font-semibold text-clay-700 underline underline-offset-4"
              href={`mailto:${ouvert.email}`}
            >
              {ouvert.email}
            </a>
          </li>
          {objet ? (
            <li>
              <p className="text-caption text-ink-500">{t('message.objet')}</p>
              <p className="text-ink-900">{objet}</p>
            </li>
          ) : null}
          <li>
            <p className="text-caption text-ink-500">{t('message.recusLe')}</p>
            <p className="tnum text-ink-900">{formaterDateHeure(ouvert.creeLe)}</p>
          </li>
          <li>
            <p className="text-caption text-ink-500">{t('liste.statut')}</p>
            <p className="font-semibold text-ink-900">
              {t(`statut.${ouvert.statut}` as CleTraduction)}
            </p>
          </li>
          <li>
            <p className="text-caption text-ink-500">{t('message.langue')}</p>
            <p className="text-ink-900">{langueLibelle}</p>
          </li>
          {collaboration ? (
            <>
              <li>
                <p className="text-caption text-ink-500">{t('message.entreprise')}</p>
                <p className="text-ink-900">{ouvert.entreprise}</p>
              </li>
              <li>
                <p className="text-caption text-ink-500">{t('message.pays')}</p>
                <p className="text-ink-900">{ouvert.pays}</p>
              </li>
              {ouvert.typeCollaboration ? (
                <li>
                  <p className="text-caption text-ink-500">{t('message.typeCollaboration')}</p>
                  <p className="text-ink-900">{ouvert.typeCollaboration}</p>
                </li>
              ) : null}
              {ouvert.calendrier ? (
                <li>
                  <p className="text-caption text-ink-500">{t('message.calendrier')}</p>
                  <p className="text-ink-900">{ouvert.calendrier}</p>
                </li>
              ) : null}
              {ouvert.budget ? (
                <li>
                  <p className="text-caption text-ink-500">{t('message.budget')}</p>
                  <p className="text-ink-900">{ouvert.budget}</p>
                </li>
              ) : null}
            </>
          ) : null}
        </ul>

        {/* Contenu intégral : le plancher reste de 3 lignes hautes, jamais de texte coupé. */}
        <div>
          <p className="text-caption text-ink-500">{t('message.contenu')}</p>
          <p className="mt-1 whitespace-pre-wrap text-body text-ink-900">{ouvert.message}</p>
        </div>

        {ouvert.noteInterne ? (
          <div className="rounded-md border border-dashed border-sand-300 bg-sand-100 p-4">
            <p className="text-caption text-ink-500">{t('message.noteInterne')}</p>
            <p className="mt-1 whitespace-pre-wrap text-body text-ink-700">{ouvert.noteInterne}</p>
          </div>
        ) : null}
      </div>

      {confirmerSuppression ? (
        <Confirmation
          ouverte
          titre={t('message.supprimerTitre')}
          objet={titre}
          consequence={t('message.supprimerTexte')}
          libelleConfirmer={t('message.supprimer')}
          danger
          enCours={supprimer.isPending}
          surConfirmer={() => supprimer.mutate()}
          surAnnuler={() => setConfirmerSuppression(false)}
        />
      ) : null}
    </BoiteDialogue>
  )
}
