import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ArrowUpDown } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { cles } from '@/api/cles'
import { medias } from '@/api/endpoints/contenus'
import { LANGUES, type Langue } from '@/api/schemas/communs'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { ApercuSite } from '@/components/apercu/ApercuSite'
import { ChampTraduit } from '@/components/formulaire/ChampTraduit'
import { ListeOrdonnable } from '@/components/listes/ListeOrdonnable'
import type { Colonne } from '@/components/listes/TableauDonnees'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { CLASSES_LIEN } from '@/components/ui/classes'
import { EtatErreur } from '@/components/ui/Etats'
import { IndicateurAFournir } from '@/components/ui/IndicateurAFournir'
import { Onglets } from '@/components/ui/Onglets'
import { PastilleStatut } from '@/components/ui/PastilleStatut'
import { Squelette } from '@/components/ui/Squelette'
import { ChampFormulaire } from '@/features/gabarits/champs'
import {
  champsConnus,
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
import { t } from '@/i18n/fr'
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
  const editeur = useEditeurContenu<ContenuDeclaratif, Valeurs>({
    ressource: spec.ressource,
    chemin: spec.chemin,
    initial,
    surCree,
    schema,
    valeursDepuis: (c) => valeursDepuis(spec, c),
    valeursVides: () => valeursVides(spec),
    champs: champsConnus(spec),
    creer: (valeurs) => spec.api.creer(versEntree(spec, valeurs) as never),
    modifier: (valeurs, c) => spec.api.modifier(c.id, versModification(spec, valeurs, c) as never),
    transition: (id, demande) => spec.api.transition(id, demande),
    cle: cleDetail(spec),
  })
  const { formulaire, contenu, modifiable } = editeur
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
  const suggestion = editeur.suggestion
  const langueSuggestion = suggestion?.champ.split('.')[1]

  const champsTraduits = spec.traduits.map((champ) => (
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
      {spec.slug && champ.cle === spec.champTitre ? (
        <ChampTraduit
          nom="slug"
          libelle={t('article.slug')}
          aide={t('article.slugAide')}
          valeurs={valeurTraduite('slug')}
          erreurs={erreurDe('slug')}
          surChange={(langue, valeur) => {
            setSlugManuel((actuel) => ({ ...actuel, [langue]: true }))
            ecrire('slug')(langue, valeur)
          }}
        />
      ) : null}
      {spec.slug &&
      champ.cle === spec.champTitre &&
      suggestion &&
      (langueSuggestion === 'fr' || langueSuggestion === 'en') ? (
        <Alerte ton="info">
          <p>{t('article.slugPris')}</p>
          <Bouton
            variante="secondaire"
            onClick={() => {
              ecrire('slug')(langueSuggestion, suggestion.valeur)
              setSlugManuel((actuel) => ({ ...actuel, [langueSuggestion]: true }))
              editeur.effacerSuggestion()
            }}
          >
            {t('article.utiliserSlug')} « {suggestion.valeur} »
          </Bouton>
        </Alerte>
      ) : null}
    </div>
  ))

  const form = (
    <form
      noValidate
      onSubmit={(evenement) => void editeur.soumettre(evenement)}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <fieldset disabled={!modifiable} className="min-w-0 space-y-6">
        <legend className="sr-only">{t('article.contenu')}</legend>
        {spec.principal.map((champ) => (
          <ChampFormulaire
            key={champ.cle}
            champ={champ}
            control={control}
            erreurs={formState.errors}
            desactive={!modifiable}
          />
        ))}
        {champsTraduits}
      </fieldset>
      <aside className="space-y-6">
        <fieldset disabled={!modifiable} className="space-y-6">
          <legend className="sr-only">{t('declaratif.reglages')}</legend>
          {spec.lateral.map((champ) => (
            <ChampFormulaire
              key={champ.cle}
              champ={champ}
              control={control}
              erreurs={formState.errors}
              desactive={!modifiable}
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
      cheminListe={spec.chemin}
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
  const langues = LANGUES.filter((l) => valeurs.traductions[l][spec.champTitre]?.trim())
  if (langues.length === 0) {
    return <p className="text-body text-ink-700">{t('declaratif.apercuVide')}</p>
  }
  const numero = typeof valeurs['numero'] === 'string' ? valeurs['numero'] : ''
  return (
    <Onglets
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
                  {traduction[spec.champTitre]}
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

export function ListeDeclarative({ spec }: { spec: SpecRessource }) {
  const { moi } = useSession()
  const ordonnable = spec.ordonnable && peut(moi?.compte, 'ordonner', spec.ressource)
  return (
    <ListePage
      titre={spec.titreListe}
      ressource={spec.ressource}
      colonnes={colonnesDeclaratives(spec)}
      charger={(parametres, propres) => spec.api.lister(parametres, undefined, propres)}
      creer={
        !spec.fermee && peut(moi?.compte, 'creer', spec.ressource)
          ? { chemin: `${spec.chemin}/nouveau`, libelle: spec.nouveau }
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
 * La liste complète est envoyée à chaque déplacement (`PATCH /{r}/ordre`, § 8).
 */
function PanneauOrdre({ spec }: { spec: SpecRessource }) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const [ouvert, setOuvert] = useState(false)
  const cle = [spec.ressource, 'liste', 'ordre'] as const
  const liste = useQuery({
    queryKey: cle,
    queryFn: () => spec.api.lister({ pageSize: 100, tri: 'ordre' }),
    enabled: ouvert,
  })
  const ordonner = useMutation({
    mutationFn: (ids: string[]) => spec.api.ordonner(ids),
    onSuccess: () => notifier.succes(t('ordre.enregistre')),
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
    onSettled: () => client.invalidateQueries({ queryKey: [spec.ressource] }),
  })

  return (
    <section className="space-y-3">
      <Bouton variante="secondaire" aria-expanded={ouvert} onClick={() => setOuvert((v) => !v)}>
        <ArrowUpDown aria-hidden className="size-4" />
        {ouvert ? t('ordre.fermer') : t('ordre.ouvrir')}
      </Bouton>
      {ouvert ? (
        liste.isPending ? (
          <Squelette lignes={4} />
        ) : liste.isError ? (
          <EtatErreur erreur={liste.error} surReessai={() => void liste.refetch()} />
        ) : (
          <ListeOrdonnable
            libelle={t('ordre.titre')}
            elements={liste.data.items}
            cle={(o) => o.id}
            nom={(o) => o.titre || t('declaratif.sansTitre')}
            desactivee={ordonner.isPending}
            surOrdre={(nouveaux) => {
              client.setQueryData(cle, { ...liste.data, items: nouveaux })
              ordonner.mutate(nouveaux.map((o) => o.id))
            }}
          />
        )
      ) : null}
    </section>
  )
}
