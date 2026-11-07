import { Link } from 'react-router'
import { ChevronRight } from 'lucide-react'
import { useSession } from '@/auth/contexte-session'
import { TitrePage } from '@/components/layout/TitrePage'
import { t, type CleTraduction } from '@/i18n/fr'
import { formaterDateHeure } from '@/lib/dates'

/**
 * Écran « Profil » (étape 9) : identité du compte connecté et accès au changement de mot
 * de passe. La langue de l’interface est fixe en français dans cette version ; le dictionnaire
 * permet d’activer l’anglais plus tard sans modifier cet écran.
 */
export default function Profil() {
  const { moi } = useSession()
  if (!moi) return null

  const { compte } = moi
  const lignes = [
    { libelle: t('profil.nom'), valeur: compte.nom },
    { libelle: t('profil.email'), valeur: compte.email },
    { libelle: t('profil.role'), valeur: t(`role.${compte.role}` as CleTraduction) },
    {
      libelle: t('profil.derniereConnexion'),
      valeur: compte.derniereConnexion
        ? formaterDateHeure(compte.derniereConnexion)
        : t('profil.aucuneConnexion'),
    },
  ]

  return (
    <section className="space-y-8">
      <TitrePage titre={t('profil.titre')}>{t('profil.titre')}</TitrePage>

      <dl className="grid gap-4 sm:grid-cols-2">
        {lignes.map((ligne) => (
          <div key={ligne.libelle} className="rounded-md border border-sand-200 bg-sand-100 p-5">
            <dt className="text-body text-ink-700">{ligne.libelle}</dt>
            <dd className="mt-1 font-semibold text-ink-900">{ligne.valeur}</dd>
          </div>
        ))}
      </dl>

      <div className="rounded-md border border-sand-200 p-5">
        <h2 className="font-semibold text-ink-900">{t('profil.motDePasse')}</h2>
        <p className="mt-2 text-body text-ink-700">{t('profil.motDePasseAide')}</p>
        <Link
          to="/changer-mot-de-passe"
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-md bg-clay-600 px-4 text-button font-semibold text-cream-100 hover:bg-clay-700"
        >
          {t('profil.motDePasse')}
          <ChevronRight aria-hidden className="size-5" />
        </Link>
      </div>

      <fieldset className="rounded-md border border-sand-200 p-5">
        <legend className="px-2 font-semibold text-ink-900">{t('profil.langue')}</legend>
        <label className="flex min-h-11 cursor-default items-center gap-3 px-2 text-body text-ink-900">
          <input
            type="radio"
            name="langue-interface"
            checked
            readOnly
            className="size-5 accent-clay-600"
          />
          {t('profil.langueFrancais')}
        </label>
        <label className="flex min-h-11 cursor-not-allowed items-center gap-3 px-2 text-body text-ink-500">
          <input type="radio" name="langue-interface" disabled className="size-5" />
          {t('profil.langueAnglais')}
        </label>
        <p className="mt-2 text-caption text-ink-700">{t('profil.langueNote')}</p>
      </fieldset>
    </section>
  )
}
