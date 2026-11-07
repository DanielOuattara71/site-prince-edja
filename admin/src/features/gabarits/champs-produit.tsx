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

/**
 * Catégorie d'une famille (SCHEMAS § 3, RG-29) : seules les catégories de cette famille sont
 * proposées. Une famille sans catégorie le dit, sans rien inventer.
 */
export function SelecteurCategorie({
  id,
  libelle,
  aide,
  famille,
  valeur,
  surChange,
  erreur,
}: {
  id: string
  libelle: string
  aide?: string | undefined
  famille: FamilleCategorie
  valeur: string
  surChange: (id: string) => void
  erreur?: string | undefined
}) {
  const liste = useCategories(famille)
  const items = liste.data?.items ?? []
  return (
    <Select
      id={id}
      libelle={libelle}
      aide={liste.isSuccess && items.length === 0 ? t('categorie.aucuneDansFamille') : aide}
      invite={t('article.choisirCategorie')}
      disabled={!liste.isSuccess || items.length === 0}
      erreur={erreur}
      value={valeur}
      onChange={(e) => surChange(e.target.value)}
      options={items.map((c) => ({ valeur: c.id, libelle: nomCategorie(c) }))}
    />
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
