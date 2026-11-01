import { useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { cles } from '@/api/cles'
import { articles } from '@/api/endpoints/contenus'
import { CATEGORIES_ARTICLE, type Article } from '@/api/schemas/articles'
import { LANGUES, type Langue } from '@/api/schemas/communs'
import { EditeurRiche } from '@/components/editeur/EditeurRiche'
import { ChampTraduit } from '@/components/formulaire/ChampTraduit'
import { SelecteurTags } from '@/components/tags/SelecteurTags'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { Interrupteur } from '@/components/ui/Interrupteur'
import { Onglets } from '@/components/ui/Onglets'
import { Select } from '@/components/ui/Select'
import {
  ActionsLaterales,
  GabaritFormulaire,
  PageFormulaire,
  type ProprietesEditeur,
} from '@/features/gabarits/editeur'
import { useEditeurContenu } from '@/features/gabarits/useEditeurContenu'
import { t } from '@/i18n/fr'
import { slugifier } from '@/lib/slug'
import { ApercuArticle } from './ApercuArticle'
import { PanneauImage } from './PanneauImage'
import {
  CHAMPS_ARTICLE,
  LIBELLES_ARTICLE,
  schemaFormulaireArticle,
  valeursDepuisArticle,
  valeursVides,
  versEntree,
  versModification,
  type ValeursArticle,
} from './valeurs'

/**
 * Formulaire d'un article (sections 9 à 11), sur le gabarit commun (D-57) : colonne principale
 * pour le contenu, colonne latérale pour la catégorie, l'image, les tags, la mise en avant et la
 * publication.
 */
export default function FormulaireArticle() {
  return (
    <PageFormulaire cle={cles.article} lire={(id) => articles.lire(id)} editeur={EditeurArticle} />
  )
}

type ChampTexte = 'titre' | 'slug' | 'extrait' | 'seoTitre' | 'seoDescription'

function EditeurArticle({ contenu: initial, surCree }: ProprietesEditeur<Article>) {
  const editeur = useEditeurContenu<Article, ValeursArticle>({
    ressource: 'articles',
    chemin: '/articles',
    initial,
    surCree,
    schema: schemaFormulaireArticle,
    valeursDepuis: valeursDepuisArticle,
    valeursVides,
    champs: CHAMPS_ARTICLE,
    creer: (valeurs) => articles.creer(versEntree(valeurs)),
    modifier: (valeurs, article) =>
      articles.modifier(article.id, versModification(valeurs, article)),
    transition: (id, demande) => articles.transition(id, demande),
    cle: cles.article,
  })
  const { formulaire, contenu: article, modifiable, tentative, suggestion } = editeur
  const { control, formState, setValue, register } = formulaire
  const valeurs = useWatch({ control }) as ValeursArticle
  const [slugManuel, setSlugManuel] = useState<Record<Langue, boolean>>({
    fr: Boolean(initial?.traductions.fr?.slug),
    en: Boolean(initial?.traductions.en?.slug),
  })
  const langueSuggestion = suggestion?.champ.split('.')[1]

  const surTitre = (langue: Langue, titre: string) => {
    setValue(`traductions.${langue}.titre`, titre, { shouldDirty: true })
    if (!slugManuel[langue])
      setValue(`traductions.${langue}.slug`, slugifier(titre), { shouldDirty: true })
  }
  const erreursForm = formState.errors.traductions
  const erreurDe = (champ: ChampTexte) =>
    Object.fromEntries(LANGUES.map((l) => [l, erreursForm?.[l]?.[champ]?.message])) as Partial<
      Record<Langue, string>
    >
  const valeurTraduite = (champ: ChampTexte) => ({
    fr: valeurs.traductions.fr[champ],
    en: valeurs.traductions.en[champ],
  })
  const ecrire = (champ: ChampTexte) => (langue: Langue, valeur: string) =>
    setValue(`traductions.${langue}.${champ}`, valeur, { shouldDirty: true })
  const titre = article
    ? (article.traductions.fr?.titre ?? article.traductions.en?.titre ?? '')
    : t('article.nouveau')

  const contenu = (
    <form
      noValidate
      onSubmit={(evenement) => void editeur.soumettre(evenement)}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <fieldset disabled={!modifiable} className="min-w-0 space-y-6">
        <legend className="sr-only">{t('article.contenu')}</legend>
        <ChampTraduit
          nom="titre"
          libelle={t('article.titre')}
          requis
          maxLength={200}
          valeurs={valeurTraduite('titre')}
          erreurs={erreurDe('titre')}
          surChange={surTitre}
        />
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
        {suggestion && (langueSuggestion === 'fr' || langueSuggestion === 'en') ? (
          <Alerte ton="info">
            <p>{t('article.slugPris')}</p>
            <Bouton
              variante="secondaire"
              onClick={() => {
                setValue(`traductions.${langueSuggestion}.slug`, suggestion.valeur, {
                  shouldDirty: true,
                })
                setSlugManuel((actuel) => ({ ...actuel, [langueSuggestion]: true }))
                editeur.effacerSuggestion()
              }}
            >
              {t('article.utiliserSlug')} « {suggestion.valeur} »
            </Bouton>
          </Alerte>
        ) : null}
        <ChampTraduit
          nom="extrait"
          libelle={t('article.extrait')}
          multiligne
          maxLength={400}
          valeurs={valeurTraduite('extrait')}
          erreurs={erreurDe('extrait')}
          surChange={ecrire('extrait')}
        />
        <Onglets
          libelle={t('article.corps')}
          onglets={LANGUES.map((langue) => ({
            id: langue,
            libelle: `${t('article.corps')} (${langue.toUpperCase()})`,
            contenu: (
              <Controller
                control={control}
                name={`traductions.${langue}.corps`}
                render={({ field, fieldState }) => (
                  <EditeurRiche
                    id={`traductions.${langue}.corps`}
                    libelle={`${t('article.corps')} (${langue.toUpperCase()})`}
                    valeur={field.value}
                    surChange={field.onChange}
                    erreur={fieldState.error?.message}
                  />
                )}
              />
            ),
          }))}
        />
        <details className="rounded-md border border-sand-200 p-4">
          <summary className="cursor-pointer text-body font-semibold">{t('article.seo')}</summary>
          <div className="mt-4 space-y-4">
            <ChampTraduit
              nom="seoTitre"
              libelle={t('article.seoTitre')}
              maxLength={70}
              valeurs={valeurTraduite('seoTitre')}
              erreurs={erreurDe('seoTitre')}
              surChange={ecrire('seoTitre')}
            />
            <ChampTraduit
              nom="seoDescription"
              libelle={t('article.seoDescription')}
              multiligne
              maxLength={160}
              valeurs={valeurTraduite('seoDescription')}
              erreurs={erreurDe('seoDescription')}
              surChange={ecrire('seoDescription')}
            />
          </div>
        </details>
      </fieldset>

      <aside className="space-y-6">
        <fieldset disabled={!modifiable} className="space-y-6">
          <legend className="sr-only">{t('article.reglages')}</legend>
          <Select
            id="categorie"
            libelle={t('article.categorie')}
            required
            invite={t('article.choisirCategorie')}
            options={CATEGORIES_ARTICLE.map((c) => ({ valeur: c, libelle: c }))}
            erreur={formState.errors.categorie?.message}
            {...register('categorie')}
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
            name="tagIds"
            render={({ field }) => (
              <SelecteurTags
                valeur={field.value}
                surChange={field.onChange}
                exigerFormat
                afficherErreur={tentative > 0}
              />
            )}
          />
          <Controller
            control={control}
            name="aLaUne"
            render={({ field }) => (
              <Interrupteur
                libelle={t('article.aLaUne')}
                aide={t('article.aLaUneAide')}
                actif={field.value}
                surChange={field.onChange}
                desactive={!modifiable}
              />
            )}
          />
        </fieldset>
        <ActionsLaterales
          editeur={editeur}
          libelles={LIBELLES_ARTICLE}
          lectureSeule={t('article.lectureSeule')}
        />
      </aside>
    </form>
  )

  return (
    <GabaritFormulaire
      editeur={editeur}
      titreListe={t('menu.articles')}
      cheminListe="/articles"
      titre={titre}
      formulaire={contenu}
      apercu={<ApercuArticle valeurs={valeurs} id={article?.id ?? null} />}
      libelles={LIBELLES_ARTICLE}
      versionnee="articles"
      libelleOnglets={t('article.onglets')}
      versChamp={(champ) => (/^traductions\.(fr|en)$/.test(champ) ? `${champ}.titre` : champ)}
    />
  )
}
