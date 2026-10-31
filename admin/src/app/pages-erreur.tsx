import { Link, useRouteError } from 'react-router'
import { CODES_CLIENT, estErreurApi } from '@/api/erreurs'
import { TitrePage } from '@/components/layout/TitrePage'
import { t } from '@/i18n/fr'

/** Pages d'erreur (section 9) : 403, 404 et erreur inattendue, avec retour au tableau de bord. */

function PageErreur({
  titre,
  texte,
  reference,
}: {
  titre: string
  texte: string
  reference?: string | undefined
}) {
  return (
    <section className="mx-auto max-w-2xl space-y-4 py-12">
      <TitrePage titre={titre}>{titre}</TitrePage>
      <p className="text-body-lg text-ink-700">{texte}</p>
      {reference ? (
        <p className="text-caption text-ink-700">
          {t('erreur.reference')} : <code className="font-mono">{reference}</code>
        </p>
      ) : null}
      <Link
        to="/"
        className="inline-flex min-h-11 items-center font-semibold text-clay-700 underline underline-offset-4"
      >
        {t('erreur.retourAccueil')}
      </Link>
    </section>
  )
}

export function AccesRefuse() {
  return <PageErreur titre={t('erreur.403.titre')} texte={t('erreur.403.texte')} />
}

export function Introuvable() {
  return <PageErreur titre={t('erreur.404.titre')} texte={t('erreur.404.texte')} />
}

/** `errorElement` du routeur : jamais de trace technique, seulement la référence (D-17). */
export function ErreurInattendue() {
  const erreur = useRouteError()
  if (estErreurApi(erreur) && erreur.status === 404) return <Introuvable />
  if (estErreurApi(erreur) && erreur.status === 403) return <AccesRefuse />
  const texte =
    estErreurApi(erreur) && erreur.code === CODES_CLIENT.reseau
      ? t('erreur.reseau')
      : t('erreur.500.texte')
  return (
    <main id="contenu" className="px-5">
      <PageErreur
        titre={t('erreur.500.titre')}
        texte={texte}
        reference={estErreurApi(erreur) ? erreur.requeteId : undefined}
      />
    </main>
  )
}
