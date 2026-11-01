import { useQuery, type QueryKey } from '@tanstack/react-query'
import { useState, type ComponentType, type ReactNode } from 'react'
import type { FieldValues } from 'react-hook-form'
import { useParams } from 'react-router'
import { Introuvable } from '@/app/pages-erreur'
import { estErreurApi } from '@/api/erreurs'
import type { RessourceVersionnee } from '@/api/schemas/versions'
import { AvertissementSortie } from '@/components/formulaire/AvertissementSortie'
import { BarreStatut } from '@/components/formulaire/BarreStatut'
import { ResumeErreurs } from '@/components/formulaire/ResumeErreurs'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { EtatErreur } from '@/components/ui/Etats'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { Onglets } from '@/components/ui/Onglets'
import { Squelette } from '@/components/ui/Squelette'
import { HistoriqueVersions } from '@/components/versions/HistoriqueVersions'
import { DialogueRefus } from '@/features/gabarits/DialogueRefus'
import { SuiviPublication } from '@/features/gabarits/SuiviPublication'
import type { ContenuEditable, Editeur } from '@/features/gabarits/useEditeurContenu'
import { t } from '@/i18n/fr'
import { FUSEAU } from '@/lib/dates'
import { listerErreurs } from '@/lib/formulaires'

/**
 * Gabarit de formulaire (section 9), commun à toutes les familles de contenu : chargement de la
 * fiche, enregistrement manuel et automatique (30 s), refus du serveur rattachés aux champs,
 * cycle de vie, aperçu, historique et avertissement avant de quitter. Chaque famille ne fournit
 * que ses champs, ses conversions et son aperçu (D-57) : aucun code recopié d'une famille à
 * l'autre.
 */
/**
 * Charge la fiche de `:id`, ou rien pour une création. Le contenu créé sur cette page garde son
 * éditeur quand l'adresse prend son identifiant : un remontage perdrait l'état en cours (D-52).
 */
export interface ProprietesEditeur<C> {
  contenu: C | null
  surCree: (id: string) => void
}

export function PageFormulaire<C extends { id: string }, P extends object = object>({
  cle,
  lire,
  editeur: EditeurFamille,
  proprietes,
}: {
  cle: (id: string) => QueryKey
  lire: (id: string) => Promise<C>
  editeur: ComponentType<ProprietesEditeur<C> & P>
  /** Propriétés propres passées à l'éditeur (la description d'une famille déclarative). */
  proprietes?: P
}) {
  const { id } = useParams()
  const [creeIci, setCreeIci] = useState<string | null>(null)
  const requete = useQuery({
    queryKey: cle(id ?? ''),
    queryFn: () => lire(id ?? ''),
    enabled: Boolean(id) && id !== creeIci,
  })
  if (!id || id === creeIci)
    return (
      <EditeurFamille key="nouveau" {...(proprietes as P)} contenu={null} surCree={setCreeIci} />
    )
  if (requete.isPending) return <Squelette lignes={6} />
  if (requete.isError) {
    if (estErreurApi(requete.error) && requete.error.status === 404) return <Introuvable />
    return <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
  }
  return (
    <EditeurFamille
      key={requete.data.id}
      {...(proprietes as P)}
      contenu={requete.data}
      surCree={setCreeIci}
    />
  )
}

/** Bas de la colonne latérale : programmation (admin), « à fournir », enregistrer. */
export function ActionsLaterales<C extends ContenuEditable, V extends FieldValues>({
  editeur,
  libelles,
  lectureSeule = t('contenu.lectureSeule'),
}: {
  editeur: Editeur<C, V>
  libelles: Record<string, string>
  lectureSeule?: string
}) {
  const { contenu, admin, modifiable, enregistrant } = editeur
  return (
    <>
      {admin && contenu && contenu.statut !== 'publie' && contenu.statut !== 'archive' ? (
        <Champ
          type="datetime-local"
          libelle={t('article.programmer')}
          aide={`${t('article.programmerAide')} (${FUSEAU}, UTC+0)`}
          value={editeur.programmeLe}
          onChange={(evenement) => editeur.setProgrammeLe(evenement.target.value)}
        />
      ) : null}
      {contenu ? (
        <IndicateurAFournir champs={contenu.champsAFournir} libelles={libelles} detail />
      ) : null}
      {modifiable ? (
        <Bouton type="submit" variante="secondaire" disabled={enregistrant} className="w-full">
          {enregistrant ? t('barre.enregistrementEnCours') : t('barre.enregistrer')}
        </Bouton>
      ) : (
        <Alerte>{lectureSeule}</Alerte>
      )}
    </>
  )
}

/**
 * Mise en page d'un formulaire de contenu : fil d'Ariane, barre de statut collée, suivi de la
 * reconstruction, motif du dernier refus, résumé d'erreurs, onglets contenu / aperçu /
 * historique, avertissement de sortie et dialogue de refus.
 */
export function GabaritFormulaire<C extends ContenuEditable, V extends FieldValues>({
  editeur,
  titreListe,
  cheminListe,
  titre,
  formulaire,
  apercu,
  libelles,
  versionnee,
  versChamp = (champ) => champ,
  avant,
  libelleOnglets = t('contenu.onglets'),
}: {
  editeur: Editeur<C, V>
  titreListe: string
  cheminListe: string
  titre: string
  /** Le `<form>` de la famille (il appelle `editeur.soumettre`). */
  formulaire: ReactNode
  apercu?: ReactNode
  libelles: Record<string, string>
  /** Ressource à historique (§ 14.2) : onglet « Historique » et restauration. */
  versionnee?: RessourceVersionnee
  /** Champ du formulaire vers lequel mène un manque du serveur (RG-03). */
  versChamp?: (champ: string) => string
  /** Bloc affiché entre la barre de statut et les onglets. */
  avant?: ReactNode
  libelleOnglets?: string
}) {
  const { contenu, cycle, formulaire: form } = editeur
  const resume = [
    ...listerErreurs(form.formState.errors),
    ...editeur.orphelines,
    ...cycle.manquants.map((m) => ({ champ: versChamp(m.champ), message: m.message })),
  ]

  return (
    <section className="space-y-6">
      <div>
        <FilAriane elements={[{ libelle: titreListe, chemin: cheminListe }, { libelle: titre }]} />
        <TitrePage titre={titre}>{titre}</TitrePage>
      </div>
      <BarreStatut
        ressource={editeur.ressource}
        contenu={contenu}
        enregistrement={editeur.etatEnregistrement}
        surEnregistrer={() => void editeur.soumettre()}
        surAction={editeur.action}
        actionEnCours={editeur.enregistrant ? 'enregistrer' : cycle.enCours}
      />
      {cycle.publicationId ? <SuiviPublication publicationId={cycle.publicationId} /> : null}
      {contenu?.statut === 'brouillon' && contenu.dernierMotifRefus ? (
        <Alerte ton="info">
          <p className="font-semibold">{t('article.refuse')}</p>
          <p>{contenu.dernierMotifRefus}</p>
        </Alerte>
      ) : null}
      <ResumeErreurs erreurs={resume} tentative={editeur.tentative} />
      {avant}
      <Onglets
        libelle={libelleOnglets}
        onglets={[
          { id: 'contenu', libelle: t('article.contenu'), contenu: formulaire },
          ...(apercu ? [{ id: 'apercu', libelle: t('article.apercu'), contenu: apercu }] : []),
          ...(contenu && versionnee
            ? [
                {
                  id: 'historique',
                  libelle: t('versions.titre'),
                  contenu: (
                    <HistoriqueVersions
                      ressource={versionnee}
                      id={contenu.id}
                      actuel={contenu}
                      versionCourante={contenu.version}
                      titre={titre}
                      libelles={libelles}
                      surRestauration={(restaure) => editeur.appliquer(restaure as C)}
                    />
                  ),
                },
              ]
            : []),
        ]}
      />
      <AvertissementSortie actif={form.formState.isDirty && !editeur.enregistrant} />
      <DialogueRefus
        ouverte={editeur.refus}
        titreContenu={titre}
        enCours={cycle.enCours === 'refuser'}
        surAnnuler={() => editeur.setRefus(false)}
        surRefus={(motif) => {
          void cycle.executer('refuser', { motif }).then((ok) => {
            if (ok) editeur.setRefus(false)
          })
        }}
      />
    </section>
  )
}
