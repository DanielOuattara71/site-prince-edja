import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { cles } from '@/api/cles'
import { parametres } from '@/api/endpoints/reglages'
import type { ModificationParametres, Parametres as ReglagesDuSite } from '@/api/schemas/reglages'
import { estErreurApi } from '@/api/erreurs'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { Confirmation } from '@/components/ui/Confirmation'
import { EtatErreur } from '@/components/ui/Etats'
import { Interrupteur } from '@/components/ui/Interrupteur'
import { Squelette } from '@/components/ui/Squelette'
import { ZoneTexte } from '@/components/ui/ZoneTexte'
import { t } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'

/**
 * Réglages généraux du site (contrat § 13.3) : singleton `GET` + `PATCH` avec `version`.
 * Chaque champ porte son « qui modifie » : durées de conservation, destinataires et langues
 * pour l'admin ; fenêtre de regroupement et interrupteurs pour le super-admin, dont l'e-mail
 * du compte doit être retapé (RG-16). La vente en ligne reste fermée : le serveur refuse
 * tout passage à `true`, l'interrupteur s'affiche donc désactivé.
 */

/** Une liste d'e-mails saisie en texte : une adresse par ligne (ou séparées par des virgules). */
const emailsDe = (texte: string) =>
  texte
    .split(/[\n,;]+/)
    .map((e) => e.trim())
    .filter(Boolean)

export default function Parametres() {
  const { moi } = useSession()
  const client = useQueryClient()
  const notifier = useNotifications()
  const admin = peut(moi?.compte, 'modifier', 'parametres')
  const superAdmin = moi?.compte.role === 'super_admin'
  const [multiVendeursOuvert, setMultiVendeursOuvert] = useState(false)

  const requete = useQuery({
    queryKey: cles.parametres(),
    queryFn: () => parametres.lire(),
  })

  const ecrire = useMutation({
    mutationFn: (modification: ModificationParametres) => parametres.modifier(modification),
    onSuccess: () => {
      notifier.succes(t('formulaire.enregistre'))
      void client.invalidateQueries({ queryKey: ['parametres'] })
    },
    onError: (erreur) => {
      notifier.erreur(messageErreur(erreur), estErreurApi(erreur) ? erreur.requeteId : undefined)
      void client.invalidateQueries({ queryKey: ['parametres'] })
    },
  })

  if (requete.isPending) return <Squelette lignes={10} />
  if (requete.isError || !requete.data) {
    return <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
  }
  const reglages = requete.data

  return (
    <section className="space-y-6">
      <div>
        <FilAriane elements={[{ libelle: t('menu.parametres') }]} />
        <TitrePage titre={t('parametres.titre')}>{t('parametres.titre')}</TitrePage>
        <p className="mt-2 max-w-3xl text-body text-ink-700">{t('parametres.intro')}</p>
      </div>
      {!admin ? <Alerte>{t('parametres.lectureSeule')}</Alerte> : null}
      {/* Langues (§ 13.3) : le français reste, l'anglais s'ajoute puis se retire. */}
      <div className="space-y-3 rounded-md border border-sand-200 p-4">
        <h2 className="text-heading-sm text-ink-900">{t('parametres.languesTitre')}</h2>
        <p className="text-caption text-ink-700">{t('parametres.languesAide')}</p>
        <div className="space-y-2">
          <Interrupteur
            libelle="Français"
            actif
            surChange={() => {
              /* le français ne se retire jamais (languesActives garde au moins 'fr') */
            }}
          />
          <Interrupteur
            libelle="English"
            actif={reglages.languesActives.includes('en')}
            desactive={!admin}
            surChange={(actif) =>
              ecrire.mutate({
                languesActives: actif ? ['fr', 'en'] : ['fr'],
                version: reglages.version,
              })
            }
          />
        </div>
      </div>
      <FormulaireReglages reglages={reglages} admin={admin} superAdmin={superAdmin} />
      {/* Interrupteurs réservés au super-admin (§ 13.3, RG-16) : confirmation par e-mail retapé. */}
      <div className="space-y-3 rounded-md border border-sand-200 p-4">
        <h2 className="text-heading-sm text-ink-900">{t('parametres.boutiqueTitre')}</h2>
        <p className="text-caption text-ink-700">{t('parametres.boutiqueAide')}</p>
        <Interrupteur
          libelle={t('parametres.multiVendeurs')}
          actif={reglages.multiVendeurs}
          desactive={!superAdmin}
          surChange={() => setMultiVendeursOuvert(true)}
        />
        <Interrupteur
          libelle={t('parametres.boutiqueEnLigne')}
          actif={reglages.boutiqueEnLigne}
          desactive
          surChange={() => {
            /* la vente en ligne reste fermée (§ 13.3) */
          }}
          aide={<span>{t('parametres.venteFermee')}</span>}
        />
      </div>
      {multiVendeursOuvert ? (
        <Confirmation
          ouverte={multiVendeursOuvert}
          titre={
            reglages.multiVendeurs
              ? t('parametres.multiVendeursOff')
              : t('parametres.multiVendeursOn')
          }
          consequence={
            reglages.multiVendeurs
              ? t('parametres.multiVendeursOffTexte')
              : t('parametres.multiVendeursOnTexte')
          }
          libelleConfirmer={t('formulaire.confirmer')}
          danger
          saisieAttendue={moi?.compte.email ?? ''}
          enCours={ecrire.isPending}
          surConfirmer={() => {
            // L'e-mail de confirmation est retapé dans la boîte (RG-16), renvoyé tel quel.
            ecrire.mutate({
              multiVendeurs: !reglages.multiVendeurs,
              confirmationEmail: moi?.compte.email ?? '',
              version: reglages.version,
            })
            setMultiVendeursOuvert(false)
          }}
          surAnnuler={() => setMultiVendeursOuvert(false)}
        />
      ) : null}
    </section>
  )
}

/**
 * Durées de conservation, destinataires, fenêtre de regroupement : un seul PATCH, qui ne
 * porte que les champs touchés (§ 5 : le serveur refuse un champ hors du rôle qui écrit).
 */
function FormulaireReglages({
  reglages,
  admin,
  superAdmin,
}: {
  reglages: ReglagesDuSite
  admin: boolean
  superAdmin: boolean
}) {
  const notifier = useNotifications()
  const [contact, setContact] = useState(reglages.destinataires.contact.join('\n'))
  const [collaboration, setCollaboration] = useState(
    reglages.destinataires.collaboration.join('\n'),
  )
  const [demandes, setDemandes] = useState(reglages.destinataires.demandes.join('\n'))
  const [conservation, setConservation] = useState(String(reglages.conservationMessagesMois))
  const [purge, setPurge] = useState(String(reglages.purgeAbonnesNonConfirmesJours))
  const [regroupement, setRegroupement] = useState(String(reglages.regroupementPublicationSecondes))
  const [erreur, setErreur] = useState<string | null>(null)

  const enregistrer = useMutation({
    mutationFn: () => {
      const modification: ModificationParametres = { version: reglages.version }
      const bouge = (texte: string, valeurs: string[]) => texte.trim() !== valeurs.join('\n')
      if (
        bouge(contact, reglages.destinataires.contact) ||
        bouge(collaboration, reglages.destinataires.collaboration) ||
        bouge(demandes, reglages.destinataires.demandes)
      ) {
        modification.destinataires = {
          contact: emailsDe(contact),
          collaboration: emailsDe(collaboration),
          demandes: emailsDe(demandes),
        }
      }
      if (Number(conservation) !== reglages.conservationMessagesMois) {
        modification.conservationMessagesMois = Number(conservation)
      }
      if (Number(purge) !== reglages.purgeAbonnesNonConfirmesJours) {
        modification.purgeAbonnesNonConfirmesJours = Number(purge)
      }
      if (superAdmin && Number(regroupement) !== reglages.regroupementPublicationSecondes) {
        modification.regroupementPublicationSecondes = Number(regroupement)
      }
      return parametres.modifier(modification)
    },
    onSuccess: () => {
      setErreur(null)
      notifier.succes(t('formulaire.enregistre'))
      void invalider()
    },
    onError: (e) => {
      setErreur(messageErreur(e))
      void invalider()
    },
  })
  const client = useQueryClient()
  const invalider = async () => client.invalidateQueries({ queryKey: ['parametres'] })

  return (
    <form
      noValidate
      onSubmit={(evenement) => {
        evenement.preventDefault()
        setErreur(null)
        enregistrer.mutate()
      }}
      className="space-y-4 rounded-md border border-sand-200 p-4"
    >
      <h2 className="text-heading-sm text-ink-900">{t('parametres.conservationTitre')}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <Champ
          libelle={t('parametres.conservationMessages')}
          aide={t('parametres.conservationAide')}
          type="number"
          min={1}
          max={120}
          required
          value={conservation}
          disabled={!admin}
          onChange={(e) => setConservation(e.target.value)}
        />
        <Champ
          libelle={t('parametres.purgeAbonnes')}
          aide={t('parametres.purgeAide')}
          type="number"
          min={1}
          max={90}
          required
          value={purge}
          disabled={!admin}
          onChange={(e) => setPurge(e.target.value)}
        />
      </div>

      <h2 className="pt-2 text-heading-sm text-ink-900">{t('parametres.destinatairesTitre')}</h2>
      <p className="text-caption text-ink-700">{t('parametres.destinatairesAide')}</p>
      <ZoneTexte
        libelle={t('parametres.contact')}
        value={contact}
        disabled={!admin}
        rows={2}
        onChange={(e) => setContact(e.target.value)}
      />
      <ZoneTexte
        libelle={t('parametres.collaboration')}
        value={collaboration}
        disabled={!admin}
        rows={2}
        onChange={(e) => setCollaboration(e.target.value)}
      />
      <ZoneTexte
        libelle={t('parametres.demandes')}
        value={demandes}
        disabled={!admin}
        rows={2}
        onChange={(e) => setDemandes(e.target.value)}
      />

      <h2 className="pt-2 text-heading-sm text-ink-900">{t('parametres.publicationTitre')}</h2>
      <Champ
        libelle={t('parametres.regroupement')}
        aide={superAdmin ? t('parametres.regroupementAide') : t('parametres.regroupementReserve')}
        type="number"
        min={0}
        max={3600}
        value={regroupement}
        disabled={!superAdmin}
        onChange={(e) => setRegroupement(e.target.value)}
      />

      {erreur ? <Alerte ton="erreur">{erreur}</Alerte> : null}
      <Bouton type="submit" disabled={enregistrer.isPending}>
        {enregistrer.isPending ? t('barre.enregistrementEnCours') : t('formulaire.enregistrer')}
      </Bouton>
    </form>
  )
}
