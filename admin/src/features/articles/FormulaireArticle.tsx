import { useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { Link } from 'react-router'
import { cles } from '@/api/cles'
import { articles } from '@/api/endpoints/contenus'
import type { Article } from '@/api/schemas/articles'
import { LANGUES, type Langue } from '@/api/schemas/communs'
import { EditeurRiche } from '@/components/editeur/EditeurRiche'
import { ChampTraduit } from '@/components/formulaire/ChampTraduit'
import { suggestionAdresse } from '@/components/formulaire/langue-formulaire'
import { ChampAdresse, SectionAvancee } from '@/components/formulaire/SectionAvancee'
import { ParLangue } from '@/components/formulaire/SelecteurLangue'
import { SelecteurTags } from '@/components/tags/SelecteurTags'
import { Interrupteur } from '@/components/ui/Interrupteur'
import { Select } from '@/components/ui/Select'
import {
  ActionsLaterales,
  GabaritFormulaire,
  PageFormulaire,
  type ProprietesEditeur,
} from '@/features/gabarits/editeur'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { useEditeurContenu } from '@/features/gabarits/useEditeurContenu'
import { nomCategorie, useCategories } from '@/features/categories/useCategories'
import { t } from '@/i18n/fr'
import { slugifier } from '@/lib/slug'
import { ApercuArticle } from './ApercuArticle'
import { PanneauImage } from './PanneauImage'
import { PanneauPdf } from './PanneauPdf'
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
  const { control, formState, setValue } = formulaire
  const valeurs = useWatch({ control }) as ValeursArticle
  const categoriesArticle = useCategories('article')
  const { moi } = useSession()
  const peutGererCategories = peut(moi?.compte, 'modifier', 'categories')
  const [slugManuel, setSlugManuel] = useState<Record<Langue, boolean>>({
    fr: Boolean(initial?.traductions.fr?.slug),
    en: Boolean(initial?.traductions.en?.slug),
  })
  const adresseProposee = suggestionAdresse(suggestion)

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
      className="grid gap-8 lg:grid-cols-[minmax(0,56rem)_22rem] lg:gap-10"
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
          nom="extrait"
          libelle={t('article.extrait')}
          multiligne
          maxLength={400}
          valeurs={valeurTraduite('extrait')}
          erreurs={erreurDe('extrait')}
          surChange={ecrire('extrait')}
        />
        <ParLangue
          libelle={t('article.corps')}
          onglets={LANGUES.map((langue) => ({
            id: langue,
            libelle: `${t('article.corps')} (${langue.toUpperCase()})`,
            contenu: (
              <Controller
                key={langue}
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
        <SectionAvancee
          ouverte={
            Boolean(adresseProposee) ||
            LANGUES.some((l) =>
              (['slug', 'seoTitre', 'seoDescription'] as const).some((c) => erreurDe(c)[l]),
            )
          }
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
              setValue(`traductions.${langue}.slug`, valeur, { shouldDirty: true })
              setSlugManuel((actuel) => ({ ...actuel, [langue]: true }))
              editeur.effacerSuggestion()
            }}
          />
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
        </SectionAvancee>

        {/* Visuel : l'image principale de la carte et le PDF de l'article. */}
        <section aria-labelledby="Reglages-visuel" className="rounded-xl border border-sand-200 bg-sand-50 p-4">
          <h2 id="Reglages-visuel" className="label-caps text-ink-700">
            {t('reglages.visuel')}
          </h2>
          <div className="mt-3 space-y-4">
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
              name="pdfId"
              render={({ field, fieldState }) => (
                <PanneauPdf
                  valeur={field.value}
                  surChange={field.onChange}
                  erreur={fieldState.error?.message}
                />
              )}
            />
          </div>
        </section>

        {/* Mise en avant : l'interrupteur à la une. */}
        <section aria-labelledby="Reglages-avant" className="rounded-xl border border-sand-200 bg-sand-50 p-4">
          <h2 id="Reglages-avant" className="label-caps text-ink-700">
            {t('reglages.avant')}
          </h2>
          <div className="mt-3">
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
          </div>
        </section>
      </fieldset>

      <aside className="space-y-4">
        <fieldset disabled={!modifiable} className="space-y-4">
          <legend className="sr-only">{t('article.reglages')}</legend>

          {/* Classement : la catégorie et les étiquettes, deux outils de tri complémentaires. */}
          <section aria-labelledby="Reglages-classement" className="rounded-xl border border-sand-200 bg-sand-50 p-4">
            <h2 id="Reglages-classement" className="label-caps text-ink-700">
              {t('reglages.classement')}
            </h2>
            <div className="mt-3 space-y-3">
              <div className="space-y-1">
                <Select
                  id="categorie"
                  libelle={t('article.categorie')}
                  required
                  invite={t('article.choisirCategorie')}
                  disabled={!categoriesArticle.isSuccess}
                  options={(categoriesArticle.data?.items ?? []).map((c) => ({
                    valeur: c.id,
                    libelle: nomCategorie(c),
                  }))}
                  erreur={formState.errors.categorie?.message}
                  value={valeurs.categorieId}
                  onChange={(evenement) => {
                    const choisie = categoriesArticle.data?.items.find(
                      (c) => c.id === evenement.target.value,
                    )
                    setValue('categorieId', choisie?.id ?? '', { shouldDirty: true })
                    setValue('categorie', choisie ? nomCategorie(choisie) : '', {
                      shouldDirty: true,
                      shouldValidate: tentative > 0,
                    })
                  }}
                />
                {peutGererCategories ? (
                  <Link
                    to="/articles/categories"
                    className="inline-flex min-h-11 items-center text-caption font-semibold text-clay-700 underline underline-offset-4"
                  >
                    {t('categorie.gerer')}
                  </Link>
                ) : null}
              </div>
              <Controller
                control={control}
                name="tagIds"
                render={({ field }) => (
                  <SelecteurTags
                    contexte="article"
                    valeur={field.value}
                    surChange={field.onChange}
                    exigerFormat
                    afficherErreur={tentative > 0}
                  />
                )}
              />
            </div>
          </section>
        </fieldset>
        <ActionsLaterales
          editeur={editeur}
          libelles={LIBELLES_ARTICLE}
          lectureSeule={t('article.lectureSeule')}
          sansEnregistrement
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
