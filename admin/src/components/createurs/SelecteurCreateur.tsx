import { useQuery } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { cles } from '@/api/cles'
import { createurs } from '@/api/endpoints/boutique'
import { useSession } from '@/auth/contexte-session'
import { Champ } from '@/components/ui/Champ'
import { EtatErreur } from '@/components/ui/Etats'
import { Select } from '@/components/ui/Select'
import { Squelette } from '@/components/ui/Squelette'
import { t } from '@/i18n/fr'

/**
 * Créateur d'un produit (section 10, RG-20) : créateurs publiés et actifs, recherche, et le
 * principal par défaut. **Se masque** quand `multiVendeurs` est faux : le serveur rattache
 * alors tout au principal.
 *
 * @example
 * <Controller control={control} name="createurId" render={({ field, fieldState }) => (
 *   <SelecteurCreateur valeur={field.value} surChange={field.onChange} erreur={fieldState.error?.message} />
 * )} />
 */
function useCreateurs(actif: boolean) {
  const liste = useQuery({
    queryKey: cles.createursSelectionnables(),
    queryFn: () => createurs.listerSelectionnables(),
    enabled: actif,
    staleTime: 60_000,
  })
  const principal = useQuery({
    queryKey: cles.createurPrincipal(),
    queryFn: () => createurs.principal(),
    enabled: actif,
    staleTime: Number.POSITIVE_INFINITY,
  })
  return { liste, principal }
}

export function SelecteurCreateur({
  valeur,
  surChange,
  erreur,
}: {
  valeur: string | null | undefined
  surChange: (id: string) => void
  erreur?: string | undefined
}) {
  const { moi } = useSession()
  const multiVendeurs = moi?.reglages.multiVendeurs ?? false
  const { liste, principal } = useCreateurs(multiVendeurs)
  const [recherche, setRecherche] = useState('')

  // Le principal est la valeur par défaut d'un nouveau produit (RG-20) : jamais inventée,
  // lue au serveur.
  const idPrincipal = principal.data?.id
  useEffect(() => {
    if (multiVendeurs && !valeur && idPrincipal) surChange(idPrincipal)
  }, [multiVendeurs, valeur, idPrincipal, surChange])

  if (!multiVendeurs) return null
  if (liste.isPending) return <Squelette lignes={1} />
  if (liste.isError)
    return <EtatErreur erreur={liste.error} surReessai={() => void liste.refetch()} />

  const terme = recherche.trim().toLowerCase()
  const options = liste.data.items
    .filter(
      (createur) =>
        !terme || createur.titre.toLowerCase().includes(terme) || createur.id === valeur,
    )
    .sort((a, b) => a.titre.localeCompare(b.titre, 'fr'))
    .map((createur) => ({
      valeur: createur.id,
      libelle:
        createur.id === idPrincipal
          ? `${createur.titre} (${t('createur.plateforme')})`
          : createur.titre,
    }))

  return (
    <fieldset className="space-y-2">
      <legend className="text-body font-semibold text-ink-900">{t('createur.titre')}</legend>
      {liste.data.items.length > 8 ? (
        <Champ
          type="search"
          libelle={t('createur.rechercher')}
          value={recherche}
          onChange={(evenement) => setRecherche(evenement.target.value)}
        />
      ) : null}
      <Select
        id="createurId"
        libelle={t('createur.choisir')}
        required
        erreur={erreur}
        value={valeur ?? ''}
        onChange={(evenement) => surChange(evenement.target.value)}
        options={options}
      />
    </fieldset>
  )
}

/** Filtre de liste par créateur (section 10). Se masque quand `multiVendeurs` est faux. */
export function FiltreCreateur({
  valeur,
  surChange,
}: {
  valeur: string | undefined
  surChange: (id: string | undefined) => void
}) {
  const { moi } = useSession()
  const multiVendeurs = moi?.reglages.multiVendeurs ?? false
  const { liste } = useCreateurs(multiVendeurs)
  if (!multiVendeurs) return null

  return (
    <Select
      libelle={t('createur.filtre')}
      value={valeur ?? ''}
      onChange={(evenement) => surChange(evenement.target.value || undefined)}
      disabled={!liste.isSuccess}
      options={[
        { valeur: '', libelle: t('createur.tous') },
        ...(liste.data?.items ?? []).map((createur) => ({
          valeur: createur.id,
          libelle: createur.titre,
        })),
      ]}
    />
  )
}
