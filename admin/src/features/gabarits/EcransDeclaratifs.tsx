import { useMutation, useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useWatch } from 'react-hook-form'
import { Link, useSearchParams } from 'react-router'
import { cles } from '@/api/cles'
import { medias } from '@/api/endpoints/contenus'
import { destinations, projets } from '@/api/endpoints/editorial'
import { LANGUES, type Langue } from '@/api/schemas/communs'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { ApercuSite } from '@/components/apercu/ApercuSite'
import { ChampTraduit } from '@/components/formulaire/ChampTraduit'
import { suggestionAdresse } from '@/components/formulaire/langue-formulaire'
import { ChampAdresse, SectionAvancee } from '@/components/formulaire/SectionAvancee'
import { ListeOrdonnable } from '@/components/listes/ListeOrdonnable'
import type { Colonne } from '@/components/listes/TableauDonnees'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Bouton } from '@/components/ui/Bouton'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { EtatErreur } from '@/components/ui/Etats'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { ParLangue } from '@/components/formulaire/SelecteurLangue'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { Squelette } from '@/components/ui/Squelette'
import { ChampFormulaire } from '@/features/gabarits/champs'
import {
  champsConnus,
  avecTemplateDuFormat,
  champVisible,
  libellesDe,
  schemaFormulaire,
  valeursDepuis,
  valeursVides,
  versEntree,
  versModification,
  type ContenuDeclaratif,
  type ResumeDeclaratif,
  type SpecRessource,
  type Valeurs,
} from '@/features/gabarits/declaratif'
import {
  ActionsLaterales,
  GabaritFormulaire,
  PageFormulaire,
  type ProprietesEditeur,
} from '@/features/gabarits/editeur'
import { ListePage, type ActionGroupee } from '@/features/gabarits/ListePage'
import { useEditeurContenu } from '@/features/gabarits/useEditeurContenu'
import type { ElementFilAriane } from '@/components/layout/FilAriane'
import { nomCategorie, useCategories } from '@/features/categories/useCategories'
import { t } from '@/i18n/fr'
import { TEMPLATES_PROJET } from '@/lib/templates'
import { formaterDate } from '@/lib/dates'
import { messageErreur } from '@/lib/message-erreur'
import { slugifier } from '@/lib/slug'
import { etatAffiche } from '@/lib/statuts'

/**
 * Écrans d'une famille déclarative (D-62) : liste (gabarit de liste, ordre d'affichage pour les
 * familles ordonnables) et formulaire (gabarit de formulaire, aperçu, historique). Une famille
 * n'écrit que sa description (`SpecRessource`).
 */

const cleDetail = (spec: SpecRessource) => (id: string) => [spec.ressource, 'detail', id] as const

export function FormulaireDeclaratif({ spec }: { spec: SpecRessource }) {
  return (
    <PageFormulaire
      cle={cleDetail(spec)}
      lire={(id) => spec.api.lire(id)}
      editeur={EditeurDeclaratif}
      proprietes={{ spec }}
    />
  )
}

function EditeurDeclaratif({
  contenu: initial,
  surCree,
  spec,
}: ProprietesEditeur<ContenuDeclaratif> & { spec: SpecRessource }) {
  const schema = useMemo(() => schemaFormulaire(spec), [spec])
  const libelles = useMemo(() => libellesDe(spec), [spec])
  // Création depuis une carte du hub ou une fiche : `?format=Série`, `?projetId=…` préremplissent
  // les champs directs de même nom (ECRANS § 3.2, § 3.3). Rien d'autre n'est lu de l'adresse.
  const [adresse] = useSearchParams()
  const prerempli = Object.fromEntries(
    [...spec.principal, ...spec.lateral]
      .filter(
        (c) =>
          (c.type === 'choix' || c.type === 'relation' || c.type === 'template') &&
          adresse.get(c.cle),
      )
      .filter(
        (c) =>
          c.type !== 'template' ||
          (TEMPLATES_PROJET as readonly string[]).includes(adresse.get(c.cle) ?? ''),
      )
      .filter((c) => c.type !== 'choix' || c.options.some((o) => o.valeur === adresse.get(c.cle)))
      .map((c) => [c.cle, adresse.get(c.cle) ?? '']),
  )
  const editeur = useEditeurContenu<ContenuDeclaratif, Valeurs>({
    ressource: spec.ressource,
    chemin: spec.chemin,
    initial,
    surCree,
    schema,
    valeursDepuis: (c) => valeursDepuis(spec, c),
    valeursVides: () => avecTemplateDuFormat(spec, { ...valeursVides(spec), ...prerempli }),
    champs: champsConnus(spec),
    creer: (valeurs) => spec.api.creer(versEntree(spec, valeurs) as never),
    modifier: (valeurs, c) => spec.api.modifier(c.id, versModification(spec, valeurs, c) as never),
    transition: (id, demande) => spec.api.transition(id, demande),
    cle: cleDetail(spec),
  })
  const { formulaire, contenu, modifiable } = editeur
  const Complement = spec.complement
  const { control, formState, setValue } = formulaire
  const valeurs = useWatch({ control }) as Valeurs
  const [slugManuel, setSlugManuel] = useState<Record<Langue, boolean>>({
    fr: Boolean(initial?.traductions.fr?.['slug']),
    en: Boolean(initial?.traductions.en?.['slug']),
  })
  const titreLu = (c: ContenuDeclaratif | null) => {
    const brut = c?.traductions.fr?.[spec.champTitre] ?? c?.traductions.en?.[spec.champTitre]
    return typeof brut === 'string' ? brut : ''
  }
  const numero = typeof contenu?.['numero'] === 'string' ? contenu['numero'] : null
  const titre = contenu
    ? `${numero ? `${numero} — ` : ''}${titreLu(contenu) || t('declaratif.sansTitre')}`
    : spec.nouveau

  const erreurDe = (cle: string) =>
    Object.fromEntries(
      LANGUES.map((l) => [
        l,
        (formState.errors.traductions?.[l] as Record<string, { message?: string }> | undefined)?.[
          cle
        ]?.message,
      ]),
    ) as Partial<Record<Langue, string>>
  const valeurTraduite = (cle: string) => ({
    fr: valeurs.traductions.fr[cle] ?? '',
    en: valeurs.traductions.en[cle] ?? '',
  })
  const ecrire = (cle: string) => (langue: Langue, valeur: string) =>
    setValue(`traductions.${langue}.${cle}`, valeur, { shouldDirty: true })
  const adresseProposee = suggestionAdresse(editeur.suggestion)

  const champsTraduits = spec.traduits
    .filter((champ) => champVisible(champ, valeurs))
    .map((champ) => (
      <div key={champ.cle} className="space-y-6">
        <ChampTraduit
          nom={champ.cle}
          libelle={champ.libelle}
          {...(champ.aide ? { aide: champ.aide } : {})}
          requis={champ.requis ?? false}
          multiligne={champ.multiligne ?? false}
          {...(champ.max ? { maxLength: champ.max } : {})}
          valeurs={valeurTraduite(champ.cle)}
          erreurs={erreurDe(champ.cle)}
          surChange={(langue, valeur) => {
            ecrire(champ.cle)(langue, valeur)
            if (spec.slug && champ.cle === spec.champTitre && !slugManuel[langue]) {
              ecrire('slug')(langue, slugifier(valeur))
            }
          }}
        />
      </div>
    ))

  // Adresse de la page rangée dans « Avancé » (U3), tirée du titre, toujours modifiable.
  const avance = spec.slug ? (
    <SectionAvancee ouverte={Boolean(adresseProposee) || LANGUES.some((l) => erreurDe('slug')[l])}>
      <ChampAdresse
        valeurs={valeurTraduite('slug')}
        erreurs={erreurDe('slug')}
        surChange={(langue, valeur) => {
          setSlugManuel((actuel) => ({ ...actuel, [langue]: true }))
          ecrire('slug')(langue, valeur)
        }}
        suggestion={adresseProposee}
        surSuggestion={(langue, valeur) => {
          ecrire('slug')(langue, valeur)
          setSlugManuel((actuel) => ({ ...actuel, [langue]: true }))
          editeur.effacerSuggestion()
        }}
      />
    </SectionAvancee>
  ) : null

  const form = (
    <form
      noValidate
      onSubmit={(evenement) => void editeur.soumettre(evenement)}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <fieldset disabled={!modifiable} className="min-w-0 space-y-6">
        <legend className="sr-only">{t('article.contenu')}</legend>
        {/* Le choix du template ouvre le formulaire : il décide des champs qui suivent. */}
        {[
          ...spec.principal.filter((champ) => champ.type === 'template'),
          ...(spec.principalApres ? [] : spec.principal.filter((c) => c.type !== 'template')),
        ]
          .filter((champ) => champVisible(champ, valeurs))
          .map((champ) => (
            <ChampFormulaire
              key={champ.cle}
              champ={champ}
              control={control}
              erreurs={formState.errors}
              desactive={!modifiable}
              existant={Boolean(contenu)}
            />
          ))}
        {champsTraduits}
        {spec.principalApres
          ? spec.principal
              .filter((champ) => champ.type !== 'template' && champVisible(champ, valeurs))
              .map((champ) => (
                <ChampFormulaire
                  key={champ.cle}
                  champ={champ}
                  control={control}
                  erreurs={formState.errors}
                  desactive={!modifiable}
                  existant={Boolean(contenu)}
                />
              ))
          : null}
        {avance}
        {Complement ? <Complement contenu={contenu} /> : null}
      </fieldset>
      <aside className="space-y-6">
        <fieldset disabled={!modifiable} className="space-y-6">
          <legend className="sr-only">{t('declaratif.reglages')}</legend>
          {spec.lateral
            .filter((champ) => champVisible(champ, valeurs))
            .map((champ) => (
              <ChampFormulaire
                key={champ.cle}
                champ={champ}
                control={control}
                erreurs={formState.errors}
                desactive={!modifiable}
                existant={Boolean(contenu)}
              />
            ))}
        </fieldset>
        <ActionsLaterales editeur={editeur} libelles={libelles} />
      </aside>
    </form>
  )

  return (
    <GabaritFormulaire
      editeur={editeur}
      titreListe={spec.titreListe}
      cheminListe={spec.cheminListe ?? spec.chemin}
      {...(spec.parent ? { parent: spec.parent } : {})}
      titre={titre}
      formulaire={form}
      apercu={<ApercuDeclaratif spec={spec} valeurs={valeurs} />}
      libelles={libelles}
      versionnee={spec.ressource}
      versChamp={(champ) =>
        /^traductions\.(fr|en)$/.test(champ) ? `${champ}.${spec.champTitre}` : champ
      }
    />
  )
}

/**
 * Aperçu simple et fidèle : le titre, la première image, puis chaque texte saisi dans l'ordre de
 * la fiche. Rien n'est ajouté : un texte vide n'apparaît pas.
 */
function ApercuDeclaratif({ spec, valeurs }: { spec: SpecRessource; valeurs: Valeurs }) {
  const champImage = [...spec.principal, ...spec.lateral].find((c) => c.type === 'image')
  const imageId = champImage ? (valeurs[champImage.cle] as string | null) : null
  const image = useQuery({
    queryKey: cles.media(imageId ?? ''),
    queryFn: () => medias.lire(imageId ?? ''),
    enabled: Boolean(imageId),
  })
  const langues = LANGUES.filter((l) =>
    spec.titreFacultatif
      ? Object.values(valeurs.traductions[l]).some((v) => typeof v === 'string' && v.trim())
      : valeurs.traductions[l][spec.champTitre]?.trim(),
  )
  if (langues.length === 0) {
    return <p className="text-body text-ink-700">{t('declaratif.apercuVide')}</p>
  }
  const numero = typeof valeurs['numero'] === 'string' ? valeurs['numero'] : ''
  return (
    <ParLangue
      libelle={t('article.apercu')}
      onglets={langues.map((langue) => {
        const traduction = valeurs.traductions[langue]
        return {
          id: langue,
          libelle: t(`langue.${langue}`),
          contenu: (
            <ApercuSite libelle={`${t('article.apercu')} (${langue.toUpperCase()})`}>
              <header className="space-y-2">
                {numero ? <p className="label-caps text-ink-500">{numero}</p> : null}
                <h1 className="font-display text-display-lg text-ink-900 uppercase">
                  {traduction[spec.champTitre] || t('declaratif.sansTitre')}
                </h1>
              </header>
              {image.data ? (
                <img
                  src={image.data.url}
                  alt={image.data.decoratif ? '' : (image.data.traductions[langue]?.texteAlt ?? '')}
                  className="aspect-[3/2] w-full rounded-xl bg-sand-200 object-cover"
                />
              ) : null}
              {spec.traduits
                .filter((c) => c.cle !== spec.champTitre && traduction[c.cle]?.trim())
                .map((c) => (
                  <section key={c.cle} className="space-y-1">
                    <h2 className="label-caps text-ink-700">{c.libelle}</h2>
                    <p className="text-body whitespace-pre-line text-ink-700">
                      {traduction[c.cle]}
                    </p>
                  </section>
                ))}
            </ApercuSite>
          ),
        }
      })}
    />
  )
}

function colonnesDeclaratives(spec: SpecRessource): Colonne<ResumeDeclaratif>[] {
  return [
    ...(spec.colonneIdentifiant
      ? [
          {
            id: spec.colonneIdentifiant.champ,
            entete: spec.colonneIdentifiant.libelle,
            ...(spec.colonneIdentifiant.champ === 'numero' ? { tri: 'numero' } : {}),
            cellule: (o: ResumeDeclaratif) => o[spec.colonneIdentifiant?.champ ?? 'numero'] ?? '—',
          },
        ]
      : []),
    {
      id: 'titre',
      entete: t('article.titre'),
      principale: true,
      cellule: (o) => (
        <Link to={`${spec.chemin}/${o.id}`} className={CLASSES_LIEN}>
          {o.titre || t('declaratif.sansTitre')}
        </Link>
      ),
    },
    ...(spec.colonnes ?? []),
    {
      id: 'statut',
      entete: t('liste.statut'),
      cellule: (o) => (
        <span className="flex flex-wrap gap-1">
          {o.statut ? <PastilleStatut etat={etatAffiche(o.statut, o.publieLe)} /> : null}
          <IndicateurAFournir champs={o.champsAFournir} />
        </span>
      ),
    },
    {
      id: 'langues',
      entete: t('liste.langues'),
      masquable: true,
      cellule: (o) => o.languesPresentes.map((l) => l.toUpperCase()).join(' · ') || '—',
    },
    {
      id: 'modifieLe',
      entete: t('liste.modifieLe'),
      tri: 'modifieLe',
      masquable: true,
      cellule: (o) => formaterDate(o.modifieLe),
    },
  ]
}

export function ListeDeclarative({
  spec,
  titre = spec.titreListe,
  filAriane,
}: {
  spec: SpecRessource
  /** Titre propre (liste des projets d'un format : « Template Série »). */
  titre?: string
  filAriane?: ElementFilAriane[]
}) {
  const { moi } = useSession()
  const ordonnable = spec.ordonnable && peut(moi?.compte, 'ordonner', spec.ressource)
  const [adresse] = useSearchParams()
  const categoriesFamille = useCategories(spec.filtreCategorie ?? 'produit')
  const relations = useQueries({
    queries: (spec.filtresRelation ?? []).map((f) => ({
      queryKey: [f.ressource, 'liste', 'relation'],
      queryFn: () => (f.ressource === 'projets' ? projets : destinations).lister({ pageSize: 100 }),
      staleTime: 60_000,
    })),
  })
  const filtres = [
    ...(spec.filtres ?? []),
    ...(spec.filtreCategorie
      ? [
          {
            cle: 'categorie',
            libelle: t('article.categorie'),
            options: (categoriesFamille.data?.items ?? []).map((c) => ({
              valeur: c.id,
              libelle: nomCategorie(c),
            })),
          },
        ]
      : []),
    ...(spec.filtresRelation ?? []).map((f, i) => ({
      cle: f.cle,
      libelle: f.libelle,
      options: (relations[i]?.data?.items ?? []).map((o) => ({
        valeur: o.id,
        libelle: o.numero ? ` — ` : o.titre,
      })),
    })),
  ]
  // « Créer un projet » depuis une carte de template : le format suit (ECRANS § 3.2).
  // (et le template, depuis sa carte) : le filtre de la liste préremplit la création.
  const repris = new URLSearchParams()
  for (const cle of ['template', 'format']) {
    const valeur = adresse.get(cle)
    if (valeur && spec.filtres?.some((f) => f.cle === cle)) repris.set(cle, valeur)
  }
  const suite = repris.size > 0 ? `?${repris.toString()}` : ''
  return (
    <ListePage
      titre={titre}
      ressource={spec.ressource}
      colonnes={colonnesDeclaratives(spec)}
      charger={(parametres, propres) => spec.api.lister(parametres, undefined, propres)}
      filtres={filtres}
      filAriane={filAriane ?? (spec.parent ? [spec.parent] : [])}
      creer={
        !spec.fermee && peut(moi?.compte, 'creer', spec.ressource)
          ? { chemin: `${spec.chemin}/nouveau${suite}`, libelle: spec.nouveau }
          : undefined
      }
      complement={ordonnable ? <PanneauOrdre spec={spec} /> : null}
      actionsGroupees={[
        ...(spec.fermee
          ? []
          : ([
              {
                id: 'supprimer',
                libelle: t('liste.supprimer'),
                danger: true,
                autorisee: (compte) => peut(compte, 'supprimer', spec.ressource),
                executer: (o) => spec.api.supprimer(o.id, o.version),
                confirmation: {
                  titre: t('liste.supprimerTitre'),
                  consequence: t('liste.supprimerTexte'),
                },
              },
            ] satisfies ActionGroupee<ResumeDeclaratif>[])),
      ]}
    />
  )
}

/**
 * Ordre d'affichage sur le site (section 9 : « glisser-déposer avec alternative clavier »).
 * Une liste complète par groupe est envoyée à chaque déplacement (`PATCH /{r}/ordre`, § 8) ; la
 * galerie (§ 9.9) s'ordonne par emplacement, un panneau par groupe, les autres familles d'un bloc.
 */
function PanneauOrdre({ spec }: { spec: SpecRessource }) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const { groupeOrdre, libelles } = spec
  const [ouvert, setOuvert] = useState(false)
  const cleRequete = [spec.ressource, 'liste', 'ordre'] as const
  const liste = useQuery({
    queryKey: cleRequete,
    queryFn: () => spec.api.lister({ pageSize: 100, tri: 'ordre' }),
    enabled: ouvert,
  })
  const ordonner = useMutation({
    mutationFn: (ids: string[]) => spec.api.ordonner(ids),
    onSuccess: () => notifier.succes(t('ordre.enregistre')),
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
    onSettled: () => client.invalidateQueries({ queryKey: [spec.ressource] }),
  })

  /** Groupes d'ordre (`galerie` ordonnée par `emplacement`) : un bloc par valeur. */
  const groupes = useMemo(() => {
    if (!liste.data) return []
    if (!groupeOrdre) return [{ cle: '', libelle: null as string | null, items: liste.data.items }]
    const par = new Map<string, ResumeDeclaratif[]>()
    for (const o of liste.data.items) {
      const cleGroupe = String((o as unknown as Record<string, unknown>)[groupeOrdre] ?? '')
      par.set(cleGroupe, [...(par.get(cleGroupe) ?? []), o])
    }
    return [...par.entries()].map(([cleGroupe, items]) => ({
      cle: cleGroupe,
      libelle: libelles[cleGroupe] ?? cleGroupe,
      items,
    }))
  }, [liste.data, groupeOrdre, libelles])

  return (
    <section className="space-y-3">
      <Bouton variante="secondaire" aria-expanded={ouvert} onClick={() => setOuvert((v) => !v)}>
        <ArrowUpDown aria-hidden className="size-4" />
        {ouvert ? t('ordre.fermer') : t('ordre.ouvrir')}
      </Bouton>
      {ouvert && liste.data ? (
        groupes.map((groupe) => (
          <div key={groupe.cle} className="space-y-2">
            {groupe.libelle ? <h3 className="label-caps text-ink-700">{groupe.libelle}</h3> : null}
            <ListeOrdonnable
              libelle={groupe.libelle ?? t('ordre.titre')}
              elements={groupe.items}
              cle={(o) => o.id}
              nom={(o) => o.titre || t('declaratif.sansTitre')}
              desactivee={ordonner.isPending}
              surOrdre={(nouveaux) => {
                if (spec.groupeOrdre) {
                  ordonner.mutate(nouveaux.map((o) => o.id))
                } else {
                  client.setQueryData(cleRequete, { ...liste.data, items: nouveaux })
                  ordonner.mutate(nouveaux.map((o) => o.id))
                }
              }}
            />
          </div>
        ))
      ) : ouvert && liste.isPending ? (
        <Squelette lignes={4} />
      ) : ouvert && liste.isError ? (
        <EtatErreur erreur={liste.error} surReessai={() => void liste.refetch()} />
      ) : null}
    </section>
  )
}
