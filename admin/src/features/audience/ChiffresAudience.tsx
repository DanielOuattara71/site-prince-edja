import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { cles } from '@/api/cles'
import { chiffresAudience } from '@/api/endpoints/reglages'
import { aLeCode, estErreurApi } from '@/api/erreurs'
import type { ChiffreAudience } from '@/api/schemas/reglages'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { ListeOrdonnable } from '@/components/listes/ListeOrdonnable'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Alerte } from '@/components/ui/Alerte'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { Confirmation } from '@/components/ui/Confirmation'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { t } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'
import { formatNombre } from '@/lib/format'

/**
 * Chiffres d'audience par plateforme (contrat § 13.2) : la maison fournit ses chiffres (taille,
 * portée mensuelle) avec la date et la source de la validation. Un chiffre sans date ne s'affiche
 * pas comme validé sur le site : ici, il reste enregistré mais « à valider ».
 */
const nomDe = (c: ChiffreAudience) => c.plateforme

/** Un nombre saisi en texte : vide = `null`, jamais `0` (§ 2). */
const nombreDe = (texte: string): number | null => {
  const n = Number(texte.replace(/\s/g, '').replace(',', '.'))
  return texte.trim() && Number.isFinite(n) ? n : null
}

export default function ChiffresAudience() {
  const { moi } = useSession()
  const client = useQueryClient()
  const notifier = useNotifications()
  const admin = peut(moi?.compte, 'modifier', 'audience')
  const [edition, setEdition] = useState<ChiffreAudience | 'nouvelle' | null>(null)
  const [suppression, setSuppression] = useState<ChiffreAudience | null>(null)

  const requete = useQuery({
    queryKey: cles.chiffresAudience(),
    queryFn: () => chiffresAudience.lister(),
  })

  const ordonner = useMutation({
    mutationFn: (ids: string[]) => chiffresAudience.ordonner(ids),
    onSuccess: () => notifier.succes(t('ordre.enregistre')),
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
    onSettled: () => client.invalidateQueries({ queryKey: ['audience'] }),
  })

  const supprimer = useMutation({
    mutationFn: (c: ChiffreAudience) => chiffresAudience.supprimer(c.id, c.version),
    onSuccess: () => {
      setSuppression(null)
      notifier.succes(t('formulaire.enregistre'))
    },
    onError: (erreur) => {
      setSuppression(null)
      notifier.erreur(messageErreur(erreur), estErreurApi(erreur) ? erreur.requeteId : undefined)
    },
    onSettled: () => client.invalidateQueries({ queryKey: ['audience'] }),
  })

  const surOrdre = (nouvelles: ChiffreAudience[]) => {
    client.setQueryData(cles.chiffresAudience(), (page: typeof requete.data) =>
      page ? { ...page, items: nouvelles } : page,
    )
    ordonner.mutate(nouvelles.map((c) => c.id))
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <FilAriane elements={[{ libelle: t('audience.titre') }]} />
          <TitrePage titre={t('audience.titre')}>{t('audience.titre')}</TitrePage>
          <p className="mt-2 max-w-3xl text-body text-ink-700">{t('audience.intro')}</p>
        </div>
        {admin ? (
          <Bouton onClick={() => setEdition('nouvelle')}>
            <Plus aria-hidden className="size-4" />
            {t('audience.nouveauChiffre')}
          </Bouton>
        ) : null}
      </div>

      {requete.isPending ? (
        <Squelette lignes={5} />
      ) : requete.isError ? (
        <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
      ) : requete.data.items.length === 0 ? (
        <EtatVide titre={t('liste.vide')} />
      ) : (
        <ListeOrdonnable
          libelle={t('audience.ordre')}
          elements={requete.data.items}
          cle={(c) => c.id}
          nom={nomDe}
          desactivee={!admin || ordonner.isPending}
          surOrdre={surOrdre}
          renderLigne={(c) => (
            <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-body font-semibold text-ink-900">{c.plateforme}</p>
                <p className="text-caption text-ink-700">
                  {[
                    c.taille === null ? null : `${t('audience.taille')} ${formatNombre(c.taille)}`,
                    c.portee === null ? null : `${t('audience.portee')} ${formatNombre(c.portee)}`,
                    c.dateValidation
                      ? `${t('audience.dateValidation')} ${c.dateValidation}`
                      : t('audience.sansDate'),
                  ]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
              </div>
              {admin ? (
                <div className="flex gap-2">
                  <Bouton
                    variante="secondaire"
                    aria-label={`${t('audience.modifier')} « ${c.plateforme} »`}
                    onClick={() => setEdition(c)}
                  >
                    {t('audience.modifier')}
                  </Bouton>
                  <Bouton
                    variante="discret"
                    aria-label={`${t('audience.supprimer')} « ${c.plateforme} »`}
                    onClick={() => setSuppression(c)}
                  >
                    {t('audience.supprimer')}
                  </Bouton>
                </div>
              ) : null}
            </div>
          )}
        />
      )}

      {edition ? (
        <DialogueChiffre
          chiffre={edition === 'nouvelle' ? null : edition}
          surFermeture={() => setEdition(null)}
        />
      ) : null}
      {suppression ? (
        <Confirmation
          ouverte
          titre={t('audience.supprimerTitre')}
          objet={suppression.plateforme}
          consequence={t('audience.supprimerTexte')}
          libelleConfirmer={t('audience.supprimer')}
          danger
          enCours={supprimer.isPending}
          surConfirmer={() => supprimer.mutate(suppression)}
          surAnnuler={() => setSuppression(null)}
        />
      ) : null}
    </section>
  )
}

function DialogueChiffre({
  chiffre,
  surFermeture,
}: {
  chiffre: ChiffreAudience | null
  surFermeture: () => void
}) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const [plateforme, setPlateforme] = useState(chiffre?.plateforme ?? '')
  const [taille, setTaille] = useState(
    chiffre?.taille === null || chiffre?.taille === undefined ? '' : String(chiffre.taille),
  )
  const [portee, setPortee] = useState(
    chiffre?.portee === null || chiffre?.portee === undefined ? '' : String(chiffre.portee),
  )
  const [dateValidation, setDateValidation] = useState(chiffre?.dateValidation ?? '')
  const [source, setSource] = useState(chiffre?.source ?? '')
  const [erreur, setErreur] = useState<{ champ: string; message: string } | null>(null)

  const enregistrer = useMutation({
    mutationFn: () => {
      const entree = {
        plateforme: plateforme.trim(),
        taille: nombreDe(taille),
        portee: nombreDe(portee),
        dateValidation: dateValidation.trim() || null,
        source: source.trim() || null,
      }
      // Un seul PATCH : le schéma accepte la plateforme comme les autres champs (§ 13.2).
      return chiffre
        ? chiffresAudience.modifier(chiffre.id, { ...entree, version: chiffre.version })
        : chiffresAudience.creer(entree)
    },
    onSuccess: () => {
      notifier.succes(t('formulaire.enregistre'))
      void client.invalidateQueries({ queryKey: ['audience'] })
      surFermeture()
    },
    onError: (e) => {
      if (aLeCode(e, 'VERSION_PERIMEE')) {
        setErreur({ champ: '', message: messageErreur(e) })
        return
      }
      setErreur({ champ: estErreurApi(e) ? (e.champ ?? '') : '', message: messageErreur(e) })
    },
  })

  const soumettre = (evenement: FormEvent) => {
    evenement.preventDefault()
    if (!plateforme.trim()) {
      setErreur({ champ: 'plateforme', message: t('audience.plateformeRequise') })
      return
    }
    setErreur(null)
    enregistrer.mutate()
  }

  return (
    <BoiteDialogue
      ouverte
      surFermeture={surFermeture}
      titre={
        chiffre
          ? `${t('audience.modifier')} « ${plateforme || '…'} »`
          : t('audience.nouveauChiffre')
      }
      actions={
        <Bouton type="submit" form="formulaire-chiffre" disabled={enregistrer.isPending}>
          {enregistrer.isPending ? t('barre.enregistrementEnCours') : t('formulaire.enregistrer')}
        </Bouton>
      }
    >
      <form id="formulaire-chiffre" noValidate onSubmit={soumettre} className="space-y-4">
        <Champ
          libelle={t('audience.plateforme')}
          required
          value={plateforme}
          maxLength={120}
          erreur={erreur?.champ === 'plateforme' ? erreur.message : undefined}
          disabled={Boolean(chiffre)}
          onChange={(evenement) => setPlateforme(evenement.target.value)}
        />
        <Champ
          libelle={t('audience.taille')}
          inputMode="numeric"
          value={taille}
          onChange={(evenement) => setTaille(evenement.target.value)}
        />
        <Champ
          libelle={t('audience.portee')}
          inputMode="numeric"
          value={portee}
          onChange={(evenement) => setPortee(evenement.target.value)}
        />
        <Champ
          libelle={t('audience.dateValidation')}
          value={dateValidation}
          aide={t('audience.dateAide')}
          erreur={erreur?.champ === 'dateValidation' ? erreur.message : undefined}
          onChange={(evenement) => setDateValidation(evenement.target.value)}
        />
        <Champ
          libelle={t('audience.source')}
          value={source}
          onChange={(evenement) => setSource(evenement.target.value)}
        />
        {erreur && !erreur.champ ? <Alerte ton="erreur">{erreur.message}</Alerte> : null}
      </form>
    </BoiteDialogue>
  )
}
