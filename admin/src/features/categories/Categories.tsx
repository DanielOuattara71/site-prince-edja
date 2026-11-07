import { useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { cles } from '@/api/cles'
import { categories } from '@/api/endpoints/boutique'
import { aLeCode, estErreurApi } from '@/api/erreurs'
import { FAMILLES_CATEGORIE, type Categorie, type FamilleCategorie } from '@/api/schemas/boutique'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { ListeOrdonnable } from '@/components/listes/ListeOrdonnable'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Alerte } from '@/components/ui/Alerte'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Bouton } from '@/components/ui/Bouton'
import { Champ } from '@/components/ui/Champ'
import { Confirmation } from '@/components/ui/Confirmation'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { Interrupteur } from '@/components/ui/Interrupteur'
import { Squelette } from '@/components/ui/Squelette'
import { nomCategorie as nomDe, useCategories } from '@/features/categories/useCategories'
import { t, type CleTraduction } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'
import { slugifier } from '@/lib/slug'

/**
 * Catégories (ECRANS § 4.4, SCHEMAS § 3) : un seul écran, **trois sections empilées** —
 * Articles, Projets, Produits. Chacune est ordonnable (glisser-déposer ou clavier), avec son
 * nombre d'éléments, un interrupteur « Visible », « Ajouter » et, par ligne, « Modifier » et
 * « Supprimer ». Une catégorie utilisée ne se supprime pas (RG-31, « Utilisée par N éléments »).
 * La section Articles a l'ancre `#categories-article` (lien depuis le Journal).
 */
export default function Categories() {
  const { moi } = useSession()
  const admin = peut(moi?.compte, 'modifier', 'categories')
  return (
    <section className="space-y-10">
      <div>
        <FilAriane elements={[{ libelle: t('menu.categories') }]} />
        <TitrePage titre={t('categorie.titre')}>{t('categorie.titre')}</TitrePage>
        <p className="mt-2 max-w-3xl text-body text-ink-700">{t('categorie.intro')}</p>
      </div>
      {!admin ? <Alerte>{t('categorie.lectureSeule')}</Alerte> : null}
      {FAMILLES_CATEGORIE.map((famille) => (
        <SectionCategories key={famille} famille={famille} admin={admin} />
      ))}
    </section>
  )
}

function SectionCategories({ famille, admin }: { famille: FamilleCategorie; admin: boolean }) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const requete = useCategories(famille)
  const [edition, setEdition] = useState<Categorie | 'nouvelle' | null>(null)
  const [suppression, setSuppression] = useState<Categorie | null>(null)
  const titre = t(`categorie.section.${famille}` as CleTraduction)
  const idTitre = `categories-${famille}`

  const ordonner = useMutation({
    mutationFn: (ids: string[]) => categories.ordonner(ids),
    onSuccess: () => notifier.succes(t('categorie.ordreEnregistre')),
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
    onSettled: () => client.invalidateQueries({ queryKey: ['categories'] }),
  })

  const basculer = useMutation({
    mutationFn: (c: Categorie) =>
      categories.modifier(c.id, { visible: !c.visible, version: c.version }),
    onSuccess: () => notifier.succes(t('formulaire.enregistre')),
    onError: (erreur) => notifier.erreur(messageErreur(erreur)),
    onSettled: () => client.invalidateQueries({ queryKey: ['categories'] }),
  })

  const supprimer = useMutation({
    mutationFn: (c: Categorie) => categories.supprimer(c.id, c.version),
    onSuccess: () => {
      setSuppression(null)
      notifier.succes(t('formulaire.enregistre'))
    },
    onError: (erreur) => {
      setSuppression(null)
      notifier.erreur(messageErreur(erreur), estErreurApi(erreur) ? erreur.requeteId : undefined)
    },
    onSettled: () => client.invalidateQueries({ queryKey: ['categories'] }),
  })

  const surOrdre = (nouvelles: Categorie[]) => {
    // Affiché tout de suite ; la liste revient du serveur une fois l'ordre écrit.
    client.setQueryData([...cles.categories(), famille], (page: typeof requete.data) =>
      page ? { ...page, items: nouvelles } : page,
    )
    ordonner.mutate(nouvelles.map((c) => c.id))
  }

  return (
    <section aria-labelledby={idTitre} className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3 border-b border-sand-200 pb-2">
        <div>
          <h2 id={idTitre} className="font-display text-heading-sm uppercase text-ink-900">
            {titre}
          </h2>
          <p className="text-caption text-ink-700">
            {t(`categorie.aide.${famille}` as CleTraduction)}
          </p>
        </div>
        {admin ? (
          <Bouton
            variante="secondaire"
            aria-label={`${t('categorie.ajouter')} — ${titre}`}
            onClick={() => setEdition('nouvelle')}
          >
            <Plus aria-hidden className="size-4" />
            {t('categorie.ajouter')}
          </Bouton>
        ) : null}
      </div>

      {requete.isPending ? (
        <Squelette lignes={4} />
      ) : requete.isError ? (
        <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
      ) : requete.data.items.length === 0 ? (
        <EtatVide
          titre={t('categorie.videSection')}
          action={
            admin ? (
              <Bouton variante="secondaire" onClick={() => setEdition('nouvelle')}>
                {t('categorie.ajouter')}
              </Bouton>
            ) : undefined
          }
        />
      ) : (
        <ListeOrdonnable
          libelle={`${t('categorie.ordre')} — ${titre}`}
          elements={requete.data.items}
          cle={(c) => c.id}
          nom={nomDe}
          desactivee={!admin || ordonner.isPending}
          surOrdre={surOrdre}
          renderLigne={(c) => {
            const nombre = c.nombreElements ?? c.nombreBijouxPublies
            return (
              <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-body font-semibold text-ink-900">
                    {nomDe(c)}
                    {c.traductions.en?.nom ? (
                      <span className="ml-2 text-caption font-normal text-ink-700">
                        EN : {c.traductions.en.nom}
                      </span>
                    ) : null}
                  </p>
                  <p className="text-caption text-ink-700">
                    {nombre} {t('categorie.elements')}
                    {!c.visible ? (
                      <span className="ml-2 rounded-full border border-dashed border-sand-300 px-2 text-ink-700">
                        {t('categorie.masquee')}
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Interrupteur
                    libelle={`${t('categorie.visibleCourt')} — ${nomDe(c)}`}
                    libelleCourt={t('categorie.visibleCourt')}
                    actif={c.visible}
                    desactive={!admin || basculer.isPending}
                    surChange={() => basculer.mutate(c)}
                  />
                  {admin ? (
                    <>
                      <Bouton
                        variante="secondaire"
                        aria-label={`${t('categorie.modifier')} « ${nomDe(c)} »`}
                        onClick={() => setEdition(c)}
                      >
                        {t('categorie.modifier')}
                      </Bouton>
                      <Bouton
                        variante="discret"
                        aria-label={`${t('categorie.supprimer')} « ${nomDe(c)} »`}
                        onClick={() => setSuppression(c)}
                      >
                        {t('categorie.supprimer')}
                      </Bouton>
                    </>
                  ) : null}
                </div>
              </div>
            )
          }}
        />
      )}

      {edition ? (
        <DialogueCategorie
          famille={famille}
          categorie={edition === 'nouvelle' ? null : edition}
          surFermeture={() => setEdition(null)}
        />
      ) : null}
      {suppression ? (
        <Confirmation
          ouverte
          titre={t('categorie.supprimerTitre')}
          objet={nomDe(suppression)}
          consequence={
            (suppression.nombreElements ?? 0) > 0
              ? `${t('categorie.utiliseePar')} ${suppression.nombreElements ?? 0} ${t('categorie.elements')}. ${t('categorie.retirezDabord')}`
              : t('categorie.supprimerTexte')
          }
          libelleConfirmer={t('categorie.supprimer')}
          danger
          enCours={supprimer.isPending}
          surConfirmer={() => supprimer.mutate(suppression)}
          surAnnuler={() => setSuppression(null)}
        />
      ) : null}
    </section>
  )
}

/** Création ou modification : nom FR (obligatoire) et EN (facultatif), adresse, visibilité. */
function DialogueCategorie({
  famille,
  categorie,
  surFermeture,
}: {
  famille: FamilleCategorie
  categorie: Categorie | null
  surFermeture: () => void
}) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const [nomFr, setNomFr] = useState(categorie?.traductions.fr?.nom ?? '')
  const [nomEn, setNomEn] = useState(categorie?.traductions.en?.nom ?? '')
  const [slug, setSlug] = useState(categorie?.traductions.fr?.slug ?? '')
  const [slugManuel, setSlugManuel] = useState(Boolean(categorie))
  const [visible, setVisible] = useState(categorie?.visible ?? true)
  const [erreur, setErreur] = useState<{ champ: string; message: string } | null>(null)

  const enregistrer = useMutation({
    mutationFn: () => {
      const fr = { nom: nomFr.trim(), ...(slug.trim() ? { slug: slug.trim() } : {}) }
      // Une adresse anglaise existante est conservée par le serveur (§ 8).
      const en = nomEn.trim() ? { nom: nomEn.trim() } : null
      return categorie
        ? categories.modifier(categorie.id, {
            visible,
            traductions: { fr, en: en ?? (categorie.traductions.en ? null : undefined) },
            version: categorie.version,
          })
        : categories.creer({ famille, visible, traductions: { fr, ...(en ? { en } : {}) } })
    },
    onSuccess: () => {
      notifier.succes(t('formulaire.enregistre'))
      void client.invalidateQueries({ queryKey: ['categories'] })
      surFermeture()
    },
    onError: (e) => {
      if (aLeCode(e, 'RG-04')) {
        const suggestion = (e.details as { suggestion?: unknown } | undefined)?.suggestion
        setErreur({
          champ: 'slug',
          message: `${e.message}${typeof suggestion === 'string' ? ` « ${suggestion} »` : ''}`,
        })
        return
      }
      setErreur({ champ: estErreurApi(e) ? (e.champ ?? '') : '', message: messageErreur(e) })
    },
  })

  const soumettre = (evenement: FormEvent) => {
    evenement.preventDefault()
    if (!nomFr.trim()) {
      setErreur({ champ: 'nom', message: 'Nom obligatoire.' })
      return
    }
    setErreur(null)
    enregistrer.mutate()
  }
  const titre = categorie
    ? `${t('categorie.modifier')} « ${nomFr || '…'} »`
    : t('categorie.nouvelle')

  return (
    <BoiteDialogue
      ouverte
      surFermeture={surFermeture}
      titre={titre}
      actions={
        <Bouton type="submit" form="formulaire-categorie" disabled={enregistrer.isPending}>
          {enregistrer.isPending ? t('barre.enregistrementEnCours') : t('categorie.enregistrer')}
        </Bouton>
      }
    >
      <form id="formulaire-categorie" noValidate onSubmit={soumettre} className="space-y-4">
        <Champ
          libelle={`${t('categorie.nom')} (FR)`}
          required
          value={nomFr}
          maxLength={80}
          erreur={
            erreur?.champ === 'nom' || erreur?.champ.endsWith('fr.nom') ? erreur.message : undefined
          }
          onChange={(evenement) => {
            setNomFr(evenement.target.value)
            if (!slugManuel) setSlug(slugifier(evenement.target.value))
          }}
        />
        <Champ
          libelle={`${t('categorie.slug')} (FR)`}
          value={slug}
          erreur={
            erreur?.champ === 'slug' || erreur?.champ.endsWith('.slug') ? erreur.message : undefined
          }
          onChange={(evenement) => {
            setSlugManuel(true)
            setSlug(evenement.target.value)
          }}
        />
        <Champ
          libelle={`${t('categorie.nom')} (EN)`}
          value={nomEn}
          maxLength={80}
          onChange={(evenement) => setNomEn(evenement.target.value)}
        />
        <Interrupteur
          libelle={t('categorie.visible')}
          aide={t('categorie.visibleAide')}
          actif={visible}
          surChange={setVisible}
        />
        {erreur && !['nom', 'slug'].includes(erreur.champ) && !erreur.champ.includes('.') ? (
          <Alerte ton="erreur">{erreur.message}</Alerte>
        ) : null}
      </form>
    </BoiteDialogue>
  )
}
