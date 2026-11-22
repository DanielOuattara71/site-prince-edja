import { useQuery } from '@tanstack/react-query'
import { ImageOff } from 'lucide-react'
import { medias } from '@/api/endpoints/contenus'
import { cles } from '@/api/cles'
import { useCategories } from '@/features/categories/useCategories'
import type { ContenuEditable } from '@/features/gabarits/useEditeurContenu'
import { t } from '@/i18n/fr'
import { formaterDate } from '@/lib/dates'

const AVANCEMENT_CLE = {
  disponible: 'projet.disponible',
  en_production: 'projet.en_production',
  en_preparation: 'projet.en_preparation',
} as const

/** Bloc d'affichage d'un projet : ce que le contrôleur donne à la fiche (structural wildcard). */
export interface ProjetFicheContenu extends ContenuEditable {
  traductions?: { fr?: { titre?: string; accroche?: string } } | undefined
  imageId?: string | null | undefined
  avancement?: keyof typeof AVANCEMENT_CLE | undefined
  format?: string | null | undefined
  categorieId?: string | null | undefined
  creeLe?: string | null | undefined
}

/**
 * En-tête de la fiche projet (contrat 1.8.0) : photo d'affiche, titre, accroche, catégorie,
 * état d'avancement, date de création. Réutilisé uniquement sur cette fiche.
 */
export default function ProjetEnTete({
  contenu,
}: {
  contenu: ProjetFicheContenu | null
}) {
  const imageId = contenu?.imageId ?? null
  const image = useQuery({
    queryKey: cles.media(imageId ?? ''),
    queryFn: () => medias.lire(imageId ?? ''),
    enabled: Boolean(imageId),
  })
  const nomsCategorie = useCategories('projet')
  const categorieId = contenu?.categorieId ?? null
  const categorieNom =
    categorieId != null
      ? (nomsCategorie.data?.items.find((c) => c.id === categorieId)?.traductions.fr?.nom ?? null)
      : null
  const creeLe = contenu?.creeLe ?? null
  const avancement = contenu?.avancement ?? null
  const apercuTitre = contenu?.traductions?.fr?.titre ?? '—'
  const apercuAccroche = contenu?.traductions?.fr?.accroche

  return (
    <div className="overflow-hidden rounded-xl border border-sand-200 bg-forest-950 text-cream-100">
      <div className="grid gap-6 p-4 sm:grid-cols-[10rem_1fr] sm:p-6">
        <div
          className="aspect-[4/5] w-full overflow-hidden rounded-lg border border-white/10 bg-night-800 max-sm:max-w-48"
        >
          {image.data ? (
            <img
              src={image.data.url}
              alt={image.data.traductions.fr?.texteAlt ?? ''}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center">
              <ImageOff aria-hidden className="size-8 text-cream-100/50" />
              <p className="text-caption text-cream-100/80">{t('projet.afficheManquante')}</p>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-2 self-end sm:self-center">
          <p className="label-caps text-cream-100/70">{t('menu.projets')}</p>
          <h1 className="font-display text-heading-md uppercase leading-tight text-cream-100">
            {typeof apercuTitre === 'string' && apercuTitre.trim() ? apercuTitre : '—'}
          </h1>
          {typeof apercuAccroche === 'string' && apercuAccroche.trim() ? (
            <p className="max-w-2xl text-body text-cream-100/85">{apercuAccroche}</p>
          ) : null}
          <dl className="mt-2 flex flex-wrap gap-x-8 gap-y-1 text-caption">
            {categorieNom ? (
              <>
                <dt className="sr-only">{t('projet.categorie')}</dt>
                <dd className="rounded-full border border-white/15 px-3 py-1 text-cream-100">
                  {categorieNom}
                </dd>
              </>
            ) : null}
            {avancement ? (
              <>
                <dt className="sr-only">{t('projet.avancement')}</dt>
                <dd className="rounded-full border border-white/15 px-3 py-1 text-cream-100">
                  {t(AVANCEMENT_CLE[avancement] as never)}
                </dd>
              </>
            ) : null}
            {creeLe ? (
              <>
                <dt className="sr-only">{t('projet.creeLe')}</dt>
                <dd className="tnum text-cream-100/75">
                  {t('projet.creeLe')} {formaterDate(creeLe)}
                </dd>
              </>
            ) : null}
          </dl>
        </div>
      </div>
    </div>
  )
}
