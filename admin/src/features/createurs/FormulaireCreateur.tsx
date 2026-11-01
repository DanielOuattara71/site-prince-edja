import { useMutation, useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { Controller, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router'
import { cles } from '@/api/cles'
import { createurs } from '@/api/endpoints/boutique'
import { medias } from '@/api/endpoints/contenus'
import { estErreurApi } from '@/api/erreurs'
import { LANGUES, type Langue } from '@/api/schemas/communs'
import type { Createur } from '@/api/schemas/createurs'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { ApercuSite } from '@/components/apercu/ApercuSite'
import { ChampTraduit } from '@/components/formulaire/ChampTraduit'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { Confirmation } from '@/components/ui/Confirmation'
import { Interrupteur } from '@/components/ui/Interrupteur'
import { Onglets } from '@/components/ui/Onglets'
import { PanneauImage } from '@/features/articles/PanneauImage'
import {
  ActionsLaterales,
  GabaritFormulaire,
  PageFormulaire,
  type ProprietesEditeur,
} from '@/features/gabarits/editeur'
import { useEditeurContenu } from '@/features/gabarits/useEditeurContenu'
import { t } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'
import { slugifier } from '@/lib/slug'
import {
  CHAMPS_CREATEUR,
  LIBELLES_CREATEUR,
  schemaFormulaireCreateur,
  valeursDepuisCreateur,
  valeursVides,
  versEntree,
  versModification,
  type ValeursCreateur,
} from './valeurs'

/**
 * Formulaire d'un créateur (section 9, écran ajouté ; contrat § 10.2). Le principal porte la
 * mention « Plateforme » et ne se supprime, ne se désactive ni ne s'archive (RG-21). Un créateur
 * qui a des produits ne se supprime pas : l'écran propose de le désactiver et dit que ses
 * produits seront dépubliés (RG-27). La commission n'apparaît qu'en mode multi-vendeurs.
 */
export default function FormulaireCreateur() {
  return (
    <PageFormulaire
      cle={cles.createur}
      lire={(id) => createurs.lire(id)}
      editeur={EditeurCreateur}
    />
  )
}

function EditeurCreateur({ contenu: initial, surCree }: ProprietesEditeur<Createur>) {
  const { moi } = useSession()
  const multiVendeurs = moi?.reglages.multiVendeurs ?? false
  const editeur = useEditeurContenu<Createur, ValeursCreateur>({
    ressource: 'createurs',
    chemin: '/createurs',
    initial,
    surCree,
    schema: schemaFormulaireCreateur,
    valeursDepuis: valeursDepuisCreateur,
    valeursVides,
    champs: CHAMPS_CREATEUR,
    creer: (valeurs) => createurs.creer(versEntree(valeurs)),
    modifier: (valeurs, c) => createurs.modifier(c.id, versModification(valeurs, c)),
    transition: (id, demande) => createurs.transition(id, demande),
    cle: cles.createur,
  })
  const { formulaire, contenu: createur, modifiable } = editeur
  const { control, formState, setValue, register } = formulaire
  const valeurs = useWatch({ control }) as ValeursCreateur
  const [slugManuel, setSlugManuel] = useState(Boolean(initial))
  // Adresse figée dès la première publication (SLUG_FIGE) : l'écran le sait par le statut.
  const slugFige = Boolean(createur && (createur.statut !== 'brouillon' || createur.publieLe))
  const principal = createur?.estPrincipal ?? false

  const traduit = (champ: 'bio' | 'accroche') => ({
    fr: valeurs.traductions.fr[champ],
    en: valeurs.traductions.en[champ],
  })
  const erreurDe = (champ: 'bio' | 'accroche') =>
    Object.fromEntries(
      LANGUES.map((l) => [l, formState.errors.traductions?.[l]?.[champ]?.message]),
    ) as Partial<Record<Langue, string>>
  const titre = createur?.nom || t('createurs.nouveau')

  const contenu = (
    <form
      noValidate
      onSubmit={(evenement) => void editeur.soumettre(evenement)}
      className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]"
    >
      <fieldset disabled={!modifiable} className="min-w-0 space-y-6">
        <legend className="sr-only">{t('article.contenu')}</legend>
        <Champ
          id="nom"
          libelle={t('createurs.nom')}
          required
          maxLength={120}
          erreur={formState.errors.nom?.message}
          {...register('nom', {
            onChange: (evenement: { target: { value: string } }) => {
              if (!slugManuel && !slugFige) {
                setValue('slug', slugifier(evenement.target.value), { shouldDirty: true })
              }
            },
          })}
        />
        <Champ
          id="slug"
          libelle={t('createurs.slug')}
          aide={slugFige ? t('createurs.slugFige') : t('createurs.slugAide')}
          readOnly={slugFige}
          erreur={formState.errors.slug?.message}
          {...register('slug', { onChange: () => setSlugManuel(true) })}
        />
        <ChampTraduit
          nom="bio"
          libelle={t('createurs.bio')}
          requis
          multiligne
          maxLength={4000}
          valeurs={traduit('bio')}
          erreurs={erreurDe('bio')}
          surChange={(langue, valeur) =>
            setValue(`traductions.${langue}.bio`, valeur, { shouldDirty: true })
          }
        />
        <ChampTraduit
          nom="accroche"
          libelle={t('createurs.accroche')}
          maxLength={200}
          valeurs={traduit('accroche')}
          erreurs={erreurDe('accroche')}
          surChange={(langue, valeur) =>
            setValue(`traductions.${langue}.accroche`, valeur, { shouldDirty: true })
          }
        />
      </fieldset>

      <aside className="space-y-6">
        <fieldset disabled={!modifiable} className="space-y-6">
          <legend className="sr-only">{t('createurs.reglages')}</legend>
          <Champ id="pays" libelle={t('createurs.pays')} {...register('pays')} />
          <Champ id="ville" libelle={t('createurs.ville')} {...register('ville')} />
          <Controller
            control={control}
            name="photoId"
            render={({ field, fieldState }) => (
              <PanneauImage
                id="photoId"
                libelle={t('createurs.photo')}
                valeur={field.value}
                surChange={field.onChange}
                erreur={fieldState.error?.message}
              />
            )}
          />
          <Controller
            control={control}
            name="actif"
            render={({ field }) => (
              <Interrupteur
                libelle={t('createurs.actif')}
                aide={
                  principal
                    ? t('createurs.actifPrincipal')
                    : multiVendeurs
                      ? t('createurs.actifAide')
                      : t('createurs.actifMulti')
                }
                actif={field.value}
                surChange={field.onChange}
                desactive={!modifiable || principal || (!multiVendeurs && !field.value)}
              />
            )}
          />
          {multiVendeurs ? (
            <Champ
              id="tauxCommission"
              inputMode="decimal"
              libelle={t('createurs.commission')}
              aide={t('createurs.commissionAide')}
              erreur={formState.errors.tauxCommission?.message}
              {...register('tauxCommission')}
            />
          ) : null}
        </fieldset>
        <ActionsLaterales editeur={editeur} libelles={LIBELLES_CREATEUR} />
        {createur && !principal ? <ZoneSuppression createur={createur} /> : null}
      </aside>
    </form>
  )

  return (
    <GabaritFormulaire
      editeur={editeur}
      titreListe={t('menu.createurs')}
      cheminListe="/createurs"
      titre={titre}
      formulaire={contenu}
      apercu={<ApercuCreateur valeurs={valeurs} />}
      libelles={LIBELLES_CREATEUR}
      versionnee="createurs"
      versChamp={(champ) => (/^traductions\.(fr|en)$/.test(champ) ? `${champ}.bio` : champ)}
      avant={principal ? <Alerte ton="info">{t('createurs.principalProtege')}</Alerte> : null}
    />
  )
}

/**
 * Supprimer un créateur sans produit ; sinon le désactiver (RG-27), en disant que ses produits
 * seront dépubliés. Admin seulement.
 */
function ZoneSuppression({ createur }: { createur: Createur }) {
  const { moi } = useSession()
  const navigate = useNavigate()
  const notifier = useNotifications()
  const [ouverte, setOuverte] = useState(false)
  const avecProduits = createur.nombreBijoux > 0
  const action = useMutation({
    mutationFn: () =>
      avecProduits
        ? createurs.modifier(createur.id, { actif: false, version: createur.version })
        : createurs.supprimer(createur.id, createur.version),
    onSuccess: () => {
      setOuverte(false)
      notifier.succes(t('formulaire.enregistre'))
      void navigate('/createurs')
    },
    onError: (erreur) => {
      setOuverte(false)
      notifier.erreur(messageErreur(erreur), estErreurApi(erreur) ? erreur.requeteId : undefined)
    },
  })
  if (!peut(moi?.compte, 'supprimer', 'createurs')) return null
  if (avecProduits && !createur.actif) return null

  return (
    <>
      <Bouton variante="danger" className="w-full" onClick={() => setOuverte(true)}>
        {avecProduits ? t('createurs.desactiver') : t('createurs.supprimer')}
      </Bouton>
      <Confirmation
        ouverte={ouverte}
        titre={avecProduits ? t('createurs.desactiver') : t('createurs.supprimer')}
        objet={createur.nom}
        consequence={avecProduits ? t('createurs.desactiverTexte') : t('createurs.supprimerTexte')}
        libelleConfirmer={avecProduits ? t('createurs.desactiver') : t('createurs.supprimer')}
        danger
        enCours={action.isPending}
        surConfirmer={() => action.mutate()}
        surAnnuler={() => setOuverte(false)}
      />
    </>
  )
}

/** Page publique du créateur telle que le site l'affichera, dans chaque langue saisie. */
function ApercuCreateur({ valeurs }: { valeurs: ValeursCreateur }) {
  const photo = useQuery({
    queryKey: cles.media(valeurs.photoId ?? ''),
    queryFn: () => medias.lire(valeurs.photoId ?? ''),
    enabled: Boolean(valeurs.photoId),
  })
  if (!valeurs.nom.trim())
    return <p className="text-body text-ink-700">{t('createurs.apercuVide')}</p>
  const langues = LANGUES.filter(
    (l) =>
      l === 'fr' || valeurs.traductions[l].bio.trim() || valeurs.traductions[l].accroche.trim(),
  )
  return (
    <Onglets
      libelle={t('article.apercu')}
      onglets={langues.map((langue) => ({
        id: langue,
        libelle: t(`langue.${langue}`),
        contenu: (
          <ApercuSite libelle={`${t('article.apercu')} (${langue.toUpperCase()})`}>
            <header className="space-y-2">
              <h1 className="font-display text-display-lg text-ink-900 uppercase">{valeurs.nom}</h1>
              {valeurs.traductions[langue].accroche ? (
                <p className="font-quote text-body-lg text-ink-700">
                  {valeurs.traductions[langue].accroche}
                </p>
              ) : null}
              {valeurs.pays || valeurs.ville ? (
                <p className="label-caps text-ink-500">
                  {[valeurs.ville, valeurs.pays].filter(Boolean).join(', ')}
                </p>
              ) : null}
            </header>
            {photo.data ? (
              <img
                src={photo.data.url}
                alt={photo.data.decoratif ? '' : (photo.data.traductions[langue]?.texteAlt ?? '')}
                className="aspect-[4/5] w-full max-w-sm rounded-xl bg-sand-200 object-cover"
              />
            ) : null}
            {valeurs.traductions[langue].bio.split(/\n{2,}/).map((paragraphe, i) =>
              paragraphe.trim() ? (
                <p key={i} className="text-body text-ink-700">
                  {paragraphe}
                </p>
              ) : null,
            )}
          </ApercuSite>
        ),
      }))}
    />
  )
}
