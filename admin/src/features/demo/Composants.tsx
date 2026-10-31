import { useQuery } from '@tanstack/react-query'
import { useState, type ReactNode } from 'react'
import { usagesDe } from '@/api/erreurs'
import { articles, medias } from '@/api/endpoints/contenus'
import type { ResumeContenu } from '@/api/schemas/communs'
import type { CorpsRiche } from '@/api/schemas/corps-riche'
import { ApercuSite, EnteteArticle } from '@/components/apercu/ApercuSite'
import { RenduCorps } from '@/components/apercu/RenduCorps'
import { SelecteurCreateur } from '@/components/createurs/SelecteurCreateur'
import { EditeurRiche } from '@/components/editeur/EditeurRiche'
import { AvertissementSortie } from '@/components/formulaire/AvertissementSortie'
import { BarreStatut, type EtatEnregistrement } from '@/components/formulaire/BarreStatut'
import { ChampTraduit } from '@/components/formulaire/ChampTraduit'
import { ResumeErreurs } from '@/components/formulaire/ResumeErreurs'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { ListeOrdonnable } from '@/components/listes/ListeOrdonnable'
import { TableauDonnees, type Colonne } from '@/components/listes/TableauDonnees'
import { PanneauUsages } from '@/components/medias/PanneauUsages'
import { SelecteurMedia } from '@/components/medias/SelecteurMedia'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { SelecteurTags } from '@/components/tags/SelecteurTags'
import { Bouton } from '@/components/ui/Bouton'
import { Case } from '@/components/ui/Case'
import { Champ } from '@/components/ui/Champ'
import { Confirmation } from '@/components/ui/Confirmation'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { Interrupteur } from '@/components/ui/Interrupteur'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { Select } from '@/components/ui/Select'
import { ZoneTexte } from '@/components/ui/ZoneTexte'
import { HistoriqueVersions } from '@/components/versions/HistoriqueVersions'
import { ErreurApi } from '@/api/erreurs'
import { formaterDate } from '@/lib/dates'
import { etatAffiche } from '@/lib/statuts'

/**
 * Vitrine des composants transverses (étape 3), **en développement seulement** : la route
 * n'existe pas au build (`import.meta.env.DEV`), et ce fichier n'entre pas dans `dist`.
 * Elle tourne sur le faux serveur ; les textes de démonstration restent donc ici, hors du
 * dictionnaire de l'interface.
 */
const LIBELLES_A_FOURNIR = { extrait: 'Résumé', corps: 'Corps', credit: 'Crédit photo' }

export default function Composants() {
  return (
    <div className="space-y-12 pb-12">
      <div>
        <FilAriane elements={[{ libelle: 'Composants' }]} />
        <TitrePage titre="Composants">Composants</TitrePage>
        <p className="mt-2 max-w-prose text-body text-ink-700">
          Vitrine de développement des composants transverses (section 10 du prompt). Données du
          faux serveur.
        </p>
      </div>
      <Primitives />
      <Statuts />
      <Formulaire />
      <Medias />
      <Listes />
      <Dialogues />
      <Versions />
    </div>
  )
}

function Bloc({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="space-y-4">
      <h2 className="font-display text-heading-sm uppercase">{titre}</h2>
      <div className="space-y-4 rounded-md border border-sand-200 bg-sand-100 p-5">{children}</div>
    </section>
  )
}

function Primitives() {
  const [actif, setActif] = useState(false)
  return (
    <Bloc titre="Primitives">
      <div className="grid gap-4 md:grid-cols-2">
        <Champ libelle="Titre" required aide="Visible sur le site." />
        <Champ libelle="Champ en erreur" erreur="Ce champ est obligatoire." />
        <ZoneTexte libelle="Résumé" maxLength={160} />
        <Select
          libelle="Catégorie"
          invite="Choisir…"
          options={[
            { valeur: 'voyage', libelle: 'Voyage' },
            { valeur: 'histoire', libelle: 'Histoire' },
          ]}
        />
        <Case libelle="Image décorative" aide="Aucun texte alternatif ne sera lu." />
        <Interrupteur libelle="Mettre à la une" actif={actif} surChange={setActif} />
      </div>
    </Bloc>
  )
}

function Statuts() {
  return (
    <Bloc titre="Statuts et « à fournir »">
      <div className="flex flex-wrap gap-2">
        {(
          ['brouillon', 'en_relecture', 'publie', 'programme', 'archive', 'a_fournir'] as const
        ).map((etat) => (
          <PastilleStatut key={etat} etat={etat} />
        ))}
      </div>
      <IndicateurAFournir
        champs={['traductions.fr.extrait', 'credit']}
        libelles={LIBELLES_A_FOURNIR}
        detail
      />
      <div className="grid gap-4 md:grid-cols-2">
        <EtatVide titre="Aucun article" texte="Créez le premier article du journal." />
        <EtatErreur
          erreur={
            new ErreurApi({ status: 503, code: 'INDISPONIBLE', message: '', requeteId: 'req-demo' })
          }
          surReessai={() => undefined}
        />
      </div>
    </Bloc>
  )
}

function Formulaire() {
  const [titres, setTitres] = useState<{ fr?: string; en?: string }>({ fr: 'Exemple de titre' })
  const [corps, setCorps] = useState<CorpsRiche | null>(null)
  const [tags, setTags] = useState<string[]>([])
  const [createur, setCreateur] = useState<string | null>(null)
  const [soumis, setSoumis] = useState(0)
  const [enregistrement, setEnregistrement] = useState<EtatEnregistrement>('enregistre')
  const modifie = enregistrement === 'modifie'
  const marquer = () => setEnregistrement('modifie')
  const erreurs =
    soumis > 0 && !titres.en
      ? [{ champ: 'traductions.en.titre', message: 'Titre anglais : exemple d’erreur.' }]
      : []

  return (
    <Bloc titre="Formulaire de contenu">
      <ResumeErreurs erreurs={erreurs} tentative={soumis} />
      <ChampTraduit
        nom="titre"
        libelle="Titre"
        requis
        valeurs={titres}
        erreurs={erreurs.length > 0 ? { en: erreurs[0]?.message } : {}}
        surChange={(langue, valeur) => {
          setTitres({ ...titres, [langue]: valeur })
          marquer()
        }}
      />
      <EditeurRiche
        id="traductions.fr.corps"
        libelle="Corps (FR)"
        aide="Titres, gras, italique, listes, citation, lien et image de la médiathèque."
        valeur={corps}
        surChange={(valeur) => {
          setCorps(valeur)
          marquer()
        }}
      />
      <SelecteurTags
        valeur={tags}
        surChange={(ids) => {
          setTags(ids)
          marquer()
        }}
        exigerFormat
        afficherErreur={soumis > 0}
      />
      <SelecteurCreateur valeur={createur} surChange={setCreateur} />
      <Bouton variante="secondaire" onClick={() => setSoumis(soumis + 1)}>
        Simuler une soumission refusée
      </Bouton>
      <ApercuSite libelle="Aperçu">
        <EnteteArticle titre={titres.fr ?? ''} extrait="Résumé d’exemple." />
        <RenduCorps corps={corps} langue="fr" />
      </ApercuSite>
      <AvertissementSortie actif={modifie} />
      <BarreStatut
        ressource="articles"
        contenu={{
          statut: 'brouillon',
          publieLe: null,
          champsAFournir: ['traductions.fr.extrait'],
        }}
        enregistrement={enregistrement}
        surEnregistrer={() => {
          setEnregistrement('en_cours')
          setTimeout(() => setEnregistrement('enregistre'), 600)
        }}
        surAction={() => undefined}
      />
    </Bloc>
  )
}

function Medias() {
  const [ouvert, setOuvert] = useState(false)
  const notifier = useNotifications()
  const liste = useQuery({
    queryKey: ['demo', 'medias'],
    queryFn: () => medias.lister({ pageSize: 5 }),
  })
  const premier = liste.data?.items[0]
  const usages = useQuery({
    queryKey: ['demo', 'usages', premier?.id],
    queryFn: () => medias.usages(premier?.id ?? ''),
    enabled: Boolean(premier),
  })

  return (
    <Bloc titre="Médiathèque">
      <Bouton onClick={() => setOuvert(true)}>Choisir une image</Bouton>
      <SelecteurMedia
        ouverte={ouvert}
        surFermeture={() => setOuvert(false)}
        surChoix={(media) => {
          setOuvert(false)
          notifier.succes(`Image choisie : ${media.traductions.fr?.texteAlt ?? media.id}`)
        }}
      />
      {usages.data ? <PanneauUsages objet="ce média" usages={usages.data} /> : null}
      <PanneauUsages
        objet="ce tag"
        usages={usagesDe(
          new ErreurApi({
            status: 422,
            code: 'RG-08',
            message: '',
            details: { usages: [] },
          }),
        )}
      />
    </Bloc>
  )
}

const COLONNES: Colonne<ResumeContenu>[] = [
  { id: 'titre', entete: 'Titre', cellule: (a) => a.titre, tri: 'titre', principale: true },
  {
    id: 'statut',
    entete: 'Statut',
    cellule: (a) => (a.statut ? <PastilleStatut etat={etatAffiche(a.statut, a.publieLe)} /> : null),
    masquable: true,
  },
  { id: 'auteur', entete: 'Auteur', cellule: (a) => a.auteur?.nom ?? '—', masquable: true },
  {
    id: 'modifieLe',
    entete: 'Modifié le',
    cellule: (a) => formaterDate(a.modifieLe),
    tri: 'modifieLe',
    masquable: true,
  },
]

function Listes() {
  const [page, setPage] = useState(1)
  const [tri, setTri] = useState('-modifieLe')
  const [selection, setSelection] = useState<string[]>([])
  const [ordre, setOrdre] = useState(['Premier jalon', 'Deuxième jalon', 'Troisième jalon'])
  const requete = useQuery({
    queryKey: ['demo', 'articles', page, tri],
    queryFn: () => articles.lister({ page, pageSize: 2, tri }),
  })

  return (
    <Bloc titre="Listes">
      <TableauDonnees
        libelle="Articles"
        colonnes={COLONNES}
        lignes={requete.data?.items}
        cle={(a) => a.id}
        libelleLigne={(a) => a.titre}
        etat={requete.isPending ? 'chargement' : requete.isError ? 'erreur' : 'pret'}
        erreur={requete.error}
        surReessai={() => void requete.refetch()}
        total={requete.data?.total ?? 0}
        page={page}
        pageSize={2}
        surPage={setPage}
        tri={tri}
        surTri={setTri}
        selection={selection}
        surSelection={setSelection}
        preferences="demo-articles"
      />
      <ListeOrdonnable
        libelle="Ordre des jalons"
        elements={ordre}
        cle={(e) => e}
        nom={(e) => e}
        surOrdre={setOrdre}
      />
    </Bloc>
  )
}

function Dialogues() {
  const [confirmation, setConfirmation] = useState(false)
  const [role, setRole] = useState(false)
  const notifier = useNotifications()
  return (
    <Bloc titre="Dialogues et notifications">
      <div className="flex flex-wrap gap-2">
        <Bouton variante="danger" onClick={() => setConfirmation(true)}>
          Supprimer trois médias
        </Bouton>
        <Bouton variante="secondaire" onClick={() => setRole(true)}>
          Changer un rôle (double saisie)
        </Bouton>
        <Bouton variante="secondaire" onClick={() => notifier.succes('Article enregistré.')}>
          Notifier un succès
        </Bouton>
        <Bouton
          variante="secondaire"
          onClick={() => notifier.erreur('L’enregistrement a échoué.', 'req-demo')}
        >
          Notifier une erreur
        </Bouton>
      </div>
      <Confirmation
        ouverte={confirmation}
        titre="Supprimer les médias"
        nombre={3}
        consequence="Les fichiers seront supprimés définitivement."
        libelleConfirmer="Supprimer"
        danger
        surConfirmer={() => setConfirmation(false)}
        surAnnuler={() => setConfirmation(false)}
      />
      <Confirmation
        ouverte={role}
        titre="Passer en administrateur"
        objet="Exemple Éditeur"
        saisieAttendue="Exemple Éditeur"
        libelleConfirmer="Changer le rôle"
        surConfirmer={() => setRole(false)}
        surAnnuler={() => setRole(false)}
      />
    </Bloc>
  )
}

function Versions() {
  const liste = useQuery({
    queryKey: ['demo', 'premier-article'],
    queryFn: () => articles.lister({ pageSize: 1 }),
  })
  const id = liste.data?.items[0]?.id
  const article = useQuery({
    queryKey: ['demo', 'article', id],
    queryFn: () => articles.lire(id ?? ''),
    enabled: Boolean(id),
  })
  if (!article.data) return null
  return (
    <Bloc titre="Versions">
      <HistoriqueVersions
        ressource="articles"
        id={article.data.id}
        actuel={article.data}
        versionCourante={article.data.version}
        titre={article.data.traductions.fr?.titre ?? ''}
        surRestauration={() => void article.refetch()}
      />
    </Bloc>
  )
}
