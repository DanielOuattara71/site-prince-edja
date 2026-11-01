import { useMutation } from '@tanstack/react-query'
import { Plus } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { bijoux } from '@/api/endpoints/boutique'
import { estErreurApi } from '@/api/erreurs'
import type { Bijou, Variante } from '@/api/schemas/boutique'
import { useSession } from '@/auth/contexte-session'
import { ListeOrdonnable } from '@/components/listes/ListeOrdonnable'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { Alerte } from '@/components/ui/Alerte'
import { BoiteDialogue } from '@/components/ui/BoiteDialogue'
import { Bouton } from '@/components/ui/Bouton'
import { Case } from '@/components/ui/Case'
import { Champ } from '@/components/ui/Champ'
import { Confirmation } from '@/components/ui/Confirmation'
import { t } from '@/i18n/fr'
import { formatFCFA } from '@/lib/format'
import { messageErreur } from '@/lib/message-erreur'

/**
 * Variantes d'un bijou (contrat § 10.3, A-02) : l'unité qu'on demande ou qu'on achète. Toujours
 * au moins une (RG-10), dans tous les modes de la boutique : le contrat prime ici sur le prompt,
 * qui ne montrait le bloc qu'en vente en ligne (D-58). Le stock n'apparaît qu'en vente en ligne.
 * Chaque écriture a sa route et sa version ; le bijou est relu ensuite, sans effacer une saisie
 * en cours dans son formulaire.
 */
export function BlocVariantes({
  bijou,
  modifiable,
  surBijou,
}: {
  bijou: Bijou
  modifiable: boolean
  surBijou: (bijou: Bijou) => void
}) {
  const notifier = useNotifications()
  const [edition, setEdition] = useState<Variante | 'nouvelle' | null>(null)
  const [suppression, setSuppression] = useState<Variante | null>(null)

  const relire = async () => surBijou(await bijoux.lire(bijou.id))
  const signaler = (erreur: unknown) =>
    notifier.erreur(messageErreur(erreur), estErreurApi(erreur) ? erreur.requeteId : undefined)

  const ordonner = useMutation({
    mutationFn: (ids: string[]) => bijoux.variantes.ordonner(bijou.id, ids),
    onSettled: relire,
    onError: signaler,
  })
  const supprimer = useMutation({
    mutationFn: (v: Variante) => bijoux.variantes.supprimer(bijou.id, v.id, v.version),
    onSuccess: () => notifier.succes(t('formulaire.enregistre')),
    onError: signaler,
    onSettled: async () => {
      setSuppression(null)
      await relire()
    },
  })

  const resume = (v: Variante) =>
    [v.matiere, v.taille, v.prix === null ? null : formatFCFA(v.prix), v.disponible ? null : '—']
      .filter(Boolean)
      .join(' · ')

  return (
    <section
      aria-labelledby="titre-variantes"
      className="space-y-4 rounded-md border border-sand-200 p-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 id="titre-variantes" className="text-heading-sm font-semibold text-ink-900">
            {t('variante.titre')}
          </h2>
          <p className="max-w-2xl text-caption text-ink-700">{t('variante.intro')}</p>
        </div>
        {modifiable ? (
          <Bouton variante="secondaire" onClick={() => setEdition('nouvelle')}>
            <Plus aria-hidden className="size-4" />
            {t('variante.ajouter')}
          </Bouton>
        ) : null}
      </div>
      <ListeOrdonnable
        libelle={t('variante.ordre')}
        elements={bijou.variantes}
        cle={(v) => v.id}
        nom={(v) => v.reference}
        desactivee={!modifiable || ordonner.isPending}
        surOrdre={(nouvelles) => {
          surBijou({ ...bijou, variantes: nouvelles })
          ordonner.mutate(nouvelles.map((v) => v.id))
        }}
        renderLigne={(v) => (
          <div className="flex flex-1 flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-body font-semibold text-ink-900">
                {t('variante.libelle')} {v.reference}
                {v.disponible ? null : (
                  <span className="ml-2 text-caption font-normal text-ink-700">
                    ({t('variante.disponible').toLowerCase()} : non)
                  </span>
                )}
              </p>
              <p className="text-caption text-ink-700">{resume(v) || '—'}</p>
            </div>
            {modifiable ? (
              <div className="flex gap-2">
                <Bouton
                  variante="secondaire"
                  aria-label={`${t('categorie.modifier')} ${v.reference}`}
                  onClick={() => setEdition(v)}
                >
                  {t('categorie.modifier')}
                </Bouton>
                {bijou.variantes.length > 1 ? (
                  <Bouton
                    variante="discret"
                    aria-label={`${t('variante.supprimer')} ${v.reference}`}
                    onClick={() => setSuppression(v)}
                  >
                    {t('variante.supprimer')}
                  </Bouton>
                ) : null}
              </div>
            ) : null}
          </div>
        )}
      />
      {edition ? (
        <DialogueVariante
          bijou={bijou}
          variante={edition === 'nouvelle' ? null : edition}
          surFermeture={() => setEdition(null)}
          surEnregistree={async () => {
            setEdition(null)
            notifier.succes(t('variante.enregistree'))
            await relire()
          }}
        />
      ) : null}
      {suppression ? (
        <Confirmation
          ouverte
          titre={t('variante.supprimer')}
          objet={suppression.reference}
          consequence={t('variante.supprimerTexte')}
          libelleConfirmer={t('variante.supprimer')}
          danger
          enCours={supprimer.isPending}
          surConfirmer={() => supprimer.mutate(suppression)}
          surAnnuler={() => setSuppression(null)}
        />
      ) : null}
    </section>
  )
}

const entierOuNull = (s: string): number | null | 'invalide' => {
  if (!s.trim()) return null
  const brut = s.replace(/[\s  ]/g, '')
  return /^\d+$/.test(brut) ? Number(brut) : 'invalide'
}

/** Création ou modification d'une variante. Rien n'est prérempli : vide = non communiqué. */
function DialogueVariante({
  bijou,
  variante,
  surFermeture,
  surEnregistree,
}: {
  bijou: Bijou
  variante: Variante | null
  surFermeture: () => void
  surEnregistree: () => Promise<void>
}) {
  const { moi } = useSession()
  const enLigne = moi?.reglages.boutiqueEnLigne ?? false
  const [reference, setReference] = useState(variante?.reference ?? '')
  const [matiere, setMatiere] = useState(variante?.matiere ?? '')
  const [taille, setTaille] = useState(variante?.taille ?? '')
  const [prix, setPrix] = useState(
    variante?.prix === null || !variante ? '' : String(variante.prix),
  )
  const [ancienPrix, setAncienPrix] = useState(
    variante?.ancienPrix === null || !variante ? '' : String(variante.ancienPrix),
  )
  const [stock, setStock] = useState(
    variante?.stock === null || !variante ? '' : String(variante.stock),
  )
  const [disponible, setDisponible] = useState(variante?.disponible ?? true)
  const [erreurs, setErreurs] = useState<Record<string, string>>({})
  const [erreurGenerale, setErreurGenerale] = useState<string | null>(null)

  const enregistrer = useMutation({
    mutationFn: (corps: {
      prix: number | null
      ancienPrix: number | null
      stock: number | null
    }) => {
      const champs = {
        ...(reference.trim() ? { reference: reference.trim() } : {}),
        matiere: matiere.trim() || null,
        taille: taille.trim() || null,
        prix: corps.prix,
        ancienPrix: corps.ancienPrix,
        ...(enLigne || variante ? { stock: corps.stock } : {}),
        disponible,
      }
      return variante
        ? bijoux.variantes.modifier(bijou.id, variante.id, { ...champs, version: variante.version })
        : bijoux.variantes.creer(bijou.id, champs)
    },
    onSuccess: surEnregistree,
    onError: (e) => {
      if (estErreurApi(e) && e.champ) setErreurs({ [e.champ]: e.message })
      else setErreurGenerale(messageErreur(e))
    },
  })

  const soumettre = (evenement: FormEvent) => {
    evenement.preventDefault()
    evenement.stopPropagation()
    const lus = {
      prix: entierOuNull(prix),
      ancienPrix: entierOuNull(ancienPrix),
      stock: entierOuNull(stock),
    }
    const invalides = Object.fromEntries(
      Object.entries(lus).flatMap(([cle, valeur]) =>
        valeur === 'invalide' ? [[cle, 'Un nombre entier, sans décimale.']] : [],
      ),
    )
    if (lus.ancienPrix !== null && lus.ancienPrix !== 'invalide') {
      if (lus.prix === null || lus.prix === 'invalide' || lus.ancienPrix <= lus.prix) {
        invalides['ancienPrix'] = 'L’ancien prix exige un prix, et doit lui être supérieur.'
      }
    }
    setErreurs(invalides)
    setErreurGenerale(null)
    if (Object.keys(invalides).length > 0) return
    enregistrer.mutate({
      prix: lus.prix as number | null,
      ancienPrix: lus.ancienPrix as number | null,
      stock: lus.stock as number | null,
    })
  }

  return (
    <BoiteDialogue
      ouverte
      surFermeture={surFermeture}
      titre={variante ? `${t('variante.libelle')} ${variante.reference}` : t('variante.ajouter')}
      actions={
        <Bouton type="submit" form="formulaire-variante" disabled={enregistrer.isPending}>
          {enregistrer.isPending ? t('barre.enregistrementEnCours') : t('variante.enregistrer')}
        </Bouton>
      }
    >
      <form
        id="formulaire-variante"
        noValidate
        onSubmit={soumettre}
        className="grid gap-4 sm:grid-cols-2"
      >
        <Champ
          libelle={t('variante.reference')}
          aide={variante ? undefined : `${bijou.numero}-…`}
          value={reference}
          erreur={erreurs['reference']}
          onChange={(e) => setReference(e.target.value)}
        />
        <Champ
          libelle={t('variante.matiere')}
          value={matiere}
          erreur={erreurs['matiere']}
          onChange={(e) => setMatiere(e.target.value)}
        />
        <Champ
          libelle={t('variante.taille')}
          value={taille}
          erreur={erreurs['taille']}
          onChange={(e) => setTaille(e.target.value)}
        />
        <Champ
          libelle={t('variante.prix')}
          aide={t('variante.prixAide')}
          inputMode="numeric"
          value={prix}
          erreur={erreurs['prix']}
          onChange={(e) => setPrix(e.target.value)}
        />
        <Champ
          libelle={t('variante.ancienPrix')}
          inputMode="numeric"
          value={ancienPrix}
          erreur={erreurs['ancienPrix']}
          onChange={(e) => setAncienPrix(e.target.value)}
        />
        {enLigne ? (
          <Champ
            libelle={t('variante.stock')}
            aide={t('variante.stockAide')}
            inputMode="numeric"
            value={stock}
            erreur={erreurs['stock']}
            onChange={(e) => setStock(e.target.value)}
          />
        ) : null}
        <Case
          libelle={t('variante.disponible')}
          checked={disponible}
          onChange={(e) => setDisponible(e.target.checked)}
        />
        {erreurGenerale ? (
          <div className="sm:col-span-2">
            <Alerte ton="erreur">{erreurGenerale}</Alerte>
          </div>
        ) : null}
      </form>
    </BoiteDialogue>
  )
}
