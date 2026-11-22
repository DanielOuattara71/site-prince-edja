import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useState, type FormEvent } from 'react'
import { cles } from '@/api/cles'
import { identite } from '@/api/endpoints/reglages'
import type { Identite } from '@/api/schemas/reglages'
import { estErreurApi } from '@/api/erreurs'
import type { ModificationIdentite } from '@/api/schemas/reglages'
import { FilAriane } from '@/components/layout/FilAriane'
import { TitrePage } from '@/components/layout/TitrePage'
import { Champ } from '@/components/ui/Champ'
import { Bouton } from '@/components/ui/Bouton'
import { Alerte } from '@/components/ui/Alerte'
import { EtatErreur, EtatVide } from '@/components/ui/Etats'
import { Squelette } from '@/components/ui/Squelette'
import { useNotifications } from '@/components/retours/contexte-notifications'
import { t } from '@/i18n/fr'
import { messageErreur } from '@/lib/message-erreur'

/** Identité publique (contrat 1.20.0 § 37.2) : les champs que la maison remplit, rien de plus.
 *  Les valeurs vides restent vides — le site retombe alors sur son actif d'origine. */
interface Saisie {
  nom: string
  email: string
  linkedin: string
  localisation: string
  role: string
  signature: string
  manifeste: string
  devise: string
  mission: string
  tagline: string
  bio: string
  stats: Record<string, string>
  confirmer: boolean
}

interface StatPublique {
  cle: 'communaute' | 'pays' | 'distinctions' | 'experience' | 'portee'
  valeur: number | null
  suffixe?: string | null
  dateValidation?: string | null
  source?: string | null
  ordre: number
}

function depuis(donnees: Identite): Saisie {
  const traductions = (donnees['traductions'] ?? {}) as Record<string, Record<string, unknown>>
  const fr = traductions['fr'] ?? {}
  const chaine = (cle: string) => (typeof fr[cle] === 'string' ? (fr[cle] as string) : '')
  const liste = (cle: string) =>
    Array.isArray(fr[cle]) ? (fr[cle] as string[]).join('\n') : ''
  const stats: Record<string, string> = {}
  for (const s of (donnees['stats'] ?? []) as StatPublique[])
    stats[s.cle] = s.valeur === null ? '' : String(s.valeur)
  return {
    nom: donnees.nom ?? '',
    email: donnees.email ?? '',
    linkedin: (donnees['linkedin'] as string | null) ?? '',
    localisation: (donnees['localisation'] as string | null) ?? '',
    role: chaine('role'),
    signature: chaine('signature'),
    manifeste: chaine('manifeste'),
    devise: chaine('devise'),
    mission: chaine('mission'),
    tagline: liste('tagline'),
    bio: liste('bio'),
    stats,
    confirmer: false,
  }
}

function Formulaire({ donnees }: { donnees: Identite }) {
  const client = useQueryClient()
  const notifier = useNotifications()
  const [saisie, setSaisie] = useState<Saisie>(() => depuis(donnees))
  const initiale = depuis(donnees)
  const modifie =
    JSON.stringify({ ...saisie, confirmer: false }) !== JSON.stringify(initiale)

  const enregistrement = useMutation({
    mutationFn: () => {
      const statsBrutes = (donnees['stats'] ?? []) as StatPublique[]
      const valeur = (texte: string): number | null => {
        const n = Number(texte.replace(/\s/g, ''))
        return texte.trim() && Number.isFinite(n) ? n : null
      }
      const changement: ModificationIdentite = {
        nom: saisie.nom.trim() || undefined,
        email: saisie.email.trim() || undefined,
        linkedin: saisie.linkedin.trim() || null,
        localisation: saisie.localisation.trim() || null,
        role: saisie.role.trim() || undefined,
        signature: saisie.signature.trim() || undefined,
        manifeste: saisie.manifeste.trim() || undefined,
        devise: saisie.devise.trim() || null,
        mission: saisie.mission.trim() || null,
        tagline: saisie.tagline.split('\n').map((x) => x.trim()).filter(Boolean).slice(0, 3),
        bio: saisie.bio.split('\n').map((x) => x.trim()).filter(Boolean),
        stats: statsBrutes.map((s) => ({
          cle: s.cle,
          valeur: valeur(saisie.stats[s.cle] ?? ''),
          suffixe: s.suffixe ?? null,
          dateValidation: s.dateValidation ?? null,
          source: s.source ?? null,
        })),
        ...(saisie.signature !== initiale.signature || saisie.manifeste !== initiale.manifeste
          ? { confirmeModificationHero: saisie.confirmer }
          : {}),
        version: donnees.version,
      }
      return identite.modifier(changement)
    },
    onSuccess: (suivant) => {
      client.setQueryData(cles.identite(), suivant)
      notifier.succes(t('formulaire.enregistre'))
    },
    onError: (erreur) => {
      notifier.erreur(
        estErreurApi(erreur) && erreur.code === 'VERSION_PERIMEE'
          ? t('formulaire.versionPerimee')
          : messageErreur(erreur),
        estErreurApi(erreur) ? erreur.requeteId : undefined,
      )
    },
  })

  const champ = (cle: keyof Saisie, libelle: string) => (
    <Champ
      libelle={libelle}
      value={String(saisie[cle] ?? '')}
      onChange={(e) => setSaisie({ ...saisie, [cle]: e.target.value })}
    />
  )

  const surSoumission = (evenement: FormEvent) => {
    evenement.preventDefault()
    if (modifie) enregistrement.mutate()
  }

  return (
    <form className="max-w-3xl space-y-6" onSubmit={surSoumission}>
      <Alerte>{t('identite.intro')}</Alerte>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        {champ('nom', t('identite.nom'))}
        {champ('email', t('identite.email'))}
        {champ('linkedin', t('identite.linkedin'))}
        {champ('localisation', t('identite.localisation'))}
      </fieldset>
      <fieldset className="grid gap-4">
        {champ('role', t('identite.role'))}
        {champ('signature', t('identite.signature'))}
        {champ('manifeste', t('identite.manifeste'))}
        {champ('devise', t('identite.devise'))}
        {champ('mission', t('identite.mission'))}
      </fieldset>
      <fieldset className="grid gap-4">
        <label className="block space-y-2">
          <span className="label-caps text-ink-500">{t('identite.tagline')}</span>
          <textarea
            rows={3}
            className="w-full rounded-md border border-sand-200 bg-white px-4 py-3 text-body"
            value={saisie.tagline}
            onChange={(e) => setSaisie({ ...saisie, tagline: e.target.value })}
          />
        </label>
        <label className="block space-y-2">
          <span className="label-caps text-ink-500">{t('identite.bio')}</span>
          <textarea
            rows={8}
            className="w-full rounded-md border border-sand-200 bg-white px-4 py-3 text-body"
            value={saisie.bio}
            onChange={(e) => setSaisie({ ...saisie, bio: e.target.value })}
          />
        </label>
      </fieldset>
      {Object.keys(saisie.stats).length > 0 ? (
        <fieldset className="grid gap-4 sm:grid-cols-2">
          <p className="label-caps text-ink-700 sm:col-span-2">{t('identite.stats')}</p>
          {Object.entries(saisie.stats).map(([cle, valeur]) => (
            <Champ
              key={cle}
              libelle={cle}
              value={valeur}
              onChange={(e) =>
                setSaisie({ ...saisie, stats: { ...saisie.stats, [cle]: e.target.value } })
              }
            />
          ))}
        </fieldset>
      ) : null}
      {saisie.signature !== initiale.signature || saisie.manifeste !== initiale.manifeste ? (
        <label className="flex items-center gap-3 text-body text-ink-700">
          <input
            type="checkbox"
            checked={saisie.confirmer}
            onChange={(e) => setSaisie({ ...saisie, confirmer: e.target.checked })}
          />
          {t('identite.confirmerHero')}
        </label>
      ) : null}
      <Bouton type="submit" disabled={!modifie || enregistrement.isPending}>
        {t('barre.enregistrer')}
      </Bouton>
    </form>
  )
}

export default function Identite() {
  const requete = useQuery({ queryKey: cles.identite(), queryFn: () => identite.lire() })
  return (
    <section className="space-y-6">
      <FilAriane elements={[{ libelle: t('identite.titre') }]} />
      <TitrePage titre={t('identite.titre')}>{t('identite.titre')}</TitrePage>
      {requete.isPending ? (
        <Squelette lignes={8} />
      ) : requete.isError ? (
        <EtatErreur erreur={requete.error} surReessai={() => void requete.refetch()} />
      ) : !requete.data ? (
        <EtatVide titre={t('liste.vide')} />
      ) : (
        <Formulaire key={requete.data.version} donnees={requete.data} />
      )}
    </section>
  )
}
