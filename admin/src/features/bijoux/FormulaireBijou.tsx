import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { cles } from '@/api/cles'
import { bijoux } from '@/api/endpoints/boutique'
import { medias } from '@/api/endpoints/contenus'
import { prixAffiche, type Bijou } from '@/api/schemas/boutique'
import { LANGUES, type Langue } from '@/api/schemas/communs'
import { peut } from '@/auth/permissions'
import { useSession } from '@/auth/contexte-session'
import { ApercuSite } from '@/components/apercu/ApercuSite'
import { SelecteurCreateur } from '@/components/createurs/SelecteurCreateur'
import { ChampTraduit } from '@/components/formulaire/ChampTraduit'
import { suggestionAdresse } from '@/components/formulaire/langue-formulaire'
import { ChampAdresse, SectionAvancee } from '@/components/formulaire/SectionAvancee'
import { ParLangue } from '@/components/formulaire/SelecteurLangue'
import { SelecteurTags } from '@/components/tags/SelecteurTags'
import { Alerte } from '@/components/ui/Alerte'
import { Champ } from '@/components/ui/Champ'
import { Interrupteur } from '@/components/ui/Interrupteur'
import { Select } from '@/components/ui/Select'
import { PanneauImage } from '@/features/articles/PanneauImage'
import {
  ActionsLaterales,
  GabaritFormulaire,
  PageFormulaire,
  type ProprietesEditeur,
} from '@/features/gabarits/editeur'
import { useEditeurContenu } from '@/features/gabarits/useEditeurContenu'
import { useCategories } from '@/features/categories/useCategories'
import { t } from '@/i18n/fr'
import { formatFCFA } from '@/lib/format'
import { slugifier } from '@/lib/slug'
import { BlocVariantes } from './BlocVariantes'
import { PanneauGalerie } from './PanneauGalerie'
import {
  CHAMPS_BIJOU,
  libellesBijou,
  schemaFormulaireBijou,
  valeursDepuisBijou,
  valeursVides,
  versEntree,
  versModification,
  type ValeursBijou,
} from './valeurs'

/**
 * Formulaire d'un bijou (sections 9 à 11, contrat § 10.3). Colonne principale : récit et
 * caractéristiques ; colonne latérale : catégorie, créateur (masqué hors multi-vendeurs),
 * images, tags, visibilité et confirmation du prix (admin). Le prix reste **masqué** sur le
 * site tant qu'il n'est pas confirmé : l'aperçu affiche alors « sur demande ».
 */
export default function FormulaireBijou() {
  return <PageFormulaire cle={cles.bijou} lire={(id) => bijoux.lire(id)} editeur={EditeurBijou} />
}

type ChampTexte = 'nom' | 'slug' | 'culture' | 'histoire'

function EditeurBijou({ contenu: initial, surCree }: ProprietesEditeur<Bijou>) {
  const { moi } = useSession()
  const confirmerPrix = peut(moi?.compte, 'confirmer_prix', 'bijoux')
  const editeur = useEditeurContenu<Bijou, ValeursBijou>({
    ressource: 'bijoux',
    chemin: '/bijoux',
    initial,
    surCree,
    schema: schemaFormulaireBijou,
    valeursDepuis: valeursDepuisBijou,
    valeursVides,
    champs: CHAMPS_BIJOU,
    creer: (valeurs) => bijoux.creer(versEntree(valeurs, confirmerPrix)),
    modifier: (valeurs, b) => bijoux.modifier(b.id, versModification(valeurs, b)),
    transition: (id, demande) => bijoux.transition(id, demande),
    cle: cles.bijou,
  })
  const { formulaire, contenu: bijou, modifiable, suggestion } = editeur
  const { control, formState, setValue, register } = formulaire
  const valeurs = useWatch({ control }) as ValeursBijou
  const [slugManuel, setSlugManuel] = useState<Record<Langue, boolean>>({
    fr: Boolean(initial?.traductions.fr?.slug),
    en: Boolean(initial?.traductions.en?.slug),
  })
  const listeCategories = useCategories('produit')
  const libelles = libellesBijou(bijou)
  const adresseProposee = suggestionAdresse(suggestion)

  const valeurTraduite = (champ: ChampTexte) => ({
    fr: valeurs.traductions.fr[champ],
    en: valeurs.traductions.en[champ],
  })
  const erreurDe = (champ: ChampTexte) =>
    Object.fromEntries(
      LANGUES.map((l) => [l, formState.errors.traductions?.[l]?.[champ]?.message]),
    ) as Partial<Record<Langue, string>>
  const ecrire = (champ: ChampTexte) => (langue: Langue, valeur: string) =>
    setValue(`traductions.${langue}.${champ}`, valeur, { shouldDirty: true })
  const titre = bijou
    ? `${bijou.numero} — ${bijou.traductions.fr?.nom ?? bijou.traductions.en?.nom ?? t('bijou.sansNom')}`
    : t('bijou.nouveau')

  // Les variantes ont leurs propres formulaires : hors du `<form>` du bijou, jamais imbriqués.
  const variantes = bijou ? (
    <BlocVariantes bijou={bijou} modifiable={modifiable} surBijou={editeur.rafraichir} />
  ) : (
    <Alerte ton="info">{t('bijou.variantesApresCreation')}</Alerte>
  )

  const formulaireBijou = (
    <form
      noValidate
      onSubmit={(evenement) => void editeur.soumettre(evenement)}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <div className="min-w-0 space-y-8">
        <fieldset disabled={!modifiable} className="space-y-6">
          <legend className="sr-only">{t('article.contenu')}</legend>
          <Champ
            id="numero"
            libelle={t('bijou.numero')}
            aide={t('bijou.numeroAide')}
            required
            maxLength={10}
            erreur={formState.errors.numero?.message}
            {...register('numero')}
          />
          <ChampTraduit
            nom="nom"
            libelle={t('bijou.nom')}
            requis
            maxLength={200}
            valeurs={valeurTraduite('nom')}
            erreurs={erreurDe('nom')}
            surChange={(langue, valeur) => {
              ecrire('nom')(langue, valeur)
              if (!slugManuel[langue]) ecrire('slug')(langue, slugifier(valeur))
            }}
          />
          <ChampTraduit
            nom="culture"
            libelle={t('bijou.culture')}
            requis
            maxLength={200}
            valeurs={valeurTraduite('culture')}
            erreurs={erreurDe('culture')}
            surChange={ecrire('culture')}
          />
          <ChampTraduit
            nom="histoire"
            libelle={t('bijou.histoire')}
            requis
            multiligne
            maxLength={600}
            valeurs={valeurTraduite('histoire')}
            erreurs={erreurDe('histoire')}
            surChange={ecrire('histoire')}
          />
          <SectionAvancee
            ouverte={Boolean(adresseProposee) || LANGUES.some((l) => erreurDe('slug')[l])}
          >
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
          <fieldset className="grid gap-4 rounded-md border border-sand-200 p-4 sm:grid-cols-2">
            <legend className="px-1 text-body font-semibold text-ink-900">
              {t('bijou.caracteristiques')}
            </legend>
            <Champ
              id="editionNumero"
              inputMode="numeric"
              libelle={t('bijou.editionNumero')}
              erreur={formState.errors.editionNumero?.message}
              {...register('editionNumero')}
            />
            <Champ
              id="editionTotal"
              inputMode="numeric"
              libelle={t('bijou.editionTotal')}
              erreur={formState.errors.editionTotal?.message}
              {...register('editionTotal')}
            />
            <Champ id="atelier" libelle={t('bijou.atelier')} {...register('atelier')} />
            <Champ id="village" libelle={t('bijou.village')} {...register('village')} />
            <Champ
              id="poids"
              inputMode="decimal"
              libelle={t('bijou.poids')}
              erreur={formState.errors.poids?.message}
              {...register('poids')}
            />
          </fieldset>
        </fieldset>
      </div>

      <aside className="space-y-6">
        <fieldset disabled={!modifiable} className="space-y-6">
          <legend className="sr-only">{t('bijou.reglages')}</legend>
          <Select
            id="categorieId"
            libelle={t('bijou.categorie')}
            required
            invite={t('bijou.choisirCategorie')}
            disabled={!listeCategories.isSuccess}
            options={(listeCategories.data?.items ?? []).map((c) => ({
              valeur: c.id,
              libelle: c.traductions.fr?.nom ?? c.traductions.en?.nom ?? '',
            }))}
            erreur={formState.errors.categorieId?.message}
            {...register('categorieId')}
          />
          <Controller
            control={control}
            name="createurId"
            render={({ field, fieldState }) => (
              <SelecteurCreateur
                valeur={field.value}
                surChange={field.onChange}
                erreur={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="imageId"
            render={({ field, fieldState }) => (
              <PanneauImage
                valeur={field.value}
                surChange={field.onChange}
                erreur={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="galerieMediaIds"
            render={({ field }) => (
              <PanneauGalerie
                valeur={field.value}
                surChange={field.onChange}
                desactive={!modifiable}
              />
            )}
          />
          <Controller
            control={control}
            name="tagIds"
            render={({ field }) => (
              <SelecteurTags contexte="bijou" valeur={field.value} surChange={field.onChange} />
            )}
          />
          <Controller
            control={control}
            name="visible"
            render={({ field }) => (
              <Interrupteur
                libelle={t('bijou.visible')}
                actif={field.value}
                surChange={field.onChange}
                desactive={!modifiable}
              />
            )}
          />
          <Controller
            control={control}
            name="prixConfirme"
            render={({ field }) => (
              <Interrupteur
                libelle={t('bijou.prixConfirme')}
                aide={confirmerPrix ? t('bijou.prixConfirmeAide') : t('bijou.prixConfirmeAdmin')}
                actif={field.value}
                surChange={field.onChange}
                desactive={!modifiable || !confirmerPrix}
              />
            )}
          />
        </fieldset>
        <ActionsLaterales editeur={editeur} libelles={libelles} />
      </aside>
    </form>
  )
  const contenu = (
    <div className="space-y-8">
      {formulaireBijou}
      {variantes}
    </div>
  )

  return (
    <GabaritFormulaire
      editeur={editeur}
      titreListe={t('menu.bijoux')}
      cheminListe="/bijoux"
      titre={titre}
      formulaire={contenu}
      apercu={<ApercuBijou valeurs={valeurs} bijou={bijou} />}
      libelles={libelles}
      versionnee="bijoux"
      versChamp={(champ) => (/^traductions\.(fr|en)$/.test(champ) ? `${champ}.nom` : champ)}
    />
  )
}

/** Fiche publique du bijou, telle que le site l'affichera : prix ou « sur demande ». */
function ApercuBijou({ valeurs, bijou }: { valeurs: ValeursBijou; bijou: Bijou | null }) {
  const image = useQuery({
    queryKey: cles.media(valeurs.imageId ?? ''),
    queryFn: () => medias.lire(valeurs.imageId ?? ''),
    enabled: Boolean(valeurs.imageId),
  })
  const langues = LANGUES.filter((l) => valeurs.traductions[l].nom.trim())
  if (langues.length === 0) return <p className="text-body text-ink-700">{t('bijou.apercuVide')}</p>
  const prix = prixAffiche({
    prixConfirme: valeurs.prixConfirme,
    variantes: bijou?.variantes ?? [],
  })
  const matieres = bijou?.matieres ?? []

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
                <p className="label-caps text-ink-500">{valeurs.numero}</p>
                <h1 className="font-display text-display-lg text-ink-900 uppercase">
                  {traduction.nom}
                </h1>
                {traduction.culture ? (
                  <p className="font-quote text-body-lg text-ink-700">{traduction.culture}</p>
                ) : null}
              </header>
              {image.data ? (
                <img
                  src={image.data.url}
                  alt={image.data.decoratif ? '' : (image.data.traductions[langue]?.texteAlt ?? '')}
                  className="aspect-square w-full max-w-md rounded-xl bg-sand-200 object-cover"
                />
              ) : null}
              <p className="text-heading-sm font-semibold text-ink-900">
                {prix.surDemande || prix.montant === null
                  ? t('bijou.surDemande')
                  : `${prix.apartirDe ? `${t('bijou.aPartirDe')} ` : ''}${formatFCFA(prix.montant)}`}
              </p>
              {matieres.length > 0 ? (
                <p className="text-body text-ink-700">{matieres.join(', ')}</p>
              ) : null}
              {traduction.histoire ? (
                <p className="text-body text-ink-700">{traduction.histoire}</p>
              ) : null}
            </ApercuSite>
          ),
        }
      })}
    />
  )
}
