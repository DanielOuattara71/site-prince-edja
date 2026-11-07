import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { comptes } from '@/api/endpoints/comptes'
import { ROLES, type Compte, type Role } from '@/api/schemas/communs'
import type { EntreeCompte, ModificationCompte } from '@/api/schemas/comptes'
import { useSession } from '@/auth/contexte-session'
import { peut, type CompteDroits } from '@/auth/permissions'
import { Bouton } from '@/components/ui/Bouton'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Champ } from '@/components/ui/Champ'
import { Confirmation } from '@/components/ui/Confirmation'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { Select, type OptionSelect } from '@/components/ui/Select'
import { TableauDonnees, type Colonne, type EtatTableau } from '@/components/listes/TableauDonnees'
import { TitrePage } from '@/components/layout/TitrePage'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { t, type CleTraduction } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'
import { formaterDate } from '@/lib/dates'
import type { ErreurApi } from '@/api/erreurs'

/**
 * Écran « Comptes » (étape 9) : liste des comptes, création, réinitialisation (lien par
 * e-mail) et désactivation pour le super-admin. Le serveur fait la garde (RG-16, dernier
 * super-admin) ; l’écran ne propose jamais ce que `peut()` refuse.
 */

const OPTIONS_ROLES: OptionSelect[] = ROLES.filter((role) => role !== 'vendeur').map((role) => ({
  valeur: role,
  libelle: t(`role.${role}` as CleTraduction),
}))

interface DependancesComptes {
  onReinitialiser: (compte: Compte) => void
  onDesactiver: (compte: Compte) => void
  peutDesactiver: (compte: Compte) => boolean
  enCours: boolean
}

function colonnesComptes(deps: DependancesComptes): Colonne<Compte>[] {
  return [
    {
      id: 'compte',
      entete: t('comptes.compte'),
      principale: true,
      cellule: (compte) => (
        <div className="min-w-0">
          <p className="truncate font-semibold text-ink-900">{compte.nom}</p>
          <p className="truncate text-caption text-ink-500">{compte.email}</p>
        </div>
      ),
    },
    {
      id: 'role',
      entete: t('comptes.role'),
      cellule: (compte) => t(`role.${compte.role}` as CleTraduction),
    },
    {
      id: 'statut',
      entete: t('comptes.statut'),
      cellule: (compte) => t(compte.actif ? 'comptes.actif' : 'comptes.inactif'),
    },
    {
      id: 'derniereConnexion',
      entete: t('comptes.derniereConnexion'),
      cellule: (compte) =>
        compte.derniereConnexion ? formaterDate(compte.derniereConnexion) : '—',
    },
    {
      id: 'actions',
      entete: t('comptes.action'),
      masquable: false,
      alignement: 'droite',
      cellule: (compte) => (
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Bouton
            variante="secondaire"
            className="min-h-9 px-3 text-button"
            onClick={() => deps.onReinitialiser(compte)}
            disabled={!compte.actif || deps.enCours}
          >
            {t('comptes.reinitialiser')}
          </Bouton>
          <Bouton
            variante={compte.actif ? 'danger' : 'secondaire'}
            className="min-h-9 px-3 text-button"
            onClick={() => deps.onDesactiver(compte)}
            disabled={!deps.peutDesactiver(compte) || deps.enCours}
          >
            {compte.actif ? t('comptes.desactiver') : t('comptes.activer')}
          </Bouton>
        </div>
      ),
    },
  ]
}

function optionsPour(compte: CompteDroits | undefined): OptionSelect[] {
  if (!compte || compte.role === 'editeur' || compte.role === 'vendeur') return []
  if (compte.role === 'admin') {
    return OPTIONS_ROLES.filter((option) => option.valeur === 'editeur')
  }
  return OPTIONS_ROLES
}

export default function ListeComptes() {
  const { moi } = useSession()
  const compteActeur: CompteDroits | undefined = moi?.compte
  const notifier = useNotifications()
  const client = useQueryClient()

  const [page, setPage] = useState(1)
  const pageSize = 20
  const requete = useQuery({
    queryKey: ['comptes', 'liste', page, pageSize],
    queryFn: () => comptes.lister({ page, pageSize }),
  })

  const [creationOuverte, setCreationOuverte] = useState(false)
  const [emailCreation, setEmailCreation] = useState('')
  const [nomCreation, setNomCreation] = useState('')
  const [roleCreation, setRoleCreation] = useState<Role>('editeur')
  const [cible, setCible] = useState<Compte | null>(null)

  const creer = useMutation({
    mutationFn: (entree: EntreeCompte) => comptes.creer(entree),
    onSuccess: () => {
      setCreationOuverte(false)
      setEmailCreation('')
      setNomCreation('')
      setRoleCreation('editeur')
      void client.invalidateQueries({ queryKey: ['comptes'] })
    },
    onError: (erreur: ErreurApi) => notifier.erreur(messageErreur(erreur), erreur.requeteId),
  })

  const modifier = useMutation({
    mutationFn: ({ id, corps }: { id: string; corps: ModificationCompte }) =>
      comptes.modifier(id, corps),
    onSuccess: () => void client.invalidateQueries({ queryKey: ['comptes'] }),
    onError: (erreur: ErreurApi) => notifier.erreur(messageErreur(erreur), erreur.requeteId),
  })

  const envoyerLien = useMutation({
    mutationFn: (id: string) => comptes.envoyerLien(id),
    onSuccess: () => {
      notifier.succes(t('comptes.lienEnvoye'))
      void client.invalidateQueries({ queryKey: ['comptes'] })
    },
    onError: (erreur: ErreurApi) => notifier.erreur(messageErreur(erreur), erreur.requeteId),
  })

  const etat: EtatTableau = requete.isPending ? 'chargement' : requete.isError ? 'erreur' : 'pret'
  const optionsRoles = optionsPour(compteActeur)
  const lignes = requete.data?.items ?? []
  const total = requete.data?.total ?? 0

  const colonnes = colonnesComptes({
    onReinitialiser: (compte) => envoyerLien.mutate(compte.id),
    onDesactiver: (compte) => setCible(compte),
    peutDesactiver: (compte) =>
      peut(compteActeur, 'modifier', 'comptes', { id: compte.id, role: compte.role }),
    enCours: modifier.isPending || envoyerLien.isPending,
  })

  const confirmerChangement = () => {
    if (!cible) return
    modifier.mutate(
      { id: cible.id, corps: { actif: !cible.actif } },
      { onSuccess: () => setCible(null) },
    )
  }

  return (
    <section className="space-y-8">
      <div className="space-y-2">
        <TitrePage titre={t('menu.comptes')}>{t('menu.comptes')}</TitrePage>
        {etat === 'chargement' ? <Squelette lignes={5} /> : null}
        {etat === 'erreur' ? (
          <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
        ) : null}
      </div>

      {etat === 'pret' ? (
        <TableauDonnees<Compte>
          libelle={t('menu.comptes')}
          colonnes={colonnes}
          lignes={lignes}
          cle={(compte) => compte.id}
          etat={etat}
          total={total}
          page={page}
          pageSize={pageSize}
          surPage={setPage}
          vide={<EtatVide titre={t('liste.vide')} />}
        />
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-caption text-ink-700" aria-live="polite">
          {etat === 'pret'
            ? `${total} ${total > 1 ? t('tableau.resultats') : t('tableau.resultat')}`
            : ''}
        </p>
        {optionsRoles.length > 0 ? (
          <Bouton variante="secondaire" onClick={() => setCreationOuverte(true)}>
            {t('comptes.creer')}
          </Bouton>
        ) : null}
      </div>

      <BoiteDialogue
        ouverte={creationOuverte}
        surFermeture={() => setCreationOuverte(false)}
        titre={t('comptes.creerTitre')}
        description={<p>{t('comptes.creerTexte')}</p>}
        actions={
          <>
            <Bouton variante="secondaire" onClick={() => setCreationOuverte(false)}>
              {t('confirmation.annuler')}
            </Bouton>
            <Bouton
              onClick={() =>
                void creer.mutate({
                  email: emailCreation.trim(),
                  nom: nomCreation.trim(),
                  role: roleCreation,
                })
              }
              disabled={
                creer.isPending ||
                !emailCreation.trim() ||
                !nomCreation.trim() ||
                !optionsRoles.some((option) => option.valeur === roleCreation)
              }
            >
              {creer.isPending ? '…' : t('comptes.creer')}
            </Bouton>
          </>
        }
      >
        <div className="space-y-4">
          <Champ
            libelle={t('comptes.email')}
            type="email"
            value={emailCreation}
            onChange={(evenement) => setEmailCreation(evenement.target.value)}
            required
          />
          <Champ
            libelle={t('comptes.nom')}
            value={nomCreation}
            onChange={(evenement) => setNomCreation(evenement.target.value)}
            required
          />
          <Select
            libelle={t('comptes.role')}
            value={roleCreation}
            onChange={(evenement) => setRoleCreation(evenement.target.value as Role)}
            options={optionsRoles}
          />
        </div>
      </BoiteDialogue>

      <Confirmation
        ouverte={cible !== null}
        titre={cible?.actif ? t('comptes.desactiverTitre') : t('comptes.activerTitre')}
        {...(cible?.nom ? { objet: cible.nom } : {})}
        consequence={cible?.actif ? t('comptes.desactiverTexte') : t('comptes.activerTexte')}
        libelleConfirmer={cible?.actif ? t('comptes.desactiver') : t('comptes.activer')}
        danger={cible?.actif ?? false}
        enCours={modifier.isPending}
        surConfirmer={confirmerChangement}
        surAnnuler={() => setCible(null)}
      />
    </section>
  )
}
