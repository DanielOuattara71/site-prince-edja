import { useQuery } from '@tanstack/react-query'
import { FileText, Plus } from 'lucide-react'
import { useState } from 'react'
import { Controller, type Control, type FieldErrors } from 'react-hook-form'
import { cles } from '@/api/cles'
import { medias } from '@/api/endpoints/contenus'
import { destinations, episodes, offres, projets } from '@/api/endpoints/editorial'
import {
  CLES_PAGE,
  CLES_PAGE_LEGALE,
  LANGUES,
  RESSOURCES_LIABLES,
  type CibleInterne,
  type Langue,
} from '@/api/schemas/communs'
import type { CorpsRiche } from '@/api/schemas/corps-riche'
import { EditeurRiche } from '@/components/editeur/EditeurRiche'
import { SelecteurMedia } from '@/components/medias/SelecteurMedia'
import { SelecteurTags } from '@/components/tags/SelecteurTags'
import { Bouton } from '@/components/ui/Bouton'
import { Interrupteur } from '@/components/ui/Interrupteur'
import { Champ } from '@/components/ui/Champ'
import { MessageErreurChamp } from '@/components/ui/EnveloppeChamp'
import { ParLangue } from '@/components/formulaire/SelecteurLangue'
import { Select } from '@/components/ui/Select'
import { Alerte } from '@/components/ui/Alerte'
import { SelecteurCreateur } from '@/components/createurs/SelecteurCreateur'
import { EditeurVariantes, SelecteurCategorie } from '@/features/gabarits/champs-produit'
import {
  BlocsFacultatifs,
  ChoixTemplate,
  SelecteurRelations,
} from '@/features/gabarits/champs-projet'
import { ZoneTexte } from '@/components/ui/ZoneTexte'
import { PanneauGalerie } from '@/features/bijoux/PanneauGalerie'
import { PanneauImage } from '@/features/articles/PanneauImage'
import {
  TYPES_SOURCE,
  type ChampDeclaratif,
  type SourceFormulaire,
  type VarianteFormulaire,
  type Valeurs,
} from '@/features/gabarits/declaratif'
import { t, type CleTraduction } from '@/i18n/fr'
import { creerRessourceLiable } from '@/features/gabarits/liables'

/**
 * Rendu d'un champ déclaratif (D-62). Chaque contrôle porte l'`id` du chemin du champ : le
 * résumé d'erreurs et les `422` du serveur y mènent.
 */
export function ChampFormulaire({
  champ,
  control,
  erreurs,
  desactive,
  existant = false,
}: {
  champ: ChampDeclaratif
  control: Control<Valeurs>
  erreurs: FieldErrors<Valeurs>
  desactive: boolean
  /** Le contenu existe déjà : un changement de format y est signalé (ECRANS § 3.3). */
  existant?: boolean
}) {
  const erreur = (erreurs[champ.cle] as { message?: string } | undefined)?.message
  return (
    <Controller
      control={control}
      name={champ.cle}
      render={({ field, fieldState }) => {
        switch (champ.type) {
          case 'image':
            return (
              <PanneauImage
                id={champ.cle}
                libelle={champ.libelle}
                valeur={(field.value as string | null) ?? null}
                surChange={field.onChange}
                erreur={erreur}
              />
            )
          case 'pdf':
            return (
              <PanneauDocument
                id={champ.cle}
                libelle={champ.libelle}
                aide={champ.aide}
                valeur={(field.value as string | null) ?? null}
                surChange={field.onChange}
                erreur={erreur}
                desactive={desactive}
              />
            )
          case 'tags':
            return (
              <SelecteurTags
                valeur={(field.value as string[] | undefined) ?? []}
                {...(champ.contexte ? { contexte: champ.contexte } : {})}
                surChange={field.onChange}
                erreur={erreur}
              />
            )
          case 'relation':
            return (
              <SelecteurRelation
                id={champ.cle}
                libelle={champ.libelle}
                ressource={champ.ressource}
                valeur={String(field.value ?? '')}
                surChange={field.onChange}
                erreur={erreur}
              />
            )
          case 'cible':
            return (
              <SelecteurCible
                id={champ.cle}
                libelle={champ.libelle}
                aide={champ.aide}
                valeur={(field.value as CibleInterne | null) ?? null}
                surChange={field.onChange}
                erreur={erreur}
              />
            )
          case 'choix': {
            const valeur = String(field.value ?? '')
            const aide = champ.aideSelon?.[valeur] ?? champ.aide
            return (
              <div className="space-y-2">
                <Select
                  id={champ.cle}
                  libelle={champ.libelle}
                  aide={aide}
                  required={champ.obligatoire ?? false}
                  invite={t('declaratif.choisir')}
                  options={[...champ.options]}
                  erreur={erreur}
                  value={valeur}
                  onChange={(e) => field.onChange(e.target.value)}
                  onBlur={field.onBlur}
                />
                {champ.alerteChangement && fieldState.isDirty && existant ? (
                  <Alerte ton="info">{champ.alerteChangement}</Alerte>
                ) : null}
              </div>
            )
          }
          case 'categorie':
            return (
              <SelecteurCategorie
                id={champ.cle}
                libelle={champ.libelle}
                aide={champ.aide}
                famille={champ.famille}
                valeur={String(field.value ?? '')}
                surChange={field.onChange}
                erreur={erreur}
              />
            )
          case 'createur':
            return (
              <SelecteurCreateur
                valeur={(field.value as string | null) ?? null}
                surChange={field.onChange}
                erreur={erreur}
              />
            )
          case 'template':
            return (
              <ChoixTemplate
                id={champ.cle}
                libelle={champ.libelle}
                aide={champ.aide}
                valeur={String(field.value ?? '')}
                surChange={field.onChange}
                control={control}
                champFormat={champ.champFormat}
                existant={existant}
                erreur={erreur}
              />
            )
          case 'blocsProjet':
            return (
              <BlocsFacultatifs
                id={champ.cle}
                control={control}
                champTemplate={champ.champTemplate}
                champFormat={champ.champFormat}
                masques={(field.value as string[] | undefined) ?? []}
                surChange={field.onChange}
                desactive={desactive}
              />
            )
          case 'relations':
            return (
              <SelecteurRelations
                id={champ.cle}
                libelle={champ.libelle}
                aide={champ.aide}
                ressource={champ.ressource}
                valeur={(field.value as string[] | undefined) ?? []}
                surChange={field.onChange}
                erreur={erreur}
              />
            )
          case 'variantes':
            return (
              <EditeurVariantes
                id={champ.cle}
                libelle={champ.libelle}
                aide={champ.aide}
                valeur={(field.value as VarianteFormulaire[] | undefined) ?? []}
                surChange={field.onChange}
                erreurs={erreurs[champ.cle] as unknown}
                desactive={desactive}
              />
            )
          case 'booleen':
            return (
              <Interrupteur
                libelle={champ.libelle}
                aide={champ.aide}
                actif={field.value === true}
                surChange={field.onChange}
                desactive={desactive}
              />
            )
          case 'sources':
            return (
              <EditeurSources
                id={champ.cle}
                libelle={champ.libelle}
                aide={champ.aide}
                valeur={(field.value as SourceFormulaire[] | undefined) ?? []}
                surChange={field.onChange}
                erreurs={erreurs[champ.cle] as unknown}
                desactive={desactive}
              />
            )
          case 'blocs':
            return (
              <EditeurBlocs
                id={champ.cle}
                libelle={champ.libelle}
                aide={champ.aide}
                valeur={
                  (field.value as Record<Langue, Record<string, string>> | undefined) ?? {
                    fr: {},
                    en: {},
                  }
                }
                surChange={field.onChange}
              />
            )
          case 'corps':
            return (
              <EditeurCorps
                id={champ.cle}
                libelle={champ.libelle}
                aide={champ.aide}
                valeur={
                  (field.value as Record<Langue, CorpsRiche | null> | undefined) ?? {
                    fr: null,
                    en: null,
                  }
                }
                surChange={field.onChange}
              />
            )
          case 'galerie':
            return (
              <PanneauGalerie
                valeur={(field.value as string[] | undefined) ?? []}
                surChange={field.onChange}
                desactive={desactive}
              />
            )
          case 'texte':
            return champ.multiligne ? (
              <ZoneTexte
                id={champ.cle}
                libelle={champ.libelle}
                aide={champ.aide}
                required={champ.obligatoire ?? false}
                maxLength={champ.max}
                erreur={erreur}
                value={String(field.value ?? '')}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            ) : (
              <Champ
                id={champ.cle}
                libelle={champ.libelle}
                aide={champ.aide}
                required={champ.obligatoire ?? false}
                maxLength={champ.max}
                erreur={erreur}
                value={String(field.value ?? '')}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            )
          default:
            return (
              <Champ
                id={champ.cle}
                libelle={champ.libelle}
                aide={
                  champ.aide ??
                  (champ.type === 'datePartielle'
                    ? t('declaratif.datePartielle')
                    : champ.type === 'url'
                      ? t('declaratif.url')
                      : undefined)
                }
                type={champ.type === 'url' ? 'url' : 'text'}
                inputMode={champ.type === 'nombre' ? 'decimal' : undefined}
                erreur={erreur}
                value={String(field.value ?? '')}
                onChange={(e) => field.onChange(e.target.value)}
                onBlur={field.onBlur}
              />
            )
        }
      }}
    />
  )
}

/** Un document PDF de la médiathèque (guide d'épisode, de destination). */
function PanneauDocument({
  id,
  libelle,
  aide,
  valeur,
  surChange,
  erreur,
  desactive,
}: {
  id: string
  libelle: string
  aide?: string | undefined
  valeur: string | null
  surChange: (id: string | null) => void
  erreur?: string | undefined
  desactive: boolean
}) {
  const [ouvert, setOuvert] = useState(false)
  const [refus, setRefus] = useState<string | null>(null)
  const document = useQuery({
    queryKey: cles.media(valeur ?? ''),
    queryFn: () => medias.lire(valeur ?? ''),
    enabled: Boolean(valeur),
  })
  return (
    <fieldset className="space-y-2">
      <legend className="text-body font-semibold text-ink-900">{libelle}</legend>
      {aide ? <p className="text-caption text-ink-700">{aide}</p> : null}
      {valeur && document.data ? (
        <p className="flex items-center gap-2 text-caption text-ink-700">
          <FileText aria-hidden className="size-4" />
          <a href={document.data.url} className="underline" target="_blank" rel="noreferrer">
            {document.data.traductions.fr?.texteAlt || t('declaratif.documentChoisi')}
          </a>
        </p>
      ) : null}
      {desactive ? null : (
        <div className="flex flex-wrap gap-2">
          <Bouton id={id} variante="secondaire" onClick={() => setOuvert(true)}>
            {valeur ? t('declaratif.changerDocument') : t('declaratif.choisirDocument')}
          </Bouton>
          {valeur ? (
            <Bouton variante="discret" onClick={() => surChange(null)}>
              {t('bijou.retirer')}
            </Bouton>
          ) : null}
        </div>
      )}
      {refus || erreur ? <MessageErreurChamp>{refus ?? erreur}</MessageErreurChamp> : null}
      <SelecteurMedia
        ouverte={ouvert}
        titre={t('declaratif.choisirDocument')}
        surFermeture={() => setOuvert(false)}
        surChoix={(choisi) => {
          setOuvert(false)
          if (choisi.mime !== 'application/pdf') {
            setRefus(t('declaratif.pdfSeulement'))
            return
          }
          setRefus(null)
          surChange(choisi.id)
        }}
      />
    </fieldset>
  )
}

const LISTES = { episodes, destinations, offres, projets } as const

/** Un contenu lié (épisode d'une destination, destination d'un épisode). */
function SelecteurRelation({
  id,
  libelle,
  ressource,
  valeur,
  surChange,
  erreur,
}: {
  id: string
  libelle: string
  ressource: keyof typeof LISTES
  valeur: string
  surChange: (id: string) => void
  erreur?: string | undefined
}) {
  const liste = useQuery({
    queryKey: [ressource, 'liste', 'relation'],
    queryFn: () => LISTES[ressource].lister({ pageSize: 100 }),
    staleTime: 60_000,
  })
  return (
    <Select
      // Remonté quand la liste arrive : une valeur reçue d'avance (`?projetId=`) s'affiche alors.
      key={liste.isSuccess ? 'pret' : 'attente'}
      id={id}
      libelle={libelle}
      invite={t('declaratif.aucun')}
      disabled={!liste.isSuccess}
      erreur={erreur}
      value={valeur}
      onChange={(e) => surChange(e.target.value)}
      options={(liste.data?.items ?? []).map((o) => ({
        valeur: o.id,
        libelle: o.numero ? `${o.numero} — ${o.titre}` : o.titre,
      }))}
    />
  )
}

const LIBELLES_PAGE: Record<string, string> = Object.fromEntries(
  CLES_PAGE.map((cle) => [cle, cle.replaceAll('-', ' ')]),
)

/**
 * Lien interne (§ 6, `CibleInterne`) : une page fixe, une page légale ou un contenu existant,
 * jamais une adresse écrite à la main. Un contenu non publié est refusé à la publication (RG-03).
 * Exporté : la navigation du site (§ 13.4) choisit ses cibles avec le même sélecteur.
 */
export function SelecteurCible({
  id,
  libelle,
  aide,
  valeur,
  surChange,
  erreur,
}: {
  id: string
  libelle: string
  aide?: string | undefined
  valeur: CibleInterne | null
  surChange: (cible: CibleInterne | null) => void
  erreur?: string | undefined
}) {
  const type = valeur?.type ?? ''
  const ressource = valeur?.type === 'contenu' ? valeur.ressource : ''
  const contenus = useQuery({
    queryKey: [ressource, 'liste', 'cible'],
    queryFn: () => creerRessourceLiable(ressource || 'articles').lister({ pageSize: 100 }),
    enabled: Boolean(ressource),
    staleTime: 60_000,
  })

  return (
    <fieldset className="space-y-2">
      <legend className="text-body font-semibold text-ink-900">{libelle}</legend>
      {aide ? <p className="text-caption text-ink-700">{aide}</p> : null}
      <Select
        id={id}
        libelle={t('declaratif.cibleType')}
        value={type}
        erreur={erreur}
        onChange={(e) => {
          const suivant = e.target.value
          if (suivant === 'page') surChange({ type: 'page', cle: 'accueil' })
          else if (suivant === 'page-legale')
            surChange({ type: 'page-legale', cle: 'mentions-legales' })
          else if (suivant === 'contenu')
            surChange({ type: 'contenu', ressource: 'articles', id: '' })
          else surChange(null)
        }}
        options={[
          { valeur: '', libelle: t('declaratif.aucun') },
          { valeur: 'page', libelle: t('declaratif.ciblePage') },
          { valeur: 'page-legale', libelle: t('declaratif.ciblePageLegale') },
          { valeur: 'contenu', libelle: t('declaratif.cibleContenu') },
        ]}
      />
      {valeur?.type === 'page' || valeur?.type === 'ancre' ? (
        <Select
          libelle={t('declaratif.ciblePage')}
          value={valeur.cle}
          onChange={(e) =>
            surChange({ type: 'page', cle: e.target.value as (typeof CLES_PAGE)[number] })
          }
          options={CLES_PAGE.map((cle) => ({ valeur: cle, libelle: LIBELLES_PAGE[cle] ?? cle }))}
        />
      ) : null}
      {valeur?.type === 'page-legale' ? (
        <Select
          libelle={t('declaratif.ciblePageLegale')}
          value={valeur.cle}
          onChange={(e) =>
            surChange({
              type: 'page-legale',
              cle: e.target.value as (typeof CLES_PAGE_LEGALE)[number],
            })
          }
          options={CLES_PAGE_LEGALE.map((cle) => ({
            valeur: cle,
            libelle: cle.replaceAll('-', ' '),
          }))}
        />
      ) : null}
      {valeur?.type === 'contenu' ? (
        <>
          <Select
            libelle={t('declaratif.cibleRessource')}
            value={valeur.ressource}
            onChange={(e) =>
              surChange({
                type: 'contenu',
                ressource: e.target.value as (typeof RESSOURCES_LIABLES)[number],
                id: '',
              })
            }
            options={RESSOURCES_LIABLES.map((r) => ({ valeur: r, libelle: t(`menu.${r}`) }))}
          />
          <Select
            libelle={t('declaratif.cibleContenu')}
            invite={t('declaratif.choisir')}
            disabled={!contenus.isSuccess}
            value={valeur.id}
            onChange={(e) => surChange({ ...valeur, id: e.target.value })}
            options={(contenus.data?.items ?? []).map((o) => ({ valeur: o.id, libelle: o.titre }))}
          />
        </>
      ) : null}
    </fieldset>
  )
}

/**
 * Sources d'une entrée d'archive (§ 9.6) : au moins une pour publier (règle du CDC). Le bloc est
 * mis en évidence ; l'adresse est facultative (une source orale n'en a pas).
 */
function EditeurSources({
  id,
  libelle,
  aide,
  valeur,
  surChange,
  erreurs,
  desactive,
}: {
  id: string
  libelle: string
  aide?: string | undefined
  valeur: SourceFormulaire[]
  surChange: (sources: SourceFormulaire[]) => void
  erreurs: unknown
  desactive: boolean
}) {
  const erreurDe = (i: number, cle: 'libelle' | 'url') =>
    (erreurs as Record<number, Record<string, { message?: string }> | undefined> | undefined)?.[
      i
    ]?.[cle]?.message
  const changer = (i: number, partiel: Partial<SourceFormulaire>) =>
    surChange(valeur.map((s, j) => (j === i ? { ...s, ...partiel } : s)))
  return (
    <fieldset className="space-y-3 rounded-md border-2 border-clay-600 p-4">
      <legend className="px-1 text-body font-semibold text-ink-900">{libelle}</legend>
      {aide ? <p className="text-caption text-ink-700">{aide}</p> : null}
      {valeur.length === 0 ? (
        <p className="text-body text-clay-700">{t('archive.sansSource')}</p>
      ) : null}
      <ol className="space-y-4">
        {valeur.map((source, i) => (
          <li key={i} className="grid gap-3 rounded-md border border-sand-200 p-3 sm:grid-cols-2">
            <Champ
              id={`${id}.${i}.libelle`}
              libelle={`${t('archive.sourceLibelle')} ${i + 1}`}
              required
              value={source.libelle}
              erreur={erreurDe(i, 'libelle')}
              onChange={(e) => changer(i, { libelle: e.target.value })}
            />
            <Select
              libelle={`${t('archive.sourceType')} ${i + 1}`}
              value={source.type}
              onChange={(e) => changer(i, { type: e.target.value as SourceFormulaire['type'] })}
              options={TYPES_SOURCE.map((type) => ({
                valeur: type,
                libelle: t(`archive.type.${type}` as CleTraduction),
              }))}
            />
            <Champ
              id={`${id}.${i}.url`}
              type="url"
              libelle={`${t('archive.sourceUrl')} ${i + 1}`}
              value={source.url}
              erreur={erreurDe(i, 'url')}
              onChange={(e) => changer(i, { url: e.target.value })}
            />
            {desactive ? null : (
              <div className="flex items-end">
                <Bouton
                  variante="discret"
                  aria-label={`${t('bijou.retirer')} ${t('archive.sourceLibelle').toLowerCase()} ${i + 1}`}
                  onClick={() => surChange(valeur.filter((_, j) => j !== i))}
                >
                  {t('bijou.retirer')}
                </Bouton>
              </div>
            )}
          </li>
        ))}
      </ol>
      {desactive ? null : (
        <Bouton
          id={id}
          variante="secondaire"
          onClick={() => surChange([...valeur, { libelle: '', url: '', type: 'ecrite' }])}
        >
          <Plus aria-hidden className="size-4" />
          {t('archive.ajouterSource')}
        </Bouton>
      )}
    </fieldset>
  )
}

/**
 * Corps riche par langue (§ 9.16) : un seul éditeur à la fois, langue choisie en haut du formulaire (`ParLangue`, U2).
 * `EditeurRiche` est non contrôlé après montage : `key` par langue force un remontage quand on
 * change d'onglet, chaque langue garde sa valeur dans le formulaire.
 */
function EditeurCorps({
  id,
  libelle,
  aide,
  valeur,
  surChange,
}: {
  id: string
  libelle: string
  aide?: string | undefined
  valeur: Record<Langue, CorpsRiche | null>
  surChange: (corps: Record<Langue, CorpsRiche | null>) => void
}) {
  return (
    <fieldset id={id} className="space-y-3">
      <legend className="text-body font-semibold text-ink-900">{libelle}</legend>
      {aide ? <p className="text-caption text-ink-700">{aide}</p> : null}
      <ParLangue
        libelle={t('declaratif.corpsLangues')}
        onglets={LANGUES.map((l) => ({
          id: l,
          libelle: t(`langue.${l}`),
          contenu: (
            <EditeurRiche
              key={l}
              libelle={`${libelle} (${l.toUpperCase()})`}
              valeur={valeur[l]}
              surChange={(c) => surChange({ ...valeur, [l]: c })}
            />
          ),
        }))}
      />
    </fieldset>
  )
}

/**
 * Textes d'une page fixe par clé de bloc (§ 9.15). Les clés sont celles que le serveur renvoie :
 * aucune n'est ajoutée ni retirée ici (une clé inconnue serait refusée, `422`).
 */
function EditeurBlocs({
  id,
  libelle,
  aide,
  valeur,
  surChange,
}: {
  id: string
  libelle: string
  aide?: string | undefined
  valeur: Record<Langue, Record<string, string>>
  surChange: (blocs: Record<Langue, Record<string, string>>) => void
}) {
  const clesBlocs = [...new Set(LANGUES.flatMap((l) => Object.keys(valeur[l])))].sort()
  return (
    <fieldset id={id} className="space-y-3">
      <legend className="text-body font-semibold text-ink-900">{libelle}</legend>
      {aide ? <p className="text-caption text-ink-700">{aide}</p> : null}
      {clesBlocs.length === 0 ? (
        <p className="text-body text-ink-700">{t('page.aucunBloc')}</p>
      ) : null}
      {clesBlocs.map((cle) => (
        <div key={cle} className="grid gap-3 rounded-md border border-sand-200 p-3 sm:grid-cols-2">
          {LANGUES.map((langue) => (
            <ZoneTexte
              key={langue}
              libelle={`${cle} (${langue.toUpperCase()})`}
              value={valeur[langue][cle] ?? ''}
              onChange={(e) =>
                surChange({ ...valeur, [langue]: { ...valeur[langue], [cle]: e.target.value } })
              }
            />
          ))}
        </div>
      ))}
    </fieldset>
  )
}
