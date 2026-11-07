import { useQuery } from '@tanstack/react-query'
import { Check } from 'lucide-react'
import { useState } from 'react'
import { useWatch, type Control } from 'react-hook-form'
import { partenaires, villes } from '@/api/endpoints/editorial'
import { Alerte } from '@/components/ui/Alerte'
import { Bouton } from '@/components/ui/Bouton'
import { Case } from '@/components/ui/Case'
import { MessageErreurChamp } from '@/components/ui/EnveloppeChamp'
import { Interrupteur } from '@/components/ui/Interrupteur'
import { Squelette } from '@/components/ui/Squelette'
import type { Valeurs } from '@/features/gabarits/declaratif'
import { t } from '@/i18n/fr'
import { cn } from '@/lib/cn'
import {
  TEMPLATE_DU_FORMAT,
  TEMPLATES,
  TEMPLATES_PROJET,
  type FormatProjet,
  type TemplateProjet,
} from '@/lib/templates'

/**
 * Choix du template d'un projet (PROPOSITION-TEMPLATES-PROJETS § 5) : une carte par template,
 * avec son usage, son projet de référence et ce que la page montre. Le format **propose** un
 * template (« Utiliser ») sans l'imposer. Sur un projet existant, changer de template dit ce qui
 * apparaîtra et ce qui ne s'affichera plus : aucune donnée n'est effacée.
 */
export function ChoixTemplate({
  id,
  libelle,
  aide,
  valeur,
  surChange,
  control,
  champFormat,
  existant,
  erreur,
}: {
  id: string
  libelle: string
  aide?: string | undefined
  valeur: string
  surChange: (template: string) => void
  control: Control<Valeurs>
  champFormat: string
  existant: boolean
  erreur?: string | undefined
}) {
  const format = useWatch({ control, name: champFormat }) as string | undefined
  // Le template enregistré, gardé au montage : base de la comparaison avant changement.
  const [initial] = useState(valeur)
  const propose = format ? TEMPLATE_DU_FORMAT[format as FormatProjet] : undefined
  const change = existant && initial && valeur && valeur !== initial

  const ids = (tpl: string) =>
    new Set(TEMPLATES[tpl as TemplateProjet]?.blocs.map((b) => b.libelle) ?? [])
  const avant = change ? ids(initial) : new Set<string>()
  const apres = change ? ids(valeur) : new Set<string>()

  return (
    <fieldset
      id={id}
      tabIndex={-1}
      aria-describedby={erreur ? `${id}-erreur` : undefined}
      className="space-y-3 focus:outline-none"
    >
      <legend className="text-body font-semibold text-ink-900">{libelle}</legend>
      {aide ? <p className="text-caption text-ink-700">{aide}</p> : null}
      {propose && propose !== valeur ? (
        <p className="flex flex-wrap items-center gap-2 text-caption text-ink-700">
          {t('template.propose')} : <strong>{TEMPLATES[propose].titre}</strong>
          <Bouton variante="secondaire" onClick={() => surChange(propose)}>
            {t('template.utiliserPropose')}
          </Bouton>
        </p>
      ) : null}
      <div className="grid gap-3">
        {TEMPLATES_PROJET.map((tpl) => {
          const description = TEMPLATES[tpl]
          const choisi = valeur === tpl
          return (
            <label
              key={tpl}
              className={cn(
                'block cursor-pointer rounded-xl border p-4 transition-colors duration-(--d-fast) has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-clay-600',
                choisi
                  ? 'border-ink-900 bg-sand-100'
                  : 'border-sand-200 bg-sand-50 hover:bg-sand-100',
              )}
            >
              <span className="flex items-start gap-3">
                <input
                  type="radio"
                  name={id}
                  value={tpl}
                  checked={choisi}
                  onChange={() => surChange(tpl)}
                  className="mt-1 size-5 accent-clay-600"
                />
                <span className="min-w-0 flex-1 space-y-1">
                  <span className="block font-semibold text-ink-900">{description.titre}</span>
                  <span className="block text-caption text-ink-700">{description.usage}</span>
                  <span className="block text-caption italic text-ink-700">
                    {description.reference}
                  </span>
                  <span className="sr-only">{t('template.blocs')} :</span>
                  <ol className="mt-2 flex flex-wrap gap-1" aria-label={t('template.blocs')}>
                    {description.blocs.map((b) => (
                      <li
                        key={b.id}
                        className={cn(
                          'rounded-full border px-2 py-0.5 text-caption',
                          b.facultatif
                            ? 'border-dashed border-sand-300 text-ink-700'
                            : 'border-sand-300 text-ink-900',
                        )}
                      >
                        {b.libelle}
                        {b.condition ? ` (${b.condition})` : ''}
                        {b.facultatif ? ` · ${t('template.facultatif')}` : ''}
                      </li>
                    ))}
                  </ol>
                </span>
                {choisi ? <Check aria-hidden className="size-5 shrink-0 text-ink-900" /> : null}
              </span>
            </label>
          )
        })}
      </div>
      {change ? (
        <Alerte ton="info">
          <p>{t('template.changement')}</p>
          <p className="mt-2">
            <strong>{t('template.apparaitront')} :</strong>{' '}
            {[...apres].filter((b) => !avant.has(b)).join(', ') || '—'}
          </p>
          <p>
            <strong>{t('template.disparaitront')} :</strong>{' '}
            {[...avant].filter((b) => !apres.has(b)).join(', ') || '—'}
          </p>
        </Alerte>
      ) : null}
      {erreur ? <MessageErreurChamp id={`${id}-erreur`}>{erreur}</MessageErreurChamp> : null}
    </fieldset>
  )
}

/** Blocs facultatifs du template choisi : un interrupteur « Afficher sur le site » chacun. */
export function BlocsFacultatifs({
  id,
  control,
  champTemplate,
  champFormat,
  masques,
  surChange,
  desactive,
}: {
  id: string
  control: Control<Valeurs>
  champTemplate: string
  champFormat: string
  masques: string[]
  surChange: (masques: string[]) => void
  desactive: boolean
}) {
  const valeur = useWatch({ control, name: champTemplate }) as string | undefined
  const format = useWatch({ control, name: champFormat }) as string | undefined
  const template = (valeur || (format ? TEMPLATE_DU_FORMAT[format as FormatProjet] : '')) as
    TemplateProjet | ''
  const facultatifs = template ? TEMPLATES[template].blocs.filter((b) => b.facultatif) : []
  if (facultatifs.length === 0) return null
  return (
    <fieldset id={id} className="space-y-2 rounded-md border border-sand-200 p-4">
      <legend className="px-1 text-body font-semibold text-ink-900">
        {t('template.blocsFacultatifs')}
      </legend>
      <p className="text-caption text-ink-700">{t('template.blocsFacultatifsAide')}</p>
      {facultatifs.map((b) => (
        <Interrupteur
          key={b.id}
          libelle={b.libelle}
          actif={!masques.includes(b.id)}
          desactive={desactive}
          surChange={(affiche) =>
            surChange(affiche ? masques.filter((m) => m !== b.id) : [...masques, b.id])
          }
        />
      ))}
    </fieldset>
  )
}

const SOURCES = { villes, partenaires } as const

/** Plusieurs contenus liés (escales, partenaires) : cases à cocher, dans l'ordre de leur liste. */
export function SelecteurRelations({
  id,
  libelle,
  aide,
  ressource,
  valeur,
  surChange,
  erreur,
}: {
  id: string
  libelle: string
  aide?: string | undefined
  ressource: keyof typeof SOURCES
  valeur: string[]
  surChange: (ids: string[]) => void
  erreur?: string | undefined
}) {
  const liste = useQuery({
    queryKey: [ressource, 'liste', 'relations'],
    queryFn: () => SOURCES[ressource].lister({ pageSize: 100 }),
    staleTime: 60_000,
  })
  return (
    <fieldset id={id} tabIndex={-1} className="space-y-1 focus:outline-none">
      <legend className="text-body font-semibold text-ink-900">{libelle}</legend>
      {aide ? <p className="text-caption text-ink-700">{aide}</p> : null}
      {liste.isPending ? (
        <Squelette lignes={2} />
      ) : (liste.data?.items ?? []).length === 0 ? (
        <p className="text-caption text-ink-700">{t('declaratif.aucun')}</p>
      ) : (
        (liste.data?.items ?? []).map((o) => (
          <Case
            key={o.id}
            libelle={o.titre || t('declaratif.sansTitre')}
            checked={valeur.includes(o.id)}
            onChange={(e) =>
              surChange(e.target.checked ? [...valeur, o.id] : valeur.filter((v) => v !== o.id))
            }
          />
        ))
      )}
      {erreur ? <MessageErreurChamp id={`${id}-erreur`}>{erreur}</MessageErreurChamp> : null}
    </fieldset>
  )
}
