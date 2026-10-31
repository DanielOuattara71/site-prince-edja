import { LANGUES, type Langue } from '@/api/schemas/communs'
import { useSession } from '@/auth/contexte-session'
import { Champ } from '@/components/ui/Champ'
import { Onglets } from '@/components/ui/Onglets'
import { ZoneTexte } from '@/components/ui/ZoneTexte'
import { t, type CleTraduction } from '@/i18n/fr'
import { cn } from '@/lib/cn'
import { etatTraduction, type EtatTraduction, type ValeursTraduites } from '@/lib/traductions'

/**
 * Un champ, deux langues (section 10) : un onglet par langue, chacun avec son état
 * (« traduit », « à traduire », « vide »). Le français est la référence. Une langue inactive
 * (`reglages.languesActives`, § 2.1) reste saisissable mais facultative : rien n'est copié
 * d'une langue à l'autre.
 *
 * L'`id` de chaque contrôle est `traductions.<langue>.<nom>` : le résumé d'erreurs et les
 * `422` du serveur y mènent directement.
 *
 * @example
 * <Controller control={control} name="traductions" render={({ field }) => (
 *   <ChampTraduit nom="titre" libelle="Titre" requis
 *     valeurs={{ fr: field.value.fr?.titre, en: field.value.en?.titre }}
 *     surChange={(langue, titre) => field.onChange(avecTitre(field.value, langue, titre))} />
 * )} />
 */
const PASTILLES: Record<EtatTraduction, string> = {
  traduit: 'border-forest-900 text-forest-900',
  a_traduire: 'border-dashed border-clay-600 text-clay-700',
  vide: 'border-sand-300 text-ink-700',
}

export function ChampTraduit({
  nom,
  libelle,
  valeurs,
  surChange,
  multiligne = false,
  requis = false,
  aide,
  erreurs = {},
  maxLength,
}: {
  /** Nom du champ dans la traduction (`titre`, `extrait`…). */
  nom: string
  libelle: string
  valeurs: ValeursTraduites
  surChange: (langue: Langue, valeur: string) => void
  multiligne?: boolean
  /** Obligatoire dans les langues actives seulement. */
  requis?: boolean
  aide?: string
  erreurs?: Partial<Record<Langue, string | undefined>>
  maxLength?: number
}) {
  const { moi } = useSession()
  const actives = moi?.reglages.languesActives ?? ['fr']

  const onglets = LANGUES.map((langue) => {
    const etat = etatTraduction(langue, valeurs)
    const active = actives.includes(langue)
    const libelleLangue = t(`langue.${langue}` as CleTraduction)
    const proprietes = {
      id: `traductions.${langue}.${nom}`,
      libelle: `${libelle} (${langue.toUpperCase()})`,
      value: valeurs[langue] ?? '',
      required: requis && active,
      erreur: erreurs[langue],
      aide: active ? aide : `${t('traduction.inactive')}${aide ? ` ${aide}` : ''}`,
      ...(maxLength !== undefined ? { maxLength } : {}),
    }
    return {
      id: langue,
      libelle: libelleLangue,
      indicateur: (
        <span
          className={cn(
            'rounded-full border px-2 text-caption font-semibold',
            erreurs[langue] ? 'border-clay-700 text-clay-700' : PASTILLES[etat],
          )}
        >
          {erreurs[langue] ? t('traduction.erreur') : t(`traduction.${etat}` as CleTraduction)}
        </span>
      ),
      contenu: multiligne ? (
        <ZoneTexte
          {...proprietes}
          onChange={(evenement) => surChange(langue, evenement.target.value)}
        />
      ) : (
        <Champ
          {...proprietes}
          onChange={(evenement) => surChange(langue, evenement.target.value)}
        />
      ),
    }
  })

  return (
    <fieldset className="space-y-1">
      <legend className="sr-only">{libelle}</legend>
      <Onglets libelle={`${t('traduction.langues')} : ${libelle}`} onglets={onglets} />
    </fieldset>
  )
}
