import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { cles } from '@/api/cles'
import { motifsContact } from '@/api/endpoints/reglages'
import { estErreurApi } from '@/api/erreurs'
import type { EntreeMotif, MotifContact, ModificationMotif } from '@/api/schemas/reglages'
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
import { ZoneTexte } from '@/components/ui/ZoneTexte'
import { t } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'

/**
 * Motifs du formulaire de contact du site (contrat § 13.6) : ordonnables, sans cycle de vie.
 * Le titre français est obligatoire, l'anglais tombe dessus s'il manque ; « vide » n'existe
 * pas ici, la description reste `null` tant qu'elle n'est pas fournie.
 */

const nomDe = (m: MotifContact) => m.traductions.fr?.titre ?? ''

/** La traduction anglaise écrite : le titre retombe sur le français côté serveur s'il manque. */
function traductionEn(
  titre: string,
  description: string,
): NonNullable<NonNullable<EntreeMotif['traductions']['en']>> | null {
  if (!titre.trim() && !description.trim()) return null
  return {
    ...(titre.trim() ? { titre: titre.trim() } : {}),
    ...(description.trim() ? { description: description.trim() } : { description: null }),
  }
}

export default function MotifsContact() {
  const { moi } = useSession()
  const client = useQueryClient()
  const notifier = useNotifications()
  const admin = peut(moi?.compte, 'modifier', 'motifs-contact')
  const [edition, setEdition] = useState<MotifContact | 'nouvelle' | null>(null)
  const [suppression, setSuppression] = useState<MotifContact | null>(null)

  const requete = useQuery({
    queryKey: cles.motifsContact(),
    queryFn: () => motifsContact.lister(),
  })

  const ordonner = useMutation({
    mutationFn: (ids: string[]) => motifsContact.ordonner(ids),
    onSuccess: () => notifier.succes(t('ordre.enregistre')),
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
    onSettled: () => client.invalidateQueries({ queryKey: ['motifs-contact'] }),
  })

  const supprimer = useMutation({
    mutationFn: (m: MotifContact) => motifsContact.supprimer(m.id, m.version),
    onSuccess: () => {
      setSuppression(null)
      notifier.succes(t('formulaire.enregistre'))
    },
    onError: (erreur) => {
      setSuppression(null)
      notifier.erreur(messageErreur(erreur), estErreurApi(erreur) ? erreur.requeteId : undefined)
    },
    onSettled: () => client.invalidateQueries({ queryKey: ['motifs-contact'] }),
  })

  const surOrdre = (nouvelles: MotifContact[]) => {
    client.setQueryData(cles.motifsContact(), (page: typeof requete.data) =>
      page ? { ...page, items: nouvelles } : page,
    )
    ordonner.mutate(nouvelles.map((m) => m.id))
  }

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <FilAriane elements={[{ libelle: t('motif.titre') }]} />
          <TitrePage titre={t('motif.titre')}>{t('motif.titre')}</TitrePage>
          <p className="mt-2 max-w-3xl text-body text-ink-700">{t('motif.intro')}</p>
        </div>
        {admin ? (
          <Bouton onClick={() => setEdition('nouvelle')}>
            <Plus aria-hidden className="size-4" />
            {t('motif.nouveau')}
          </Bouton>
        ) : null}
      </div>
      {!admin ? <Alerte>{t('motif.lectureSeule')}</Alerte> : null}

      {requete.isPending ? (
        <Squelette lignes={4} />
      ) : requete.isError ? (
        <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
      ) : requete.data.items.length === 0 ? (
        <EtatVide titre={t('liste.vide')} />
      ) : (
        <ListeOrdonnable
          libelle={t('motif.ordre')}
          elements={requete.data.items}
          cle={(m) => m.id}
          nom={nomDe}
          desactivee={!admin || ordonner.isPending}
          surOrdre={surOrdre}
          renderLigne={(m) => (
            <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-body font-semibold text-ink-900">{nomDe(m)}</p>
                <p className="text-caption text-ink-700">
                  {m.traductions.fr?.description ?? t('motif.sansDescription')}
                  {m.traductions.en ? (
                    <span className="ml-2 rounded-full border border-dashed border-sand-300 px-2">
                      EN
                    </span>
                  ) : null}
                </p>
              </div>
              {admin ? (
                <div className="flex gap-2">
                  <Bouton
                    variante="secondaire"
                    aria-label={`${t('motif.modifier')} « ${nomDe(m)} »`}
                    onClick={() => setEdition(m)}
                  >
                    {t('motif.modifier')}
                  </Bouton>
                  <Bouton
                    variante="discret"
                    aria-label={`${t('motif.supprimer')} « ${nomDe(m)} »`}
                    onClick={() => setSuppression(m)}
                  >
                    {t('motif.supprimer')}
                  </Bouton>
                </div>
              ) : null}
            </div>
          )}
        />
      )}

      {edition ? (
        <DialogueMotif
          motif={edition === 'nouvelle' ? null : edition}
          surFermeture={() => setEdition(null)}
        />
      ) : null}
      {suppression ? (
        <Confirmation
          ouverte
          titre={t('motif.supprimerTitre')}
          objet={nomDe(suppression)}
          consequence={t('motif.supprimerTexte')}
          libelleConfirmer={t('motif.supprimer')}
          danger
          enCours={supprimer.isPending}
          surConfirmer={() => supprimer.mutate(suppression)}
          surAnnuler={() => setSuppression(null)}
        />
      ) : null}
    </section>
  )
}

/** Création ou modification : titre FR obligatoire, EN facultatif, description à deux langues. */
function DialogueMotif({
  motif,
  surFermeture,
}: {
  motif: MotifContact | null
  surFermeture: () => void
}) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const [titreFr, setTitreFr] = useState(motif?.traductions.fr?.titre ?? '')
  const [descriptionFr, setDescriptionFr] = useState(motif?.traductions.fr?.description ?? '')
  const [titreEn, setTitreEn] = useState(motif?.traductions.en?.titre ?? '')
  const [descriptionEn, setDescriptionEn] = useState(motif?.traductions.en?.description ?? '')
  const [erreur, setErreur] = useState<{ champ: string; message: string } | null>(null)

  const enregistrer = useMutation({
    mutationFn: () => {
      const en = traductionEn(titreEn, descriptionEn)
      return motif
        ? motifsContact.modifier(motif.id, {
            // L'anglais supprimé part en `null` (§ 13.6) ; absent = inchangé.
            traductions: {
              fr: { titre: titreFr.trim(), description: descriptionFr.trim() || null },
              ...(en ? { en } : motif.traductions.en ? { en: null } : {}),
            },
            version: motif.version,
          } satisfies ModificationMotif)
        : motifsContact.creer({
            traductions: {
              fr: { titre: titreFr.trim(), description: descriptionFr.trim() || null },
              ...(en ? { en } : {}),
            },
          })
    },
    onSuccess: () => {
      notifier.succes(t('formulaire.enregistre'))
      void client.invalidateQueries({ queryKey: ['motifs-contact'] })
      surFermeture()
    },
    onError: (e) => {
      setErreur({ champ: estErreurApi(e) ? (e.champ ?? '') : '', message: messageErreur(e) })
    },
  })

  const soumettre = (evenement: FormEvent) => {
    evenement.preventDefault()
    if (!titreFr.trim()) {
      setErreur({ champ: 'fr.titre', message: t('motif.titreRequis') })
      return
    }
    setErreur(null)
    enregistrer.mutate()
  }

  const titreDialogue = motif ? `${t('motif.modifier')} « ${titreFr || '…'} »` : t('motif.nouveau')

  return (
    <BoiteDialogue
      ouverte
      surFermeture={surFermeture}
      titre={titreDialogue}
      actions={
        <Bouton type="submit" form="formulaire-motif" disabled={enregistrer.isPending}>
          {enregistrer.isPending ? t('barre.enregistrementEnCours') : t('motif.enregistrer')}
        </Bouton>
      }
    >
      <form id="formulaire-motif" noValidate onSubmit={soumettre} className="space-y-4">
        <Champ
          libelle={`${t('motif.titreChamp')} (FR)`}
          required
          value={titreFr}
          maxLength={120}
          erreur={erreur?.champ.endsWith('fr.titre') ? erreur.message : undefined}
          onChange={(evenement) => setTitreFr(evenement.target.value)}
        />
        <ZoneTexte
          libelle={`${t('motif.description')} (FR)`}
          value={descriptionFr}
          maxLength={600}
          rows={3}
          onChange={(evenement) => setDescriptionFr(evenement.target.value)}
        />
        <Champ
          libelle={`${t('motif.titreChamp')} (EN)`}
          value={titreEn}
          maxLength={120}
          aide={t('motif.aideEn')}
          erreur={erreur?.champ.endsWith('en.titre') ? erreur.message : undefined}
          onChange={(evenement) => setTitreEn(evenement.target.value)}
        />
        <ZoneTexte
          libelle={`${t('motif.description')} (EN)`}
          value={descriptionEn}
          maxLength={600}
          rows={3}
          onChange={(evenement) => setDescriptionEn(evenement.target.value)}
        />
        {erreur && !erreur.champ ? <Alerte ton="erreur">{erreur.message}</Alerte> : null}
      </form>
    </BoiteDialogue>
  )
}
