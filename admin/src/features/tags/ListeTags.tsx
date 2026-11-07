import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { tags } from '@/api/endpoints/contenus'
import { estErreurApi } from '@/api/erreurs'
import type { Tag, TypeTag } from '@/api/schemas/tags'
import { TYPES_TAG } from '@/api/schemas/tags'
import { peut } from '@/auth/permissions'
import { useSession } from '@/auth/contexte-session'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { TableauDonnees, type Colonne, type EtatTableau } from '@/components/listes/TableauDonnees'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { Confirmation } from '@/components/ui/Confirmation'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { Select, type OptionSelect } from '@/components/ui/Select'
import { Squelette } from '@/components/ui/Squelette'
import { t, type CleTraduction } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'

/**
 * Écran `/tags` (journaux, pays, thèmes…). Les éditeurs lisent ; seuls admins et super-admins créent,
 * modifient ou suppriment. Un tag en usage n'est jamais supprimé (RG-08).
 */

const OPTIONS_TYPE: OptionSelect[] = TYPES_TAG.map((type) => ({
  valeur: type,
  libelle: t(`tags.type.${type}` as CleTraduction),
}))

/** Ligne de code : composant de niveau module, pas de définition dans le rendu. */
function LigneCode({ tag }: { tag: Tag }) {
  return <span className="font-semibold text-ink-900">{tag.code}</span>
}

/** Ligne d’actions : composant de niveau module, les actions passent en props. */
function LigneActions({
  tag,
  onModifier,
  onSupprimer,
}: {
  tag: Tag
  onModifier: (tag: Tag) => void
  onSupprimer: (tag: Tag) => void
}) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <Bouton
        type="button"
        variante="secondaire"
        onClick={() => onModifier(tag)}
        aria-label={`${t('tags.modifier')} « ${tag.code} »`}
      >
        {t('tags.modifier')}
      </Bouton>
      <Bouton
        type="button"
        variante="discret"
        onClick={() => onSupprimer(tag)}
        aria-label={`${t('liste.supprimer')} « ${tag.code} »`}
      >
        {t('liste.supprimer')}
      </Bouton>
    </div>
  )
}

const COLONNES_STATIQUES: Colonne<Tag>[] = [
  {
    id: 'code',
    entete: t('tags.code'),
    tri: 'code',
    principale: true,
    cellule: (tag) => <LigneCode tag={tag} />,
  },
  {
    id: 'type',
    entete: t('tags.type'),
    cellule: (tag) => t(`tags.type.${tag.type}` as CleTraduction),
  },
  { id: 'fr', entete: 'Libellé (FR)', cellule: (tag) => tag.traductions.fr?.libelle ?? '—' },
  { id: 'en', entete: 'Libellé (EN)', cellule: (tag) => tag.traductions.en?.libelle ?? '—' },
  {
    id: 'usages',
    entete: t('tags.usages'),
    alignement: 'droite',
    cellule: (tag) => tag.usages,
  },
]

/** Colonne « actions » : usine au niveau module, les actions partent en props. */
function colonneActions(
  onModifier: (tag: Tag) => void,
  onSupprimer: (tag: Tag) => void,
): Colonne<Tag> {
  return {
    id: 'actions',
    entete: '',
    masquable: false,
    alignement: 'droite',
    cellule: (tag) => <LigneActions tag={tag} onModifier={onModifier} onSupprimer={onSupprimer} />,
  }
}

export default function ListeTags() {
  const { moi } = useSession()
  const notifier = useNotifications()
  const client = useQueryClient()
  const admin = peut(moi?.compte, 'creer', 'tags')
  const [page, setPage] = useState(1)
  const pageSize = 20
  const [q, setQ] = useState('')
  const [type, setType] = useState<string>('')
  const [edition, setEdition] = useState<Tag | 'nouveau' | null>(null)
  const [suppression, setSuppression] = useState<Tag | null>(null)

  const requete = useQuery({
    queryKey: ['tags', 'liste', page, pageSize, q, type],
    queryFn: () =>
      tags.lister({ page, pageSize }, undefined, {
        ...(q.trim() ? { q: q.trim() } : {}),
        ...(type ? { type } : {}),
      }),
  })

  const colonnes: Colonne<Tag>[] = admin
    ? [...COLONNES_STATIQUES, colonneActions(setEdition, setSuppression)]
    : COLONNES_STATIQUES

  const etat: EtatTableau = requete.isPending ? 'chargement' : requete.isError ? 'erreur' : 'pret'
  const lignes = requete.data?.items ?? []
  const total = requete.data?.total ?? 0

  const confirmerSuppression = useMutation({
    mutationFn: (tag: Tag) => tags.supprimer(tag.id, tag.version),
    onSuccess: () => {
      setSuppression(null)
      notifier.succes(t('formulaire.enregistre'))
      void client.invalidateQueries({ queryKey: ['tags'] })
    },
    onError: (erreur) =>
      notifier.erreur(messageErreur(erreur), estErreurApi(erreur) ? erreur.requeteId : undefined),
  })

  return (
    <section className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <FilAriane elements={[{ libelle: t('menu.tags') }]} />
          <TitrePage titre={t('menu.tags')}>{t('menu.tags')}</TitrePage>
          <p className="mt-2 max-w-3xl text-body text-ink-700">{t('tags.intro')}</p>
        </div>
        {admin ? (
          <Bouton onClick={() => setEdition('nouveau')}>
            <Plus aria-hidden className="size-4" />
            {t('tags.creer')}
          </Bouton>
        ) : null}
      </div>

      <div className="flex flex-wrap items-end gap-3 rounded-md border border-sand-200 bg-sand-100 p-4">
        <search className="flex min-w-48 flex-1">
          <label htmlFor="tags-recherche" className="sr-only">
            {t('tags.rechercher')}
          </label>
          <input
            id="tags-recherche"
            type="search"
            value={q}
            maxLength={120}
            placeholder={t('tags.rechercher')}
            className="min-h-11 w-full rounded-md border border-sand-200 bg-sand-50 px-3 text-body text-ink-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-clay-600"
            onChange={(evenement) => {
              setQ(evenement.target.value)
              setPage(1)
            }}
          />
        </search>
        <Select
          libelle={t('tags.type')}
          value={type}
          onChange={(evenement) => {
            setType(evenement.target.value)
            setPage(1)
          }}
          options={[{ valeur: '', libelle: t('tags.tousLesTypes') }, ...OPTIONS_TYPE]}
        />
      </div>

      {etat === 'chargement' ? <Squelette lignes={8} /> : null}
      {etat === 'erreur' ? (
        <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
      ) : null}

      {etat === 'pret' ? (
        <TableauDonnees<Tag>
          libelle={t('menu.tags')}
          colonnes={colonnes}
          lignes={lignes}
          cle={(tag) => tag.id}
          etat={etat}
          total={total}
          page={page}
          pageSize={pageSize}
          surPage={setPage}
          vide={
            <EtatVide
              titre={q ? t('tags.aucunResultat') : t('tags.aucun')}
              texte={t('tags.videAide')}
            />
          }
          preferences="tags"
        />
      ) : null}

      {edition ? (
        <DialogueTag
          tag={edition === 'nouveau' ? null : edition}
          surFermeture={() => setEdition(null)}
        />
      ) : null}
      {suppression ? (
        <Confirmation
          ouverte
          titre={t('tags.supprimerTitre')}
          objet={suppression.code}
          consequence={t('tags.supprimerTexte')}
          libelleConfirmer={t('liste.supprimer')}
          danger
          enCours={confirmerSuppression.isPending}
          surConfirmer={() => confirmerSuppression.mutate(suppression)}
          surAnnuler={() => setSuppression(null)}
        />
      ) : null}
    </section>
  )
}

/** Création ou modification d’un tag : type immuable, code unique par type, version pour le verrou optimiste. */
function DialogueTag({ tag, surFermeture }: { tag: Tag | null; surFermeture: () => void }) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const [type, setType] = useState<TypeTag>(tag?.type ?? 'format')
  const [code, setCode] = useState(tag?.code ?? '')
  const [libelleFr, setLibelleFr] = useState(tag?.traductions.fr?.libelle ?? '')
  const [libelleEn, setLibelleEn] = useState(tag?.traductions.en?.libelle ?? '')

  const enregistrer = useMutation({
    mutationFn: () => {
      const traductions = {
        fr: { libelle: libelleFr.trim() },
        ...(libelleEn.trim() ? { en: { libelle: libelleEn.trim() } } : {}),
      }
      return tag
        ? tags.modifier(tag.id, { code: code.trim(), traductions, version: tag.version })
        : tags.creer({ type, code: code.trim(), traductions })
    },
    onSuccess: () => {
      notifier.succes(t('formulaire.enregistre'))
      void client.invalidateQueries({ queryKey: ['tags'] })
      surFermeture()
    },
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
  })

  const soumettre = (evenement: FormEvent<HTMLFormElement>) => {
    evenement.preventDefault()
    if (!code.trim() || !libelleFr.trim()) return
    enregistrer.mutate()
  }

  return (
    <BoiteDialogue
      ouverte
      surFermeture={surFermeture}
      titre={tag ? t('tags.modifier') : t('tags.creer')}
      actions={
        <Bouton type="submit" form="formulaire-tag" disabled={enregistrer.isPending}>
          {enregistrer.isPending ? t('barre.enregistrementEnCours') : t('tags.enregistrer')}
        </Bouton>
      }
    >
      <form id="formulaire-tag" noValidate onSubmit={soumettre} className="space-y-4">
        <Select
          libelle={t('tags.type')}
          value={type}
          onChange={(evenement) => setType(evenement.target.value as TypeTag)}
          options={OPTIONS_TYPE}
          disabled={tag !== null}
          required
        />
        <Champ
          libelle={t('tags.code')}
          value={code}
          onChange={(evenement) => setCode(evenement.target.value)}
          required
          maxLength={120}
        />
        <Champ
          libelle={`${t('tags.libelle')} (FR)`}
          value={libelleFr}
          onChange={(evenement) => setLibelleFr(evenement.target.value)}
          required
          maxLength={80}
        />
        <Champ
          libelle={`${t('tags.libelle')} (EN)`}
          value={libelleEn}
          onChange={(evenement) => setLibelleEn(evenement.target.value)}
          maxLength={80}
        />
      </form>
    </BoiteDialogue>
  )
}
