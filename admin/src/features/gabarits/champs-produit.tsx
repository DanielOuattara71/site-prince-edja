import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useSession } from '@/auth/contexte-session'
import { peut } from '@/auth/permissions'
import { categories } from '@/api/endpoints/boutique'
import { cles } from '@/api/cles'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { useState, type FormEvent } from 'react'
import { messageErreur } from '@/lib/message-erreur'

import { Plus, Trash2 } from 'lucide-react'
import type { FamilleCategorie } from '@/api/schemas/boutique'
import { Bouton } from '@/components/ui/Bouton'
import { Case } from '@/components/ui/Case'
import { Champ } from '@/components/ui/Champ'
import { MessageErreurChamp } from '@/components/ui/EnveloppeChamp'
import { Select } from '@/components/ui/Select'
import { nomCategorie, useCategories } from '@/features/categories/useCategories'
import { varianteVide, type VarianteFormulaire } from '@/features/gabarits/declaratif'
import { t } from '@/i18n/fr'

type Edition = { type: 'creer' } | { type: 'modifier'; id: string; version: number }

/**
 * Catégorie d'une famille (SCHEMAS § 3, RG-29) : seules les catégories de cette famille sont
 * proposées. Une famille sans catégorie le dit, sans rien inventer.
 *
 * À partir du formulaire d'écriture (ex. : projet) : le bouton « Changer la catégorie » (admin,
 * droit `categories.modifier`) et le choix « Nouvelle catégorie » du select ouvrent une zone
 * inline d'ajout ou de modification — créer ou renommer la catégorie sans quitter l'écran.
 */
export function SelecteurCategorie({
  id,
  libelle,
  aide,
  famille,
  valeur,
  surChange,
  erreur,
  existant = false,
}: {
  id: string
  libelle: string
  aide?: string | undefined
  famille: FamilleCategorie
  valeur: string
  surChange: (id: string) => void
  erreur?: string | undefined
  /** Projet existant : la catégorie assignée, une fois choisie, est verrouillée. */
  existant?: boolean
}) {
  const liste = useCategories(famille)
  const items = liste.data?.items ?? []
  const modifiable = peut(useSession()?.moi?.compte, 'modifier', 'categories')
  const client = useQueryClient()
  const notifier = useNotifications()
  const [edition, setEdition] = useState<Edition | null>(null)
  const [nom, setNom] = useState('')

  const cible = items.find((c) => c.id === valeur)
  const verrou = Boolean(existant && valeur)

  const creer = useMutation({
    mutationFn: (entree: { nom: string }) =>
      categories.creer({ famille, traductions: { fr: { nom: entree.nom } } }),
    onSuccess: async (cree) => {
      setEdition(null)
      setNom('')
      await client.invalidateQueries({ queryKey: cles.categories() })
      surChange(cree.id)
    },
    onError: (erreurMutation) => notifier.erreur(messageErreur(erreurMutation)),
  })
  const renomer = useMutation({
    mutationFn: ({ idCible, nomCible, version }: { idCible: string; nomCible: string; version: number }) =>
      categories.modifier(idCible, { traductions: { fr: { nom: nomCible } }, version }),
    onSuccess: async () => {
      setEdition(null)
      notifier.succes(t('formulaire.enregistre'))
      await client.invalidateQueries({ queryKey: cles.categories() })
    },
    onError: (erreurMutation) => notifier.erreur(messageErreur(erreurMutation)),
  })
  function change(evenement: React.ChangeEvent<HTMLSelectElement>) {
    const valeurChoisie = evenement.target.value
    if (valeurChoisie === '__creer') {
      setNom('')
      setEdition({ type: 'creer' })
      return
    }
    setEdition(null)
    surChange(valeurChoisie)
  }
  function fermer() {
    setEdition(null)
    setNom('')
  }
  function soumettre(evenement: FormEvent) {
    evenement.preventDefault()
    if (!nom.trim()) return
    if (edition?.type === 'creer') creer.mutate({ nom: nom.trim() })
    else if (edition && cible)
      renomer.mutate({ idCible: cible.id, nomCible: nom.trim(), version: cible.version })
  }
  function passeEdition() {
    if (!cible) return
    setNom(cible.traductions.fr?.nom ?? '')
    setEdition({ type: 'modifier', id: cible.id, version: cible.version })
  }

  const editee = edition !== null

  return (
    <div className="space-y-2">
      <Select
        id={id}
        libelle={libelle}
        aide={liste.isSuccess && items.length === 0 ? t('categorie.aucuneDansFamille') : aide}
        invite={t('article.choisirCategorie')}
        disabled={!liste.isSuccess || verrou}
        erreur={erreur}
        value={edition === null ? valeur : ''}
        onChange={change}
        options={[
          ...items.map((c) => ({ valeur: c.id, libelle: nomCategorie(c) })),
          { valeur: '__creer', libelle: t('categorie.nouvelle') },
        ]}
      />
      {verrou ? (
        <p className="label-caps text-ink-700">{t('categorie.verrou')}</p>
      ) : null}
      <div className="flex flex-wrap items-center gap-2">
        {modifiable && !editee && valeur && !verrou ? (
          <Bouton variante="secondaire" onClick={passeEdition}>
            {t('categorie.changer')}
          </Bouton>
        ) : null}
        {editee ? (
          <div className="w-full rounded-md border border-sand-200 bg-sand-50 p-3 space-y-3">
            <Champ
              id={`${id}-nom`}
              libelle={t('categorie.nom')}
              required
              maxLength={80}
              value={nom}
              onChange={(evenement) => setNom(evenement.target.value)}
            />
            <div className="flex flex-wrap justify-end gap-2">
              <Bouton variante="secondaire" onClick={fermer}>
                {t('categorie.fermer')}
              </Bouton>
              <Bouton
                variante="secondaire"
                disabled={!nom.trim() || creer.isPending || renomer.isPending}
                onClick={soumettre}
              >
                {edition?.type === 'creer' ? t('categorie.creer') : t('categorie.enregistrer')}
              </Bouton>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}

type ErreursVariantes =
  | { message?: string }
  | (Partial<Record<keyof VarianteFormulaire, { message?: string }>> | undefined)[]
  | undefined

/**
 * Variantes d'un produit (ECRANS § 4.3, SCHEMAS § 8.4) : libellé (« Broché », « Relié »),
 * référence ou ISBN, prix, ancien prix, stock, disponible. Une ligne par variante, chaque champ
 * avec son libellé (lisible au lecteur d'écran et sur mobile). Un prix vide reste « non
 * communiqué » : jamais 0.
 */
export function EditeurVariantes({
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
  valeur: VarianteFormulaire[]
  surChange: (variantes: VarianteFormulaire[]) => void
  erreurs: unknown
  desactive: boolean
}) {
  const liste = erreurs as ErreursVariantes
  const erreurLigne = (i: number, cle: keyof VarianteFormulaire) =>
    Array.isArray(liste) ? liste[i]?.[cle]?.message : undefined
  const changer = (i: number, partiel: Partial<VarianteFormulaire>) =>
    surChange(valeur.map((v, rang) => (rang === i ? { ...v, ...partiel } : v)))

  return (
    <fieldset id={id} tabIndex={-1} className="space-y-3 focus:outline-none">
      <legend className="text-body font-semibold text-ink-900">{libelle}</legend>
      {aide ? <p className="text-caption text-ink-700">{aide}</p> : null}
      {valeur.length === 0 ? (
        <p className="text-body text-ink-700">{t('variantes.aucune')}</p>
      ) : null}
      <ol className="space-y-3">
        {valeur.map((v, i) => {
          const nom = v.libelle.trim() || `${t('variantes.variante')} ${i + 1}`
          return (
            <li key={v.id ?? `nouvelle-${i}`} className="rounded-md border border-sand-200 p-3">
              <fieldset className="grid gap-3 sm:grid-cols-3">
                <legend className="sr-only">{nom}</legend>
                <Champ
                  id={`${id}.${i}.libelle`}
                  libelle={t('variantes.libelle')}
                  required
                  maxLength={80}
                  value={v.libelle}
                  erreur={erreurLigne(i, 'libelle')}
                  onChange={(e) => changer(i, { libelle: e.target.value })}
                />
                <Champ
                  id={`${id}.${i}.reference`}
                  libelle={t('variantes.reference')}
                  maxLength={40}
                  value={v.reference}
                  onChange={(e) => changer(i, { reference: e.target.value })}
                />
                <Champ
                  id={`${id}.${i}.stock`}
                  libelle={t('variantes.stock')}
                  inputMode="numeric"
                  value={v.stock}
                  erreur={erreurLigne(i, 'stock')}
                  onChange={(e) => changer(i, { stock: e.target.value })}
                />
                <Champ
                  id={`${id}.${i}.prix`}
                  libelle={t('variantes.prix')}
                  inputMode="numeric"
                  value={v.prix}
                  erreur={erreurLigne(i, 'prix')}
                  onChange={(e) => changer(i, { prix: e.target.value })}
                />
                <Champ
                  id={`${id}.${i}.ancienPrix`}
                  libelle={t('variantes.ancienPrix')}
                  inputMode="numeric"
                  value={v.ancienPrix}
                  erreur={erreurLigne(i, 'ancienPrix')}
                  onChange={(e) => changer(i, { ancienPrix: e.target.value })}
                />
                <div className="flex items-end justify-between gap-2">
                  <Case
                    libelle={t('variantes.disponible')}
                    checked={v.disponible}
                    onChange={(e) => changer(i, { disponible: e.target.checked })}
                  />
                  {!desactive ? (
                    <Bouton
                      variante="discret"
                      aria-label={`${t('variantes.retirer')} « ${nom} »`}
                      onClick={() => surChange(valeur.filter((_, rang) => rang !== i))}
                    >
                      <Trash2 aria-hidden className="size-4" />
                    </Bouton>
                  ) : null}
                </div>
              </fieldset>
            </li>
          )
        })}
      </ol>
      {!desactive ? (
        <Bouton variante="secondaire" onClick={() => surChange([...valeur, varianteVide()])}>
          <Plus aria-hidden className="size-4" />
          {t('variantes.ajouter')}
        </Bouton>
      ) : null}
      {!Array.isArray(liste) && liste?.message ? (
        <MessageErreurChamp id={`${id}-erreur`}>{liste.message}</MessageErreurChamp>
      ) : null}
    </fieldset>
  )
}
